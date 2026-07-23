import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ConversationStatus } from '../../../../core/models/conversations/conversation-status';
import { ConversationType } from '../../../../core/models/conversations/conversation-type';
import { UserConversation } from '../../../../core/models/conversations/user-conversation';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChatFacade } from '../../facades/chat.facade';

@Component({
    selector: 'app-conversations',
    imports: [DatePipe, MatButtonModule, MatCardModule, LoadingOverlayComponent],
    providers: [ComponentLoadingService],
    templateUrl: './conversations.component.html',
    styleUrl: './conversations.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationsComponent implements OnInit {
    protected readonly loggedUserName = signal<string>('Usuário');

    protected readonly conversations = signal<UserConversation[]>([]);

    constructor(
        private readonly authService: AuthService,
        private readonly chatFacade: ChatFacade,
        private readonly router: Router,
        private readonly notificationService: NotificationService,
        public readonly loadingService: ComponentLoadingService) { }

    public async ngOnInit(): Promise<void> {
        this.setLoggedUserName();

        await this.loadConversations();
    }

    public async logoff(): Promise<void> {
        await this.authService.logout();

        this.notificationService.success('Sessão encerrada com sucesso.');

        await this.router.navigate(['/login']);
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

    private setLoggedUserName(): void {
        const loggedUserName = this.authService.getLoggedUserName();

        if (loggedUserName) 
            this.loggedUserName.set(loggedUserName);
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
}