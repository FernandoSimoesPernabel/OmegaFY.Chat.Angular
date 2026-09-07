import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { ConversationAndMembersModel } from '../../../../../../core/models/conversations/conversation-and-members-model';
import { ConversationType } from '../../../../../../core/models/conversations/conversation-type';
import { DisplayNameInitialComponent } from '../../../../../../shared/components/display-name-initial/display-name-initial.component';
import { ConversationStatusLabelComponent } from '../../../../../../shared/components/conversation-status-label/conversation-status-label.component';
import { ConversationTypeLabelComponent } from '../../../../../../shared/components/conversation-type-label/conversation-type-label.component';
import { ConversationDateTimePipe } from '../../../../../../shared/pipes/conversation-date-time.pipe';
import { AuthService } from '../../../../../../core/auth/services/auth.service';
import { AddMembersDialogComponent } from '../add-members-dialog/add-members-dialog.component';

@Component({
    selector: 'app-conversation-members-dialog',
    imports: [MatButtonModule, MatDialogModule, DisplayNameInitialComponent, ConversationTypeLabelComponent, ConversationStatusLabelComponent, ConversationDateTimePipe],
    templateUrl: './conversation-members-dialog.component.html',
    styleUrl: './conversation-members-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationMembersDialogComponent {
    private readonly dialogRef = inject(MatDialogRef<ConversationMembersDialogComponent>);

    private readonly dialogData = inject<{ conversation: ConversationAndMembersModel }>(MAT_DIALOG_DATA);

    private readonly dialog = inject(MatDialog);

    private readonly authService = inject(AuthService);

    protected readonly conversationType = ConversationType;

    protected readonly conversation = this.dialogData.conversation;

    protected readonly isGroupChat = computed(() => this.conversation.type === ConversationType.GroupChat);

    protected readonly isCreator = computed(() => {
        const userId = this.authService.getLoggedUserId();
        return this.conversation.groupConfig?.createdByUserId === userId;
    });

    protected readonly canAddMembers = computed(() => this.isGroupChat() && this.isCreator());

    public openAddMembersDialog(): void {
        this.dialog.open(AddMembersDialogComponent, {
            data: {
                conversationId: this.conversation.conversationId,
                currentMembers: this.conversation.members
            },
            width: '560px',
            maxWidth: '95vw',
            autoFocus: false
        }).afterClosed().subscribe(() => {
            this.dialogRef.close({ refreshMembers: true });
        });
    }

    public close(): void {
        this.dialogRef.close();
    }
}
