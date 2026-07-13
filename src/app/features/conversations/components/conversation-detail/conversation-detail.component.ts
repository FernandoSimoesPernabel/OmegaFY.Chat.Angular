import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'app-conversation-detail',
    standalone: true,
    imports: [RouterLink, MatButtonModule, MatCardModule],
    templateUrl: './conversation-detail.component.html',
    styleUrls: ['./conversation-detail.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationDetailComponent {
    public readonly conversationId: string;

    constructor(private readonly route: ActivatedRoute) {
        this.conversationId = this.route.snapshot.paramMap.get('id') ?? '';
    }
}