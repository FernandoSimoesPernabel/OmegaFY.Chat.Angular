import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-conversation-detail',
    imports: [RouterLink, MatButtonModule, MatCardModule],
    template: `
        <div class="conversation-detail-shell">
            <mat-card>
                <mat-card-header>
                    <mat-card-title>Conversation</mat-card-title>
                    <mat-card-subtitle>ID da conversa selecionada.</mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                    <p>{{ conversationId() }}</p>
                </mat-card-content>

                <mat-card-actions>
                    <button mat-button routerLink="/conversation">Voltar para lista</button>
                </mat-card-actions>
            </mat-card>
        </div>
    `,
    styles: [
        `
            .conversation-detail-shell {
                width: 100%;
                max-width: 960px;
                margin: 24px auto;
                padding: 0 16px;
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationDetailComponent {
    private readonly route = inject(ActivatedRoute);

    public readonly conversationId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
}