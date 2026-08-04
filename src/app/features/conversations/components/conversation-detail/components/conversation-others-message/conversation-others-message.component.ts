import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MessageFromMemberModel } from '../../../../../../core/models/conversations/message-from-member-model';
import { ConversationDateTimePipe } from '../../../../../../shared/pipes/conversation-date-time.pipe';

@Component({
    selector: 'app-conversation-others-message',
    imports: [ConversationDateTimePipe],
    templateUrl: './conversation-others-message.component.html',
    styleUrl: './conversation-others-message.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationOthersMessageComponent {
    public readonly message = input.required<MessageFromMemberModel>();
}