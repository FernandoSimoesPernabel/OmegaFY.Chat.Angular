import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MemberMessageStatus } from '../../../../../../core/models/conversations/member-message-status';
import { MessageFromMemberModel } from '../../../../../../core/models/conversations/message-from-member-model';
import { ConversationDateTimePipe } from '../../../../../../shared/pipes/conversation-date-time.pipe';

@Component({
    selector: 'app-conversation-others-message',
    imports: [ConversationDateTimePipe, MatButtonModule, MatTooltipModule],
    templateUrl: './conversation-others-message.component.html',
    styleUrl: './conversation-others-message.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationOthersMessageComponent {
    public readonly message = input.required<MessageFromMemberModel>();
    public readonly messageDeleted = output<MessageFromMemberModel>();

    protected readonly MemberMessageStatus = MemberMessageStatus;

    public deleteMessage(): void {
        this.messageDeleted.emit(this.message());
    }
}