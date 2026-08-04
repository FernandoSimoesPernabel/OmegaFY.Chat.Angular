import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { SignalRConnectionStatus } from '../../../../../../core/models/signal-r/signal-r-connection-status';
import { SignalRService } from '../../../../../../core/services/signal-r.service';
import { DestroyableComponent } from '../../../../../../shared/components/base/destroyable-component';

@Component({
    selector: 'app-signalr-connection-loop',
    templateUrl: './signal-r-connection-loop.component.html',
    styleUrl: './signal-r-connection-loop.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalRConnectionLoopComponent extends DestroyableComponent implements OnInit, OnDestroy {
    private isConnectAttemptInProgress = false;

    constructor(private readonly signalRService: SignalRService) {
        super();
    }

    public ngOnInit(): void {
        timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.connectIfNeeded(); });
    }

    public ngOnDestroy(): void {
        this.signalRService.disconnect();
    }

    private async connectIfNeeded(): Promise<void> {
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