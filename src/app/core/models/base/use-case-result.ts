import { ValidationError } from './validation-error';

export type UseCaseResult<TData> =
    | { success: true; data: TData; }
    | { success: false; validationErrors: ValidationError[]; };