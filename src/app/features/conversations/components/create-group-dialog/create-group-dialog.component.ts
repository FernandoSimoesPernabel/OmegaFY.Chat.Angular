import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChatFacade } from '../../facades/chat.facade';
import { CreateGroupConversationRequest } from '../../../../core/models/conversations/create-group-conversation-request';

@Component({
    selector: 'app-create-group-dialog',
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule
    ],
    templateUrl: './create-group-dialog.component.html',
    styleUrl: './create-group-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateGroupDialogComponent {
    private readonly dialogRef = inject(MatDialogRef<CreateGroupDialogComponent>);

    private readonly chatFacade = inject(ChatFacade);

    private readonly notificationService = inject(NotificationService);

    protected readonly groupName = signal('');

    protected readonly maxMembers = signal(10);

    protected readonly isLoading = signal(false);

    public async createGroup(): Promise<void> {
        if (this.isLoading())
            return;

        const name = this.groupName().trim();
        const max = this.maxMembers();

        if (!name) {
            this.notificationService.error('Nome do grupo é obrigatório.');
            return;
        }

        if (max < 2) {
            this.notificationService.error('O número máximo de membros deve ser no mínimo 2.');
            return;
        }

        this.isLoading.set(true);

        try {
            const request: CreateGroupConversationRequest = {
                groupName: name,
                maxNumberOfMembers: max
            };

            const result = await this.chatFacade.createGroupConversation(request);

            if (!result.success) {
                this.notificationService.error('Não foi possível criar o grupo.');
                return;
            }

            this.dialogRef.close(result.data.conversationId);
        } finally {
            this.isLoading.set(false);
        }
    }

    public close(): void {
        this.dialogRef.close();
    }
}
