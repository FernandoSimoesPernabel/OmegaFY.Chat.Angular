import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private queue: Promise<void> = Promise.resolve();

    constructor(private readonly snackBar: MatSnackBar) { }

    public success(message: string): void {
        this.show('success', message);
    }

    public error(message: string): void {
        this.show('error', message);
    }

    public warning(message: string): void {
        this.show('warning', message);
    }

    private show(type: 'success' | 'error' | 'warning', message: string): void {
        const config: MatSnackBarConfig = {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['notification-snackbar', `notification-snackbar-${type}`]
        };

        this.queue = this.queue.catch(() => undefined).then(async () => {
            await firstValueFrom(this.snackBar.open(message, 'Fechar', config).afterDismissed());
        });
    }
}