import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { LoadingOverlayComponent } from '../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../shared/services/component-loading.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ChatFacade } from '../facades/chat.facade';
import { ConversationStatus } from '../models/conversation-status';
import { ConversationType } from '../models/conversation-type';
import { UserConversation } from '../models/user-conversation';

@Component({
    selector: 'app-conversations',
    imports: [DatePipe, MatCardModule, LoadingOverlayComponent],
    providers: [ComponentLoadingService],
    templateUrl: './conversations.component.html',
    styleUrl: './conversations.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationsComponent implements OnInit {
    public readonly conversations = signal<UserConversation[]>([]);

    constructor(
        private readonly chatFacade: ChatFacade,
        private readonly router: Router,
        private readonly notificationService: NotificationService,
        public readonly loadingService: ComponentLoadingService) { }

    public async ngOnInit(): Promise<void> {
        await this.loadConversations();
    }

    private async loadConversations(): Promise<void> {
        await this.loadingService.trackAsync(async () => {
            const result = await this.chatFacade.getUserConversations();

            if (!result.success) {
                this.conversations.set([]);
                this.notificationService.error('Não foi possível carregar as conversas.');
                return;
            }

            this.conversations.set(result.data.userConversations);
        });
    }

    public openConversation(conversationId: string): Promise<boolean> {
        return this.router.navigate(['/conversation', conversationId]);
    }

    public toConversationTypeLabel(type: ConversationType): string {
        switch (type) {
            case ConversationType.MemberToMember:
                return 'Direta';
            case ConversationType.GroupChat:
                return 'Grupo';
        }
    }

    public toConversationStatusLabel(status: ConversationStatus): string {
        switch (status) {
            case ConversationStatus.Open:
                return 'Aberta';
            case ConversationStatus.Closed:
                return 'Fechada';
        }
    }

    public getMessageDate(conversation: UserConversation): string | null {
        return conversation.lastMessage?.sendDate ?? null;
    }
}