import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MemberMessageStatus } from '../../../../../../core/models/conversations/member-message-status';
import { MessageFromMemberModel } from '../../../../../../core/models/conversations/message-from-member-model';
import { ConversationDateTimePipe } from '../../../../../../shared/pipes/conversation-date-time.pipe';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-conversation-my-message',
    imports: [ConversationDateTimePipe, MatButtonModule, MatTooltipModule],
    templateUrl: './conversation-my-message.component.html',
    styleUrl: './conversation-my-message.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationMyMessageComponent {
    public readonly message = input.required<MessageFromMemberModel>();
    public readonly messageDeleted = output<MessageFromMemberModel>();

    protected readonly MemberMessageStatus = MemberMessageStatus;

    constructor(private readonly dialog: MatDialog) { }

    public async deleteMessage(): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                title: 'Deletar mensagem',
                message: 'Tem certeza que deseja deletar esta mensagem? Esta ação não pode ser desfeita.',
                confirmButtonText: 'Deletar',
                cancelButtonText: 'Cancelar'
            }
        });

        const result = await dialogRef.afterClosed().toPromise();

        if (result) {
            const deletedMessage: MessageFromMemberModel = {
                ...this.message(),
                status: MemberMessageStatus.Deleted
            };
            this.messageDeleted.emit(deletedMessage);
        }
    }
}