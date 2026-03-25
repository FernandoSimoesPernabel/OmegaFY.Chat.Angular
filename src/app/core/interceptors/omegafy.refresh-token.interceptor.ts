import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';
import { AppConfigFile } from '../config/app-config-file';
import { OmegaFyChatClient } from '../external-services/omega-fy-chat-client.service';

const REFRESH_WINDOW_IN_MILLISECONDS = 10 * 60 * 1000;

let refreshInFlightPromise: Promise<boolean> | null = null;

export const omegafyRefreshTokenInterceptor: HttpInterceptorFn = (request, next) => {
    const appConfigFile = inject(AppConfigFile);
    const authService = inject(AuthService);
    const omegaFyChatClient = inject(OmegaFyChatClient);

    const requestUrl = request.url.toLowerCase();

    const isApiRequest = requestUrl.startsWith(appConfigFile.API_OMEGAFY_CHAT_BASE_URL.toLowerCase());
    const isLoginRequest = requestUrl.includes('/auth/login');
    const isRefreshRequest = requestUrl.includes('/auth/refresh-token');

    if (!isApiRequest || isLoginRequest || isRefreshRequest)
        return next(request);

    return from(ensureValidAccessToken(authService, omegaFyChatClient)).pipe(
        switchMap(() => next(request))
    );
};

async function ensureValidAccessToken(
    authService: AuthService,
    omegaFyChatClient: OmegaFyChatClient): Promise<void> {

    const token = authService.getToken();
    const refreshToken = authService.getRefreshToken();

    if (!token || !refreshToken)
        return;

    const tokenTimeToExpire = token.expirationDate.getTime() - Date.now();
    const shouldRefreshToken = tokenTimeToExpire <= REFRESH_WINDOW_IN_MILLISECONDS;

    if (!shouldRefreshToken)
        return;

    if (!refreshInFlightPromise) {
        refreshInFlightPromise = (async () => {
            const response = await omegaFyChatClient.refreshToken({ currentToken: token.value, refreshToken: refreshToken.value });

            if (!response.succeeded || !response.data) {
                return false;
            }

            authService.saveTokens(response.data.token, response.data.refreshToken);

            return true;
        })().finally(() => {
            refreshInFlightPromise = null;
        });
    }

    await refreshInFlightPromise;
}