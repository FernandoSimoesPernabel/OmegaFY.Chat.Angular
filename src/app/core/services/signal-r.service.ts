import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject, filter } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { AppConfigFile } from '../config/app-config-file';
import { SignalRConnectionStatus } from '../models/signal-r/signal-r-connection-status';
import { SignalREvent } from '../models/signal-r/signal-r-event';
import { SignalREventType } from '../models/signal-r/signal-r-event-type';

@Injectable({ providedIn: 'root' })
export class SignalRService {
    private readonly hubConnection!: signalR.HubConnection;

    private readonly events$ = new Subject<SignalREvent>();

    private readonly connectionStatusState = signal<SignalRConnectionStatus>(SignalRConnectionStatus.Disconnected);

    public readonly connectionStatus = this.connectionStatusState.asReadonly();

    constructor(
        private readonly appConfigFile: AppConfigFile,
        private readonly authService: AuthService) {

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.appConfigFile.API_OMEGAFY_CHAT_BASE_URL_HUB, { accessTokenFactory: () => this.authService.getToken()?.value ?? '' })
            .withAutomaticReconnect()
            .build();

        this.bindServerAndLifecycleEvents();
    }

    public async connect(): Promise<void> {
        try {
            if (this.hubConnection.state === signalR.HubConnectionState.Connected)
                return;

            await this.hubConnection.start();

            this.connectionStatusState.set(SignalRConnectionStatus.Connected);
        } catch (error: unknown) {
            this.syncConnectionStatus();
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this.hubConnection.state === signalR.HubConnectionState.Disconnected)
                return;

            await this.hubConnection.stop();

            this.connectionStatusState.set(SignalRConnectionStatus.Disconnected);
        } catch (error: unknown) {
            this.syncConnectionStatus();
        }
    }

    public listen(types: SignalREventType[]): Observable<SignalREvent> {
        return this.events$.pipe(
            filter(event => types.includes(event.type))
        );
    }

    private syncConnectionStatus(): void {
        switch (this.hubConnection.state) {
            case signalR.HubConnectionState.Connected:
                this.connectionStatusState.set(SignalRConnectionStatus.Connected);
                break;
            case signalR.HubConnectionState.Connecting:
            case signalR.HubConnectionState.Reconnecting:
                this.connectionStatusState.set(SignalRConnectionStatus.Reconnecting);
                break;
            default:
                this.connectionStatusState.set(SignalRConnectionStatus.Disconnected);
                break;
        }
    }

    private bindServerAndLifecycleEvents(): void {
        this.hubConnection.onreconnecting(() => {
            this.connectionStatusState.set(SignalRConnectionStatus.Reconnecting);
        });

        this.hubConnection.onreconnected(() => {
            this.connectionStatusState.set(SignalRConnectionStatus.Connected);
        });

        this.hubConnection.onclose(() => {
            this.connectionStatusState.set(SignalRConnectionStatus.Disconnected);
        });

        for (const type of Object.values(SignalREventType)) {
            this.hubConnection.off(type);

            this.hubConnection.on(type, (value) => {
                this.events$.next({ type, value });
            });
        }
    }
}