import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HealthCheckIndicatorComponent } from './shared/components/health-check-indicator/health-check-indicator.component';
import { SignalRConnectionLoopComponent } from './shared/components/signal-r-connection-loop/signal-r-connection-loop.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SignalRConnectionLoopComponent, HealthCheckIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App { }