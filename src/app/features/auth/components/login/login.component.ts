import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { LoginRequest } from '../../../../core/models/auth/login-request';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthFacade } from '../../facades/auth.facade';

@Component({
    selector: 'app-login',
    imports: [
        RouterLink,
        FormField,
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
    protected readonly loginModel = signal<LoginRequest>({
        email: '',
        password: '',
        rememberMe: true
    });

    protected readonly loginForm = form(this.loginModel, (loginForm) => {
        required(loginForm.email);
        email(loginForm.email);

        required(loginForm.password);
        minLength(loginForm.password, 10);
        maxLength(loginForm.password, 64);
    });

    constructor(
        private readonly authFacade: AuthFacade,
        private readonly router: Router,
        private readonly notificationService: NotificationService,
        public readonly loadingService: ComponentLoadingService) { }

    public async onSubmit(event: SubmitEvent): Promise<void> {
        event.preventDefault();

        if (this.loadingService.isLoading())
            return;

        await submit(this.loginForm, {
            onInvalid: () => { },
            action: async () => {
                await this.loadingService.trackAsync(async () => {
                    const result = await this.authFacade.login(this.loginForm().value());

                    if (result.success) {
                        this.notificationService.success('Login realizado com sucesso.');

                        await this.router.navigate(['/conversations']);

                        return;
                    }

                    this.notificationService.error('Usuário ou senha inválidos. Tente novamente.');
                });

                return undefined;
            }
        });
    }

    protected hasFieldError(field: 'email' | 'password', errorKind: string): boolean {
        return this.loginForm[field]().errors().some(error => error.kind === errorKind);
    }
}