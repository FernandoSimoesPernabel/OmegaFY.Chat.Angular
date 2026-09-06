import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { MessageFromMemberModel } from '../../../../../../core/models/conversations/message-from-member-model';
import { MemberMessageStatus } from '../../../../../../core/models/conversations/member-message-status';
import { ChatFacade } from '../../../../../../features/conversations/facades/chat.facade';
import { ConversationMyMessageComponent } from '../conversation-my-message/conversation-my-message.component';
import { ConversationOthersMessageComponent } from '../conversation-others-message/conversation-others-message.component';
import { ConversationMessageDeletedComponent } from '../conversation-message-deleted/conversation-message-deleted.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-conversation-message',
    imports: [ConversationMyMessageComponent, ConversationOthersMessageComponent, ConversationMessageDeletedComponent],
    templateUrl: './conversation-message.component.html',
    styleUrl: './conversation-message.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationMessageComponent {
    public readonly message = input.required<MessageFromMemberModel>();
    public readonly conversationId = input.required<string>();
    public readonly messageDeleted = output<MessageFromMemberModel>();

    protected readonly MemberMessageStatus = MemberMessageStatus;

    constructor(
        private readonly dialog: MatDialog,
        private readonly chatFacade: ChatFacade) { }

    protected async onMessageDelete(message: MessageFromMemberModel): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                title: 'Deletar mensagem',
                message: 'Tem certeza que deseja deletar esta mensagem? Esta ação não pode ser desfeita.',
                confirmButtonText: 'Deletar',
                cancelButtonText: 'Cancelar'
            }
        });

        const result = await firstValueFrom(dialogRef.afterClosed());

        if (!result)
            return;

        const deleteResult = await this.chatFacade.deleteMessage(this.conversationId(), message.messageId);

        if (!deleteResult.success)
            return;

        const deletedMessage: MessageFromMemberModel = {
            ...message,
            status: MemberMessageStatus.Deleted
        };
        this.messageDeleted.emit(deletedMessage);
    }
}
