import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
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

    protected readonly errorMessages = signal<string[]>([]);

    constructor(
        private fb: FormBuilder,
        private authFacade: AuthFacade,
        private router: Router,
        public loadingService: ComponentLoadingService) {

        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(64)]],
            rememberMe: [false]
        });
    }

    public async onSubmit(): Promise<void> {
        if (this.loginForm.invalid || this.loadingService.isLoading()) return;

        this.errorMessages.set([]);

        try {
            await this.loadingService.trackAsync(async () => {
                const result = await this.authFacade.login(this.loginForm.getRawValue());

                if (result.success) {
                    await this.router.navigate(['/conversations']);
                    return;
                }

                this.errorMessages.set(result.validationErrors.map(error => error.message));
            });
        } catch {
            this.errorMessages.set(['Erro ao conectar com o servidor. Tente novamente.']);
        }
    }
}