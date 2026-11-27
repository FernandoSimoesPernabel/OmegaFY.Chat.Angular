import { Injectable } from '@angular/core';
import { NotificationService } from '../../../shared/services/notification.service';
import { MAX_GROUP_MEMBERS, MIN_GROUP_MEMBERS } from '../constants/group-limits.constants';

@Injectable({ providedIn: 'root' })
export class GroupDialogValidationService {
    constructor(private readonly notificationService: NotificationService) { }

    public validateForm(groupName: string, maxMembers: number): boolean {
        if (!groupName.trim()) {
            this.notificationService.error('Nome do grupo é obrigatório.');
            return false;
        }

        if (maxMembers < MIN_GROUP_MEMBERS) {
            this.notificationService.error(`O número máximo de membros deve ser no mínimo ${MIN_GROUP_MEMBERS}.`);
            return false;
        }

        if (maxMembers > MAX_GROUP_MEMBERS) {
            this.notificationService.error(`O número máximo de membros deve ser no máximo ${MAX_GROUP_MEMBERS}.`);
            return false;
        }

        return true;
    }
}