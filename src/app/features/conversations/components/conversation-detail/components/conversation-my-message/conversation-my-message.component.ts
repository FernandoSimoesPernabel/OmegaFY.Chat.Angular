import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MessageFromMemberModel } from '../../../../../../core/models/conversations/message-from-member-model';
import { ConversationDateTimePipe } from '../../../../../../shared/pipes/conversation-date-time.pipe';

@Component({
    selector: 'app-conversation-my-message',
    imports: [ConversationDateTimePipe],
    templateUrl: './conversation-my-message.component.html',
    styleUrl: './conversation-my-message.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationMyMessageComponent {
    public readonly message = input.required<MessageFromMemberModel>();
}