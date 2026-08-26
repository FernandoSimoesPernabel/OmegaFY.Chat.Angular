import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HealthCheckIndicatorComponent } from './shared/components/health-check-indicator/health-check-indicator.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HealthCheckIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App { }