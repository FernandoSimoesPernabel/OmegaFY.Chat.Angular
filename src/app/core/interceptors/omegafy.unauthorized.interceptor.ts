import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { AppConfigFile } from '../config/app-config-file';

export const omegafyUnauthorizedInterceptor: HttpInterceptorFn = (request, next) => {
    const appConfigFile = inject(AppConfigFile);
    const authService = inject(AuthService);
    const router = inject(Router);

    const isApiRequest = request.url.toLowerCase().startsWith(appConfigFile.API_OMEGAFY_CHAT_BASE_URL_API.toLowerCase());

    return next(request).pipe(
        catchError((error: unknown) => {
            const isUnauthorizedError = error instanceof HttpErrorResponse && error.status === 401;

            if (isApiRequest && isUnauthorizedError) {
                authService.clearTokens();

                if (router.url !== '/login') {
                    router.navigateByUrl('/login');
                }
            }

            return throwError(() => error);
        })
    );
};