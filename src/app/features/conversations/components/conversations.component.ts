import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-conversations',
    template: '<p>Conversations</p>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationsComponent { }
