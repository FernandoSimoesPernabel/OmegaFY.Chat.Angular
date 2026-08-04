import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { AppConfigFile } from '../config/app-config-file';

export const omegafyAuthInterceptor: HttpInterceptorFn = (request, next) => {
    const appConfigFile = inject(AppConfigFile);
    const authService = inject(AuthService);

    if (!request.url.toLowerCase().startsWith(appConfigFile.API_OMEGAFY_CHAT_BASE_URL_API.toLowerCase()))
        return next(request);

    const token = authService.getToken();

    return token?.isValid()
        ? next(request.clone({ setHeaders: { Authorization: `Bearer ${token.value}` } }))
        : next(request)
};