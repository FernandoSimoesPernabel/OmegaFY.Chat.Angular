import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRConnectionLoopComponent } from './shared/components/signal-r-connection-loop/signal-r-connection-loop.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SignalRConnectionLoopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App { }