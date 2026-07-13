import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, email, form, maxLength, minLength, required, submit, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { RegisterNewUserRequest } from '../../../../core/models/auth/register-new-user-request';
import { ValidationError } from '../../../../core/models/base/validation-error';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthFacade } from '../../facades/auth.facade';

@Component({
    selector: 'app-register',
    imports: [
        RouterLink,
        FormField,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        LoadingOverlayComponent
    ],
    providers: [ComponentLoadingService],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
    protected readonly validationErrors = signal<ValidationError[]>([]);

    protected readonly registerModel = signal<RegisterNewUserRequest & { confirmPassword: string }>({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    protected readonly registerForm = form(this.registerModel, (registerForm) => {
        required(registerForm.displayName);
        minLength(registerForm.displayName, 3);
        maxLength(registerForm.displayName, 100);

        required(registerForm.email);
        email(registerForm.email);

        required(registerForm.password);
        minLength(registerForm.password, 10);
        maxLength(registerForm.password, 64);

        required(registerForm.confirmPassword);
        minLength(registerForm.confirmPassword, 10);
        maxLength(registerForm.confirmPassword, 64);

        validate(registerForm.confirmPassword, ({ value, valueOf }) => {
            const password = valueOf(registerForm.password);
            const confirmPassword = value();

            if (!password || !confirmPassword)
                return undefined;

            return password === confirmPassword
                ? undefined
                : {
                    kind: 'passwordMismatch',
                    message: 'As senhas devem ser iguais'
                };
        });
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

        this.validationErrors.set([]);

        await submit(this.registerForm, {
            onInvalid: () => { },
            action: async () => {
                await this.loadingService.trackAsync(async () => {
                    const { confirmPassword, ...request } = this.registerForm().value();
                    const result = await this.authFacade.registerNewUser(request);

                    if (result.success) {
                        this.notificationService.success('Conta criada com sucesso.');

                        await this.router.navigate(['/conversations']);

                        return;
                    }

                    this.validationErrors.set(result.validationErrors);
                    this.notificationService.error('Não foi possível criar a conta.');
                });

                return undefined;
            }
        });
    }

    protected hasFieldError(field: 'displayName' | 'email' | 'password' | 'confirmPassword', errorKind: string): boolean {
        return this.registerForm[field]().errors().some(error => error.kind === errorKind);
    }
}