import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRConnectionLoopComponent } from '../../shared/components/signal-r-connection-loop/signal-r-connection-loop.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  imports: [RouterOutlet, SignalRConnectionLoopComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent { }
