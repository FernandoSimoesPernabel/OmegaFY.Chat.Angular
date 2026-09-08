import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChatFacade } from '../../facades/chat.facade';
import { CreateGroupConversationRequest } from '../../../../core/models/conversations/create-group-conversation-request';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';

@Component({
    selector: 'app-create-group-dialog',
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule
    ],
    providers: [ComponentLoadingService],
    templateUrl: './create-group-dialog.component.html',
    styleUrl: './create-group-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateGroupDialogComponent {
    private readonly dialogRef = inject(MatDialogRef<CreateGroupDialogComponent>);

    private readonly chatFacade = inject(ChatFacade);

    private readonly notificationService = inject(NotificationService);

    public readonly loadingService = inject(ComponentLoadingService);

    protected groupName = '';

    protected maxMembers = 10;

    public async createGroup(): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        const request: CreateGroupConversationRequest = {
            groupName: this.groupName.trim(),
            maxNumberOfMembers: this.maxMembers
        };

        if (!request.groupName) {
            this.notificationService.error('Nome do grupo é obrigatório.');
            return;
        }

        if (request.maxNumberOfMembers < 2) {
            this.notificationService.error('O número máximo de membros deve ser no mínimo 2.');
            return;
        }

        await this.loadingService.trackAsync(async () => {
            const result = await this.chatFacade.createGroupConversation(request);

            if (!result.success) {
                this.notificationService.error('Não foi possível criar o grupo.');
                return;
            }

            this.dialogRef.close(result.data.conversationId);
        });
    }

    public close(): void {
        this.dialogRef.close();
    }
}
