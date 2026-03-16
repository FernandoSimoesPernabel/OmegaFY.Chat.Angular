import { ValidationError } from './validation-error';

export type ApiResponse<T> = {
    succeeded: boolean;
    errors: ValidationError[];
    data: T;
};