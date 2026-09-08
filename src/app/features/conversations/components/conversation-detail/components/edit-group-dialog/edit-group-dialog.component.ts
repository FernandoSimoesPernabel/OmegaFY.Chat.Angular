import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { ChatFacade } from '../../../../facades/chat.facade';
import { ComponentLoadingService } from '../../../../../../shared/services/component-loading.service';
import { ChangeGroupConfigRequest } from '../../../../../../core/models/conversations/change-group-config-request';
import { ConversationAndMembersModel } from '../../../../../../core/models/conversations/conversation-and-members-model';

@Component({
    selector: 'app-edit-group-dialog',
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FormsModule
    ],
    providers: [ComponentLoadingService],
    templateUrl: './edit-group-dialog.component.html',
    styleUrl: './edit-group-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditGroupDialogComponent {
    private readonly dialogRef = inject(MatDialogRef<EditGroupDialogComponent>);

    private readonly dialogData = inject<{ conversation: ConversationAndMembersModel }>(MAT_DIALOG_DATA);

    private readonly chatFacade = inject(ChatFacade);

    private readonly notificationService = inject(NotificationService);

    public readonly loadingService = inject(ComponentLoadingService);

    protected groupName = '';

    protected maxMembers = 10;

    constructor() {
        const conversation = this.dialogData.conversation;
        if (conversation.groupConfig) {
            this.groupName = conversation.groupConfig.groupName;
            this.maxMembers = conversation.groupConfig.maxNumberOfMembers;
        }
    }

    public async saveChanges(): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        const request: ChangeGroupConfigRequest = {
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
            const conversation = this.dialogData.conversation;
            const result = await this.chatFacade.changeGroupConfig(conversation.conversationId, request);

            if (!result.success) {
                this.notificationService.error('Não foi possível atualizar o grupo.');
                return;
            }

            this.notificationService.success('Grupo atualizado com sucesso.');
            this.dialogRef.close({ updated: true });
        });
    }

    public close(): void {
        this.dialogRef.close();
    }
}
