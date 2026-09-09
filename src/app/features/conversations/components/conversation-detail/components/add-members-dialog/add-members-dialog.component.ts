import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MemberModel } from '../../../../../../core/models/conversations/member-model';
import { UserModel } from '../../../../../../core/models/conversations/user-model';
import { DisplayNameInitialComponent } from '../../../../../../shared/components/display-name-initial/display-name-initial.component';
import { LoadingOverlayComponent } from '../../../../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { ChatFacade } from '../../../../facades/chat.facade';

@Component({
    selector: 'app-add-members-dialog',
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatProgressSpinnerModule,
        LoadingOverlayComponent,
        DisplayNameInitialComponent
    ],
    providers: [ComponentLoadingService],
    templateUrl: './add-members-dialog.component.html',
    styleUrl: './add-members-dialog.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMembersDialogComponent {
    private readonly dialogRef = inject(MatDialogRef<AddMembersDialogComponent>);

    private readonly chatFacade = inject(ChatFacade);

    private readonly notificationService = inject(NotificationService);

    public readonly loadingService = inject(ComponentLoadingService);

    public readonly conversationId = input.required<string>();

    public readonly currentMembers = input.required<MemberModel[]>();

    protected readonly searchQuery = signal('');

    protected readonly availableUsers = signal<UserModel[]>([]);

    protected readonly filteredUsers = computed(() => {
        return this.availableUsers();
    });

    protected readonly isUserAlreadyMember = (userId: string): boolean => {
        return this.currentMembers().some(member => member.userId === userId);
    };

    constructor() {
        effect(async () => {
            await this.loadingService.trackAsync(async () => {
                const result = await this.chatFacade.getUsers({ displayName: this.searchQuery() });

                if (!result.success) {
                    this.notificationService.error('Não foi possível carregar a lista de usuários.');
                    this.availableUsers.set([]);
                    return;
                }

                this.availableUsers.set(result.data.users);
            });
        });
    }

    public async addMember(userId: string): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        await this.loadingService.trackAsync(async () => {
            const result = await this.chatFacade.addMemberToGroup(this.conversationId(), { userId });

            if (!result.success) {
                this.notificationService.error('Não foi possível adicionar o membro.');
                return;
            }

            const user = this.availableUsers().find(user => user.id === userId);

            if (user) {
                this.notificationService.success(`${user.displayName} foi adicionado ao grupo.`);
            }

            this.dialogRef.close({ memberId: result.data.memberId });
        });
    }

    public close(): void {
        this.dialogRef.close();
    }
}