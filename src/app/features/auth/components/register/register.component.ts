import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors as AngularValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ValidationError } from '../../../../core/models/base/validation-error';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthFacade } from '../../facades/auth.facade';

@Component({
    selector: 'app-register',
    imports: [
        ReactiveFormsModule,
        RouterLink,
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
    protected readonly registerForm: FormGroup;
    protected readonly validationErrors = signal<ValidationError[]>([]);

    constructor(
        private readonly fb: FormBuilder,
        private readonly authFacade: AuthFacade,
        private readonly router: Router,
        private readonly notificationService: NotificationService,
        public readonly loadingService: ComponentLoadingService) {

        this.registerForm = this.fb.group({
            displayName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(64)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(64)]]
        }, { validators: this.passwordMatchValidator() });
    }

    public async onSubmit(): Promise<void> {
        if (this.registerForm.invalid || this.loadingService.isLoading()) return;

        this.validationErrors.set([]);

        await this.loadingService.trackAsync(async () => {
            const result = await this.authFacade.registerNewUser(this.registerForm.getRawValue());

            if (result.success) {
                this.notificationService.success('Conta criada com sucesso.');

                await this.router.navigate(['/conversations']);

                return;
            }

            this.validationErrors.set(result.validationErrors);
            this.notificationService.error('Não foi possível criar a conta.');
        });
    }

    private passwordMatchValidator(): ValidatorFn {
        return (control: AbstractControl): AngularValidationErrors | null => {
            const password = control.get('password')?.value;
            const confirmPassword = control.get('confirmPassword')?.value;

            if (!password || !confirmPassword)
                return null;

            return password === confirmPassword ? null : { passwordMismatch: true };
        };
    }
}