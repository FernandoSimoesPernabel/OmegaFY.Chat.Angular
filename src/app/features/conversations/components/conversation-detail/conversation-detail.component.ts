import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { auditTime, timer } from 'rxjs';
import { CursorPagination } from '../../../../core/models/base/cursor-pagination';
import { MessageFromMemberModel } from '../../../../core/models/conversations/message-from-member-model';
import { SignalRConnectionStatus } from '../../../../core/models/signal-r/signal-r-connection-status';
import { SignalREventType } from '../../../../core/models/signal-r/signal-r-event-type';
import { SignalRService } from '../../../../core/services/signal-r.service';
import { DestroyableComponent } from '../../../../shared/components/base/destroyable-component';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChatFacade } from '../../facades/chat.facade';
import { ConversationHeaderDataComponent } from './components/conversation-header-data/conversation-header-data.component';
import { ConversationMyMessageComponent } from './components/conversation-my-message/conversation-my-message.component';
import { ConversationOthersMessageComponent } from './components/conversation-others-message/conversation-others-message.component';

const MESSAGES_PAGE_SIZE = 20;
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
        ConversationMyMessageComponent,
        ConversationOthersMessageComponent
    ],
    providers: [ComponentLoadingService],
    templateUrl: './conversation-detail.component.html',
    styleUrl: './conversation-detail.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationDetailComponent extends DestroyableComponent implements OnInit {
    protected readonly conversationId: string;

    protected readonly messages = signal<MessageFromMemberModel[]>([]);

    protected readonly hasMore = signal(false);

    private nextCursor: string | null = null;

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

        this.subscribeToSignalREvents();

        this.startTimerToRefreshMessages();
    }

    public async loadMoreMessages(): Promise<void> {
        if (this.loadingService.isLoading() || !this.hasMore() || !this.nextCursor)
            return;

        await this.loadMessagesPage(this.nextCursor, false);
    }

    private async refreshMessagesWithMerge(): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        const result = await this.chatFacade.getUserConversationMessages(this.conversationId, { take: MESSAGES_PAGE_SIZE, cursor: '' });

        if (!result.success)
            return;

        this.messages.set(this.orderMessagesBySendDate(this.mergeMessages(this.messages(), result.data.messages)));
    }

    private async loadMessagesPage(cursor: string | undefined, isRefresh: boolean): Promise<void> {
        const result = await this.loadingService.trackAsync(async () => {
            const pagination: CursorPagination<string> = { take: MESSAGES_PAGE_SIZE, cursor: cursor };
            return this.chatFacade.getUserConversationMessages(this.conversationId, pagination);
        });

        if (!result.success) {
            if (isRefresh) {
                this.resetValues();
            }

            this.notificationService.error('Não foi possível carregar as mensagens da conversa.');

            return;
        }

        const mergedMessages = isRefresh ? result.data.messages : this.mergeMessages(this.messages(), result.data.messages);

        this.messages.set(this.orderMessagesBySendDate(mergedMessages));
        this.hasMore.set(result.data.paginationInfo.hasMore);
        this.nextCursor = result.data.paginationInfo.nextCursor ?? null;
    }

    private resetValues(): void {
        this.messages.set([]);
        this.hasMore.set(false);
        this.nextCursor = null;
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
}