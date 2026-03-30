import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthFacade } from '../../facades/auth.facade';

@Component({
    selector: 'app-login',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        LoadingOverlayComponent
    ],
    providers: [ComponentLoadingService],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
    protected readonly loginForm: FormGroup;

    constructor(
        private readonly fb: FormBuilder,
        private readonly authFacade: AuthFacade,
        private readonly router: Router,
        private readonly notificationService: NotificationService,
        public readonly loadingService: ComponentLoadingService) {

        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(64)]],
            rememberMe: [false]
        });
    }

    public async onSubmit(): Promise<void> {
        if (this.loginForm.invalid || this.loadingService.isLoading()) return;

        await this.loadingService.trackAsync(async () => {
            const result = await this.authFacade.login(this.loginForm.getRawValue());

            if (result.success) {
                this.notificationService.success('Login realizado com sucesso.');

                await this.router.navigate(['/conversations']);

                return;
            }

            this.notificationService.error('Usuário ou senha inválidos. Tente novamente.');
        });
    }
}