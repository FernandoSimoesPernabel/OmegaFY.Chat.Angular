import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MessageFromMemberModel } from '../../../../../../core/models/conversations/message-from-member-model';
import { ConversationDateTimePipe } from '../../../../../../shared/pipes/conversation-date-time.pipe';

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

    public deleteMessage(): void {
        this.messageDeleted.emit(this.message());
    }
}