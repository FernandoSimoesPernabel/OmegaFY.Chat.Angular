import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { HealthCheckStatus } from '../../../core/models/health-check/health-check-status';
import { HealthCheckService } from '../../../core/services/health-check.service';
import { DestroyableComponent } from '../base/destroyable-component';

@Component({
  selector: 'app-health-check-indicator',
  templateUrl: './health-check-indicator.component.html',
  styleUrls: ['./health-check-indicator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HealthCheckIndicatorComponent extends DestroyableComponent implements OnInit {

  public readonly healthStatus = signal<HealthCheckStatus | undefined>(undefined);

  constructor(private readonly healthCheckService: HealthCheckService) {
    super();
  }

  public async ngOnInit(): Promise<void> {
    timer(0, 30000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async () => {
      this.healthStatus.set(await this.healthCheckService.checkHealth());
    });
  }
}