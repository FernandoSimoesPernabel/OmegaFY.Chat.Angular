import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MessageFromMemberModel } from '../../../../../../core/models/conversations/message-from-member-model';

@Component({
    selector: 'app-conversation-others-message',
    imports: [DatePipe],
    templateUrl: './conversation-others-message.component.html',
    styleUrl: './conversation-others-message.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationOthersMessageComponent {
    public readonly message = input.required<MessageFromMemberModel>();
}