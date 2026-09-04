import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css'],
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent { }
