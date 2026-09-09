import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeGroupConfigRequest } from '../../../../../../core/models/conversations/change-group-config-request';
import { ConversationAndMembersModel } from '../../../../../../core/models/conversations/conversation-and-members-model';
import { ComponentLoadingService } from '../../../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { ChatFacade } from '../../../../facades/chat.facade';
import { GroupDialogValidationService } from '../../../../services/group-dialog-validation.service';
import { GroupDialogFormComponent } from '../../../shared/group-dialog-form/group-dialog-form.component';

@Component({
    selector: 'app-edit-group-dialog',
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        GroupDialogFormComponent
    ],
    providers: [ComponentLoadingService],
    templateUrl: './edit-group-dialog.component.html',
    styleUrl: './edit-group-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditGroupDialogComponent {
    protected groupName = signal<string>('');

    protected maxMembers = signal<number>(100);

    public constructor(
        private readonly dialogRef: MatDialogRef<EditGroupDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private readonly dialogData: { conversation: ConversationAndMembersModel },
        private readonly chatFacade: ChatFacade,
        private readonly notificationService: NotificationService,
        private readonly validationService: GroupDialogValidationService,
        public readonly loadingService: ComponentLoadingService) {

        if (this.dialogData.conversation?.groupConfig) {
            this.groupName.set(this.dialogData.conversation.groupConfig.groupName);
            this.maxMembers.set(this.dialogData.conversation.groupConfig.maxNumberOfMembers);
        }
    }

    public async saveChanges(): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        if (!this.validationService.validateForm(this.groupName(), this.maxMembers()))
            return;

        await this.loadingService.trackAsync(async () => {
            const request: ChangeGroupConfigRequest = {
                groupName: this.groupName().trim(),
                maxNumberOfMembers: this.maxMembers()
            };

            const result = await this.chatFacade.changeGroupConfig(this.dialogData.conversation.conversationId, request);

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