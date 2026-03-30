import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AppConfigFile } from './core/config/app-config-file';
import { omegafyAuthInterceptor } from './core/interceptors/omegafy.auth.interceptor';
import { omegafyRefreshTokenInterceptor } from './core/interceptors/omegafy.refresh-token.interceptor';
import { omegafyUnauthorizedInterceptor } from './core/interceptors/omegafy.unauthorized.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([
            omegafyUnauthorizedInterceptor,
            omegafyRefreshTokenInterceptor,
            omegafyAuthInterceptor
        ])),
        provideAppInitializer(() => inject(AppConfigFile).bind()),
        importProvidersFrom(MatSnackBarModule)
    ]
};