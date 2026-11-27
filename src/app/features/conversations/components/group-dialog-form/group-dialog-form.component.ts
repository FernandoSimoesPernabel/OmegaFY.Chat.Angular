import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DEFAULT_GROUP_MEMBERS, MAX_GROUP_MEMBERS, MIN_GROUP_MEMBERS } from '../../constants/group-limits.constants';

@Component({
    selector: 'app-group-dialog-form',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule
    ],
    templateUrl: './group-dialog-form.component.html',
    styleUrl: './group-dialog-form.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupDialogFormComponent {
    protected readonly MIN_MEMBERS = MIN_GROUP_MEMBERS;
    
    protected readonly MAX_MEMBERS = MAX_GROUP_MEMBERS;

    public readonly isLoading = input<boolean>(false);

    public readonly showPrefixIcons = input<boolean>(false);

    public readonly groupName = input<string>('');

    public readonly maxMembers = input<number>(DEFAULT_GROUP_MEMBERS);

    public readonly groupNameChange = output<string>();

    public readonly maxMembersChange = output<number>();

    protected onGroupNameChange(value: string): void {
        this.groupNameChange.emit(value);
    }

    protected onMaxMembersChange(value: number): void {
        this.maxMembersChange.emit(Math.max(Math.min(value, this.MAX_MEMBERS), this.MIN_MEMBERS));
    }
}