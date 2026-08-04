import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const unauthorizedGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return router.createUrlTree(['/conversations']);
    }

    const refreshToken = authService.getRefreshToken();

    if (refreshToken?.isValid()) {
        return router.createUrlTree(['/conversations']);
    }

    authService.clearTokens();

    return true;
};