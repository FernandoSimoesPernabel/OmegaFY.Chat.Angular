import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MessageFromMemberModel } from '../../../../../../core/models/conversations/message-from-member-model';

@Component({
    selector: 'app-conversation-message-deleted',
    imports: [],
    templateUrl: './conversation-message-deleted.component.html',
    styleUrl: './conversation-message-deleted.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationMessageDeletedComponent {
    public readonly message = input.required<MessageFromMemberModel>();
}
