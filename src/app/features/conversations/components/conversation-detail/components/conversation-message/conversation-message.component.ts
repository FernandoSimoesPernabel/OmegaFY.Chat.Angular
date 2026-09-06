import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MessageFromMemberModel } from '../../../../../../core/models/conversations/message-from-member-model';
import { MemberMessageStatus } from '../../../../../../core/models/conversations/member-message-status';
import { ConversationMyMessageComponent } from '../conversation-my-message/conversation-my-message.component';
import { ConversationOthersMessageComponent } from '../conversation-others-message/conversation-others-message.component';
import { ConversationMessageDeletedComponent } from '../conversation-message-deleted/conversation-message-deleted.component';

@Component({
    selector: 'app-conversation-message',
    imports: [ConversationMyMessageComponent, ConversationOthersMessageComponent, ConversationMessageDeletedComponent],
    templateUrl: './conversation-message.component.html',
    styleUrl: './conversation-message.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationMessageComponent {
    public readonly message = input.required<MessageFromMemberModel>();
    public readonly messageDeleted = output<MessageFromMemberModel>();

    protected readonly MemberMessageStatus = MemberMessageStatus;

    protected onMessageDeleted(message: MessageFromMemberModel): void {
        this.messageDeleted.emit(message);
    }
}
