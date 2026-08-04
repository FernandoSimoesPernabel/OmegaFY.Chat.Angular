import { Injectable, signal } from '@angular/core';
import { ValidationError } from '../../core/models/base/validation-error';

@Injectable()
export class ComponentValidationErrorsService {
    public readonly errors = signal<ValidationError[]>([]);

    public clear(): void {
        this.errors.set([]);
    }

    public setErrors(errors: ValidationError[]): void {
        this.errors.set(errors);
    }
}