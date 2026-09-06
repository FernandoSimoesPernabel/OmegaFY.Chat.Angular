import { ChangeDetectionStrategy, Component, OnInit, ViewChildren, ElementRef, signal, QueryList, AfterViewInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { auditTime, timer } from 'rxjs';
import { CursorPagination } from '../../../../core/models/base/cursor-pagination';
import { GetUserConversationMessagesResult } from '../../../../core/models/conversations/get-user-conversation-messages-result';
import { MessageFromMemberModel } from '../../../../core/models/conversations/message-from-member-model';
import { MemberMessageStatus } from '../../../../core/models/conversations/member-message-status';
import { SignalRConnectionStatus } from '../../../../core/models/signal-r/signal-r-connection-status';
import { SignalREventType } from '../../../../core/models/signal-r/signal-r-event-type';
import { SignalRService } from '../../../../core/services/signal-r.service';
import { DestroyableComponent } from '../../../../shared/components/base/destroyable-component';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChatFacade } from '../../facades/chat.facade';
import { ConversationHeaderDataComponent } from './components/conversation-header-data/conversation-header-data.component';
import { ConversationMessageComponent } from './components/conversation-message/conversation-message.component';
import { SendMessageComponent } from './components/send-message/send-message.component';

const MESSAGES_PAGE_SIZE = 50;
const TIMER_REFRESH_INTERVAL = 10000;
const SIGNAL_R_REFRESH_INTERVAL = 3000;

@Component({
    selector: 'app-conversation-detail',
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        LoadingOverlayComponent,
        ConversationHeaderDataComponent,
        ConversationMessageComponent,
        SendMessageComponent
    ],
    providers: [ComponentLoadingService],
    templateUrl: './conversation-detail.component.html',
    styleUrl: './conversation-detail.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationDetailComponent extends DestroyableComponent implements OnInit, AfterViewInit {
    protected readonly conversationId: string;

    protected readonly messages = signal<MessageFromMemberModel[]>([]);

    protected readonly hasMore = signal(false);

    private readonly nextCursor = signal<string | undefined>(undefined);

    private readonly scrollPositionBeforeLoadMore = signal<number>(0);

    private readonly scrollHeightBeforeLoadMore = signal<number>(0);

    private readonly isUserAtBottom = signal<boolean>(true);

    private intersectionObserver?: IntersectionObserver;

    @ViewChildren('messageElements', { read: ElementRef }) private messageElements?: QueryList<ElementRef<HTMLElement>>;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly chatFacade: ChatFacade,
        private readonly notificationService: NotificationService,
        private readonly signalRService: SignalRService,
        public readonly loadingService: ComponentLoadingService) {

        super();

        this.conversationId = this.route.snapshot.paramMap.get('id') ?? '';
    }

    public async ngOnInit(): Promise<void> {
        if (!this.conversationId) {
            this.notificationService.error('Não foi possível identificar a conversa selecionada.');
            return;
        }

        await this.loadMessagesPage(undefined, true);

        this.scrollToBottom();

        this.setupScrollListener();

        this.subscribeToSignalREvents();

        this.startTimerToRefreshMessages();
    }

    public ngAfterViewInit(): void {
        this.setupIntersectionObserver();
    }

    public async loadMoreMessages(): Promise<void> {
        if (this.loadingService.isLoading() || !this.hasMore() || !this.nextCursor())
            return;

        const messagesContainer = document.querySelector('.messages-container') as HTMLDivElement | null;

        if (messagesContainer) {
            this.scrollPositionBeforeLoadMore.set(messagesContainer.scrollTop);
            this.scrollHeightBeforeLoadMore.set(messagesContainer.scrollHeight);
        }

        await this.loadMessagesPage(this.nextCursor(), false);

        if (messagesContainer) {
            timer(0).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                const heightDifference = messagesContainer.scrollHeight - this.scrollHeightBeforeLoadMore();
                messagesContainer.scrollTop = this.scrollPositionBeforeLoadMore() + heightDifference;
            });
        }
    }

    public onMessageSent(message: MessageFromMemberModel): void {
        this.messages.update(messages => [...messages, message]);
        this.scrollIfUserIsAtBottom();
    }

    public onMessageDeleted(deletedMessage: MessageFromMemberModel): void {
        this.messages.update(messages =>
            messages.map(m => m.messageId === deletedMessage.messageId ? deletedMessage : m)
        );
    }

    private async refreshMessagesWithMerge(): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        const result = await this.chatFacade.getUserConversationMessages(this.conversationId, { take: MESSAGES_PAGE_SIZE, cursor: '' });

        if (!result.success)
            return;

        this.messages.set(this.orderMessagesBySendDate(this.mergeMessages(this.messages(), result.data.messages)));

        this.scrollIfUserIsAtBottom();
    }

    private async loadMessagesPage(cursor: string | undefined, isPageLoad: boolean): Promise<void> {
        const result = await this.loadingService.trackAsync(async () => {
            const pagination: CursorPagination<string> = { take: MESSAGES_PAGE_SIZE, cursor: cursor };
            return this.chatFacade.getUserConversationMessages(this.conversationId, pagination);
        });

        if (!result.success) {
            if (isPageLoad) {
                this.resetValues();
            }

            this.notificationService.error('Não foi possível carregar as mensagens da conversa.');

            return;
        }

        this.setSignalValues(isPageLoad, result);
    }

    private setSignalValues(isPageLoad: boolean, result: { success: true; data: GetUserConversationMessagesResult; }) {
        const mergedMessages = isPageLoad ? result.data.messages : this.mergeMessages(this.messages(), result.data.messages);

        this.messages.set(this.orderMessagesBySendDate(mergedMessages));
        this.hasMore.set(result.data.paginationInfo.hasMore);
        this.nextCursor.set(result.data.paginationInfo.nextCursor ?? undefined);
    }

    private resetValues(): void {
        this.messages.set([]);
        this.hasMore.set(false);
        this.nextCursor.set(undefined);
    }

    private mergeMessages(existingMessages: MessageFromMemberModel[], incomingMessages: MessageFromMemberModel[]): MessageFromMemberModel[] {
        const messagesById = new Map(existingMessages.map(message => [message.messageId, message]));

        for (const incomingMessage of incomingMessages)
            messagesById.set(incomingMessage.messageId, incomingMessage);

        return Array.from(messagesById.values());
    }

    private orderMessagesBySendDate(messages: MessageFromMemberModel[]): MessageFromMemberModel[] {
        return [...messages].sort((firstMessage, secondMessage) => {
            return new Date(firstMessage.sendDate).getTime() - new Date(secondMessage.sendDate).getTime();
        });
    }

    private subscribeToSignalREvents(): void {
        this.signalRService.listen([SignalREventType.MessageReceived])
            .pipe(takeUntilDestroyed(this.destroyRef), auditTime(SIGNAL_R_REFRESH_INTERVAL))
            .subscribe((event) => {
                if (event.value === this.conversationId) {
                    this.refreshMessagesWithMerge();
                }
            });
    }

    private startTimerToRefreshMessages(): void {
        timer(TIMER_REFRESH_INTERVAL, TIMER_REFRESH_INTERVAL).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (this.signalRService.connectionStatus() !== SignalRConnectionStatus.Connected) {
                this.refreshMessagesWithMerge();
            }
        });
    }

    private scrollToBottom(): void {
        timer(0).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            const messagesContainer = document.querySelector('.messages-container') as HTMLDivElement | null;

            if (!messagesContainer)
                return;

            messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });

            this.isUserAtBottom.set(true);
        });
    }

    private scrollIfUserIsAtBottom(): void {
        if (this.isUserAtBottom())
            this.scrollToBottom();
    }

    private setupScrollListener(): void {
        const messagesContainer = document.querySelector('.messages-container') as HTMLDivElement | null;

        if (!messagesContainer)
            return;

        messagesContainer.addEventListener('scroll', () => {
            const isNearBottom = messagesContainer.scrollHeight - (messagesContainer.scrollTop + messagesContainer.clientHeight) <= 100;
            this.isUserAtBottom.set(isNearBottom);
        });
    }

    private setupIntersectionObserver(): void {
        const messagesContainer = document.querySelector('.messages-container') as HTMLDivElement | null;

        if (!messagesContainer || !this.messageElements)
            return;

        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.markMessageAsRead(entry.target);
                    }
                });
            },
            {
                root: messagesContainer,
                threshold: 0.5
            }
        );

        this.messageElements.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (!this.intersectionObserver || !this.messageElements)
                return;

            this.messageElements.forEach(element => {
                this.intersectionObserver!.observe(element.nativeElement);
            });
        });

        if (this.messageElements) {
            this.messageElements.forEach(element => {
                this.intersectionObserver!.observe(element.nativeElement);
            });
        }

        this.destroyRef.onDestroy(() => {
            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
            }
        });
    }

    private markMessageAsRead(element: Element): void {
        const messageId = element.getAttribute('data-message-id');

        if (!messageId)
            return;

        const messageIndex = this.messages().findIndex(m => m.messageId === messageId);

        if (messageIndex < 0)
            return;

        const message = this.messages()[messageIndex];

        if (!message || message.status === MemberMessageStatus.Read || message.isMessageFromMember)
            return;

        this.messages.update(messages =>
            messages.map((m, index) =>
                index === messageIndex && m.status === MemberMessageStatus.Unread
                    ? { ...m, status: MemberMessageStatus.Read }
                    : m
            )
        );
    }
}