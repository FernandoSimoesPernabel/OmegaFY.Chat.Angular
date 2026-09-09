import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CreateGroupConversationRequest } from '../../../../core/models/conversations/create-group-conversation-request';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChatFacade } from '../../facades/chat.facade';
import { GroupDialogValidationService } from '../../services/group-dialog-validation.service';
import { GroupDialogFormComponent } from '../shared/group-dialog-form/group-dialog-form.component';

@Component({
    selector: 'app-create-group-dialog',
    imports: [
        MatButtonModule,
        MatDialogModule,
        GroupDialogFormComponent
    ],
    providers: [ComponentLoadingService],
    templateUrl: './create-group-dialog.component.html',
    styleUrl: './create-group-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateGroupDialogComponent {
    protected groupName = signal<string>('');

    protected maxMembers = signal<number>(100);

    public constructor(
        private readonly dialogRef: MatDialogRef<CreateGroupDialogComponent>,
        private readonly chatFacade: ChatFacade,
        private readonly notificationService: NotificationService,
        private readonly validationService: GroupDialogValidationService,
        public readonly loadingService: ComponentLoadingService) { }

    public async createGroup(): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        if (!this.validationService.validateForm(this.groupName(), this.maxMembers()))
            return;

        await this.loadingService.trackAsync(async () => {
            const request: CreateGroupConversationRequest = {
                groupName: this.groupName().trim(),
                maxNumberOfMembers: this.maxMembers()
            };

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