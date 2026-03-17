import { Component } from '@angular/core';
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
})
export class LoginComponent {
    protected readonly loginForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authFacade: AuthFacade,
        private router: Router,
        private notificationService: NotificationService,
        public loadingService: ComponentLoadingService) {

        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(64)]],
            rememberMe: [false]
        });
    }

    public async onSubmit(): Promise<void> {
        if (this.loginForm.invalid || this.loadingService.isLoading()) return;

        try {
            await this.loadingService.trackAsync(async () => {
                const result = await this.authFacade.login(this.loginForm.getRawValue());

                if (result.success) {
                    this.notificationService.success('Login realizado com sucesso.');
                    await this.router.navigate(['/conversations']);
                    return;
                }

                if (result.validationErrors.length === 0) {
                    this.notificationService.error('Nao foi possivel realizar o login.');
                    return;
                }

                for (const error of result.validationErrors) {
                    this.notificationService.warning(error.message);
                }
            });
        } catch {
            this.notificationService.error('Erro ao conectar com o servidor. Tente novamente.');
        }
    }
}