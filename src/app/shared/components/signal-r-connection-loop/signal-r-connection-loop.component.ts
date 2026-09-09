import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { SignalRConnectionStatus } from '../../../core/models/signal-r/signal-r-connection-status';
import { SignalRService } from '../../../core/services/signal-r.service';
import { DestroyableComponent } from '../base/destroyable-component';

const SIGNAL_R_REFRESH_INTERVAL = 10000;

@Component({
    selector: 'app-signalr-connection-loop',
    templateUrl: './signal-r-connection-loop.component.html',
    styleUrl: './signal-r-connection-loop.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalRConnectionLoopComponent extends DestroyableComponent implements OnInit, OnDestroy {
    private isConnectAttemptInProgress = false;

    constructor(
        private readonly signalRService: SignalRService,
        private readonly authService: AuthService) {

        super();
    }

    public ngOnInit(): void {
        timer(0, SIGNAL_R_REFRESH_INTERVAL).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.checkAndConnectIfNeeded(); });
    }

    public ngOnDestroy(): void {
        this.signalRService.disconnect();
    }

    private async checkAndConnectIfNeeded(): Promise<void> {
        if (!this.authService.isAuthenticated())
            return;

        if (this.signalRService.connectionStatus() !== SignalRConnectionStatus.Disconnected || this.isConnectAttemptInProgress)
            return;

        this.isConnectAttemptInProgress = true;

        try {
            await this.signalRService.connect();
        } finally {
            this.isConnectAttemptInProgress = false;
        }
    }
}