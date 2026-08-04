import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ConversationType } from '../../../core/models/conversations/conversation-type';

@Component({
    selector: 'app-conversation-type-label',
    templateUrl: './conversation-type-label.component.html',
    styleUrl: './conversation-type-label.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationTypeLabelComponent {
    public readonly type = input.required<ConversationType>();

    protected readonly label = computed(() => {
        const conversationType = this.type();

        switch (conversationType) {
            case ConversationType.MemberToMember:
                return 'Direta';
            case ConversationType.GroupChat:
                return 'Grupo';
            default:
                return 'Desconhecido';
        }
    });
}