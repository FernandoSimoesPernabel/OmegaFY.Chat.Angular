import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ConversationStatus } from '../../../core/models/conversations/conversation-status';

@Component({
    selector: 'app-conversation-status-label',
    templateUrl: './conversation-status-label.component.html',
    styleUrl: './conversation-status-label.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationStatusLabelComponent {
    public readonly status = input.required<ConversationStatus>();

    protected readonly label = computed(() => {
        const conversationStatus = this.status();

        switch (conversationStatus) {
            case ConversationStatus.Open:
                return 'Aberta';
            case ConversationStatus.Closed:
                return 'Fechada';
            default:
                return 'Desconhecido';
        }
    });
}