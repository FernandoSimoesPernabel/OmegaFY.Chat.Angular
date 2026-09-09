import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../../../../core/auth/services/auth.service';
import { ConversationAndMembersModel } from '../../../../../../core/models/conversations/conversation-and-members-model';
import { ConversationType } from '../../../../../../core/models/conversations/conversation-type';
import { ConversationStatusLabelComponent } from '../../../../../../shared/components/conversation-status-label/conversation-status-label.component';
import { ConversationTypeLabelComponent } from '../../../../../../shared/components/conversation-type-label/conversation-type-label.component';
import { DisplayNameInitialComponent } from '../../../../../../shared/components/display-name-initial/display-name-initial.component';
import { ConversationDateTimePipe } from '../../../../../../shared/pipes/conversation-date-time.pipe';
import { ComponentLoadingService } from '../../../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { ChatFacade } from '../../../../facades/chat.facade';
import { AddMembersDialogComponent } from '../add-members-dialog/add-members-dialog.component';
import { EditGroupDialogComponent } from '../edit-group-dialog/edit-group-dialog.component';

@Component({
    selector: 'app-conversation-members-dialog',
    imports: [MatButtonModule, MatDialogModule, DisplayNameInitialComponent, ConversationTypeLabelComponent, ConversationStatusLabelComponent, ConversationDateTimePipe],
    providers: [ComponentLoadingService],
    templateUrl: './conversation-members-dialog.component.html',
    styleUrl: './conversation-members-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationMembersDialogComponent {
    protected readonly conversationType = ConversationType;

    protected readonly conversation = signal<ConversationAndMembersModel>(inject(MAT_DIALOG_DATA).conversation);

    protected readonly isGroupChat = computed(() => this.conversation().type === ConversationType.GroupChat);

    protected readonly isCreator = computed(() => {
        return this.conversation().groupConfig?.createdByUserId === this.authService.getLoggedUserId();
    });

    protected readonly canAddMembers = computed(() => this.isGroupChat() && this.isCreator());

    public constructor(
        private readonly dialogRef: MatDialogRef<ConversationMembersDialogComponent>,
        private readonly dialog: MatDialog,
        private readonly authService: AuthService,
        private readonly chatFacade: ChatFacade,
        private readonly notificationService: NotificationService,
        public readonly loadingService: ComponentLoadingService) { }

    public openAddMembersDialog(): void {
        this.dialog.open(AddMembersDialogComponent, {
            data: {
                conversationId: this.conversation().conversationId,
                currentMembers: this.conversation().members
            },
            width: '560px',
            maxWidth: '95vw',
            autoFocus: false
        }).afterClosed().subscribe(() => {
            this.dialogRef.close({ refreshMembers: true });
        });
    }

    public openEditGroupDialog(): void {
        this.dialog.open(EditGroupDialogComponent, {
            data: {
                conversation: this.conversation()
            },
            width: '560px',
            maxWidth: '95vw',
            autoFocus: false
        }).afterClosed().subscribe((result) => {
            if (result?.updated)
                this.dialogRef.close({ refreshMembers: true });
        });
    }

    public async removeMember(memberId: string): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        const confirmed = window.confirm('Tem certeza que deseja remover este membro do grupo?');

        if (!confirmed)
            return;

        await this.loadingService.trackAsync(async () => {
            const result = await this.chatFacade.removeMemberFromGroup(this.conversation().conversationId, memberId);

            if (!result.success) {
                this.notificationService.error('Não foi possível remover o membro.');
                return;
            }

            const updatedMembers = this.conversation().members.filter(member => member.memberId !== memberId);

            this.conversation.set({ ...this.conversation(), members: updatedMembers });

            this.notificationService.success('Membro removido com sucesso.');
        });
    }

    public close(): void {
        this.dialogRef.close();
    }
}