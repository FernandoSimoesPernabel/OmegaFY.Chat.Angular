import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { timer } from 'rxjs';
import { CursorPagination } from '../../../../core/models/base/cursor-pagination';
import { MessageFromMemberModel } from '../../../../core/models/conversations/message-from-member-model';
import { DestroyableComponent } from '../../../../shared/components/base/destroyable-component';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChatFacade } from '../../facades/chat.facade';
import { ConversationMyMessageComponent } from './components/conversation-my-message/conversation-my-message.component';
import { ConversationOthersMessageComponent } from './components/conversation-others-message/conversation-others-message.component';

const MESSAGES_PAGE_SIZE = 50;
const REFRESH_INTERVAL = 10000;

@Component({
    selector: 'app-conversation-detail',
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        LoadingOverlayComponent,
        ConversationMyMessageComponent,
        ConversationOthersMessageComponent
    ],
    providers: [ComponentLoadingService],
    templateUrl: './conversation-detail.component.html',
    styleUrl: './conversation-detail.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationDetailComponent extends DestroyableComponent implements OnInit {
    private readonly conversationId: string;

    protected readonly conversationDisplayName = signal<string>('');

    protected readonly messages = signal<MessageFromMemberModel[]>([]);

    protected readonly hasMore = signal(false);

    private nextCursor: string | null = null;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly chatFacade: ChatFacade,
        private readonly notificationService: NotificationService,
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

        timer(REFRESH_INTERVAL, REFRESH_INTERVAL).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.refreshMessagesWithMerge(); });
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
        this.conversationDisplayName.set(result.data.conversationDisplayName);
        this.hasMore.set(result.data.paginationInfo.hasMore);
        this.nextCursor = result.data.paginationInfo.nextCursor ?? null;
    }

    private resetValues(): void {
        this.messages.set([]);
        this.hasMore.set(false);
        this.conversationDisplayName.set('');
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
}