import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogData } from '../../models/dialogs/confirmation-dialog-data.model';

@Component({
    selector: 'app-confirmation-dialog',
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './confirmation-dialog.component.html',
    styleUrl: './confirmation-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent {
    private readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
    protected readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);

    public confirm(): void {
        this.dialogRef.close(true);
    }

    public cancel(): void {
        this.dialogRef.close(false);
    }
}
