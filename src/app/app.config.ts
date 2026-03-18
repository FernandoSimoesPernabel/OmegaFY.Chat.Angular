import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AppConfig } from './core/config/runtime/app-config';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(),
        provideAppInitializer(() => inject(AppConfig).bind()),
        importProvidersFrom(MatSnackBarModule)
    ]
};