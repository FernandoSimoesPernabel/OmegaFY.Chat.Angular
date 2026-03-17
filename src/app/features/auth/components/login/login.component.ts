import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../facades/auth.facade';
import { LoginRequest } from '../../models/login-request';

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
        MatProgressSpinnerModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    protected readonly loginForm: FormGroup;

    protected readonly loading = signal(false);

    protected readonly errorMessages = signal<string[]>([]);

    constructor(
        private fb: FormBuilder,
        private authFacade: AuthFacade,
        private router: Router) {

        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(64)]],
            rememberMe: [false]
        });
    }

    public async onSubmit(): Promise<void> {
        if (this.loginForm.invalid) return;

        this.loading.set(true);
        this.errorMessages.set([]);

        try {
            const result = await this.authFacade.login(this.loginForm.getRawValue());

            if (result.success) {
                await this.router.navigate(['/conversations']);
                return;
            } 
            
            this.errorMessages.set(result.validationErrors.map(error => error.message));
        } catch {
            this.errorMessages.set(['Erro ao conectar com o servidor. Tente novamente.']);
        } finally {
            this.loading.set(false);
        }
    }
}