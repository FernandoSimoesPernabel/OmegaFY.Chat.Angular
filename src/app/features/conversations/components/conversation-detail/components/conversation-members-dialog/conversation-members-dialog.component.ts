import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConversationAndMembersModel } from '../../../../../../core/models/conversations/conversation-and-members-model';
import { ConversationType } from '../../../../../../core/models/conversations/conversation-type';
import { DisplayNameInitialComponent } from '../../../../../../shared/components/base/display-name-initial/display-name-initial.component';
import { ConversationStatusLabelComponent } from '../../../../../../shared/components/conversation-status-label/conversation-status-label.component';
import { ConversationTypeLabelComponent } from '../../../../../../shared/components/conversation-type-label/conversation-type-label.component';
import { ConversationDateTimePipe } from '../../../../../../shared/pipes/conversation-date-time.pipe';

@Component({
    selector: 'app-conversation-members-dialog',
    imports: [MatButtonModule, MatDialogModule, DisplayNameInitialComponent, ConversationTypeLabelComponent, ConversationStatusLabelComponent, ConversationDateTimePipe],
    templateUrl: './conversation-members-dialog.component.html',
    styleUrl: './conversation-members-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationMembersDialogComponent {
    private readonly dialogRef = inject(MatDialogRef<ConversationMembersDialogComponent>);

    private readonly dialogData = inject<{ conversation: ConversationAndMembersModel }>(MAT_DIALOG_DATA);

    protected readonly conversationType = ConversationType;

    protected readonly conversation = this.dialogData.conversation;

    public close(): void {
        this.dialogRef.close();
    }
}