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
    const authService = inject(AuthService);
    const omegaFyChatClient = inject(OmegaFyChatClient);

    if (!shouldEnsureValidAccessToken(request.url))
        return next(request);

    return from(ensureValidAccessToken(authService, omegaFyChatClient)).pipe(
        switchMap(() => next(request))
    );
};

function shouldEnsureValidAccessToken(requestUrl: string): boolean {
    const appConfigFile = inject(AppConfigFile);

    const apiBaseUrl = appConfigFile.API_OMEGAFY_CHAT_BASE_URL_API?.trim().toLowerCase();

    if (!apiBaseUrl)
        return false;

    const url = requestUrl.toLowerCase();
    const isAppConfigRequest = url.endsWith('/app-config.json');
    const isApiRequest = url.startsWith(apiBaseUrl);
    const isLoginRequest = url.includes('/auth/login');
    const isRefreshRequest = url.includes('/auth/refresh-token');

    return !(isAppConfigRequest || !isApiRequest || isLoginRequest || isRefreshRequest);
}

async function ensureValidAccessToken(authService: AuthService, omegaFyChatClient: OmegaFyChatClient): Promise<void> {
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
            const response = await omegaFyChatClient.refreshToken({ userId: token.userId, currentToken: token.value, refreshToken: refreshToken.value });

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