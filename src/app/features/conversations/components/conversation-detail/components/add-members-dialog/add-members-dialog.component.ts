import { ChangeDetectionStrategy, Component, computed, Inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, filter, skip } from 'rxjs';
import { MemberModel } from '../../../../../../core/models/conversations/member-model';
import { UserModel } from '../../../../../../core/models/conversations/user-model';
import { DestroyableComponent } from '../../../../../../shared/components/base/destroyable-component';
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
export class AddMembersDialogComponent extends DestroyableComponent {
    protected readonly searchQuery = signal('');

    protected readonly availableUsers = signal<UserModel[]>([]);

    protected readonly filteredUsers = computed(() => {
        return this.availableUsers().filter(user => user.id !== this.dialogData.groupCreatorUserId);
    });

    protected readonly isUserAlreadyMember = (userId: string): boolean => {
        return this.dialogData.currentMembers.some(member => member.userId === userId);
    };

    constructor(
        private readonly dialogRef: MatDialogRef<AddMembersDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private readonly dialogData: {
            conversationId: string;
            currentMembers: MemberModel[];
            groupCreatorUserId: string | null;
        },
        private readonly chatFacade: ChatFacade,
        private readonly notificationService: NotificationService,
        public readonly loadingService: ComponentLoadingService) {

        super();

        toObservable(this.searchQuery)
            .pipe(
                skip(1),
                filter(query => query.length > 3),
                debounceTime(1000),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                void this.loadUsers();
            });

        void this.loadUsers();
    }

    public onSearchQueryChange(value: string): void {
        this.searchQuery.set(value);
    }

    public async addMember(userId: string): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        if (this.isUserAlreadyMember(userId)) {
            this.notificationService.warning('Este usuário já está na conversa.');
            return;
        }

        await this.loadingService.trackAsync(async () => {
            const result = await this.chatFacade.addMemberToGroup(this.dialogData.conversationId, { userId });

            if (!result.success) {
                this.notificationService.error('Não foi possível adicionar o membro.');
                return;
            }

            const user = this.availableUsers().find(user => user.id === userId);

            if (user)
                this.notificationService.success(`${user.displayName} foi adicionado ao grupo.`);

            this.dialogRef.close({ memberId: result.data.memberId });
        });
    }

    public async removeMember(userId: string): Promise<void> {
        if (this.loadingService.isLoading())
            return;

        const member = this.dialogData.currentMembers.find(item => item.userId === userId);

        if (!member) {
            this.notificationService.warning('Este usuário não está na conversa.');
            return;
        }

        await this.loadingService.trackAsync(async () => {
            const result = await this.chatFacade.removeMemberFromGroup(this.dialogData.conversationId, member.memberId);

            if (!result.success) {
                this.notificationService.error('Não foi possível remover o membro.');
                return;
            }

            const user = this.availableUsers().find(item => item.id === userId);

            if (user)
                this.notificationService.success(`${user.displayName} foi removido do grupo.`);

            this.dialogRef.close({ removedMemberId: member.memberId });
        });
    }

    public close(): void {
        this.dialogRef.close();
    }

    private async loadUsers(): Promise<void> {
        await this.loadingService.trackAsync(async () => {
            const result = await this.chatFacade.getUsers({ displayName: this.searchQuery().trim() });

            if (!result.success) {
                this.notificationService.error('Não foi possível carregar a lista de usuários.');
                this.availableUsers.set([]);
                return;
            }

            this.availableUsers.set(result.data.users);
        });
    }
}