import { Injectable } from '@angular/core';
import { NotificationService } from '../../../shared/services/notification.service';

@Injectable({ providedIn: 'root' })
export class GroupDialogValidationService {
    constructor(private readonly notificationService: NotificationService) { }

    public validateForm(groupName: string, maxMembers: number): boolean {
        if (!groupName.trim()) {
            this.notificationService.error('Nome do grupo é obrigatório.');
            return false;
        }

        if (maxMembers < 2) {
            this.notificationService.error('O número máximo de membros deve ser no mínimo 2.');
            return false;
        }

        if (maxMembers > 100) {
            this.notificationService.error('O número máximo de membros deve ser no máximo 100.');
            return false;
        }

        return true;
    }
}