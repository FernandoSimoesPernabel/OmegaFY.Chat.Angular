import { ChangeDetectionStrategy, Component, OnInit, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ConversationAndMembersModel } from '../../../../../../core/models/conversations/conversation-and-members-model';
import { ConversationType } from '../../../../../../core/models/conversations/conversation-type';
import { ConversationStatusLabelComponent } from '../../../../../../shared/components/conversation-status-label/conversation-status-label.component';
import { ConversationTypeLabelComponent } from '../../../../../../shared/components/conversation-type-label/conversation-type-label.component';
import { LoadingOverlayComponent } from '../../../../../../shared/components/loading-overlay/loading-overlay.component';
import { ConversationDateTimePipe } from '../../../../../../shared/pipes/conversation-date-time.pipe';
import { ComponentLoadingService } from '../../../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { ChatFacade } from '../../../../facades/chat.facade';
import { ConversationMembersDialogComponent } from '../conversation-members-dialog/conversation-members-dialog.component';

@Component({
    selector: 'app-conversation-header-data',
    imports: [
        ConversationDateTimePipe,
        MatButtonModule,
        MatCardModule,
        LoadingOverlayComponent,
        ConversationTypeLabelComponent,
        ConversationStatusLabelComponent
    ],
    providers: [ComponentLoadingService],
    templateUrl: './conversation-header-data.component.html',
    styleUrl: './conversation-header-data.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationHeaderDataComponent implements OnInit {
    protected readonly conversationType = ConversationType;

    protected readonly conversation = signal<ConversationAndMembersModel | null>(null);

    protected readonly membersPreview = computed(() => {
        const members = this.conversation()?.members ?? [];
        return members.slice(0, 3);
    });

    protected readonly remainingMembersCount = computed(() => {
        const membersCount = this.conversation()?.members.length ?? 0;
        return Math.max(0, membersCount - this.membersPreview().length);
    });

    public readonly conversationId = input.required<string>();

    constructor(
        private readonly chatFacade: ChatFacade,
        private readonly dialog: MatDialog,
        private readonly notificationService: NotificationService,
        public readonly loadingService: ComponentLoadingService) { }

    public async ngOnInit(): Promise<void> {
        await this.loadConversationData();
    }

    public openMembersModal(): void {
        const conversation = this.conversation();

        if (!conversation)
            return;

        this.dialog.open(ConversationMembersDialogComponent, {
            data: { conversation: conversation },
            width: '560px',
            maxWidth: '95vw',
            autoFocus: false
        });
    }

    private async loadConversationData(): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        const currentConversationId = this.conversationId();

        if (!currentConversationId) {
            this.conversation.set(null);
            this.notificationService.error('Não foi possível identificar os dados da conversa.');
            return;
        }

        const result = await this.loadingService.trackAsync(async () => {
            return this.chatFacade.getConversationById(currentConversationId);
        });

        if (!result.success) {
            this.conversation.set(null);
            this.notificationService.error('Não foi possível carregar os dados da conversa.');
            return;
        }

        this.conversation.set(result.data.conversation);
    }
}