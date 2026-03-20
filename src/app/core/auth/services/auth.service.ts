import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JWT_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../../shared/constants/local-storage-keys.constants';
import { Token } from '../../models/auth/token';
import { LocalStorageService } from '../../services/local-storage.service';
import { JwtToken } from '../models/jwt-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(
        private readonly localStorageService: LocalStorageService,
        private readonly router: Router) { }

    public saveTokens(token: Token, refreshToken: Token | null): void {
        this.localStorageService.set(JWT_TOKEN_KEY, JwtToken.createFromJson(token));

        refreshToken
            ? this.localStorageService.set(REFRESH_TOKEN_KEY, JwtToken.createFromJson(refreshToken))
            : this.localStorageService.remove(REFRESH_TOKEN_KEY);
    }

    public getToken(): JwtToken | null {
        const json = this.localStorageService.get<Token>(JWT_TOKEN_KEY);

        if (!json) return null;

        return JwtToken.createFromJson(json);
    }

    public getRefreshToken(): JwtToken | null {
        const json = this.localStorageService.get<Token>(REFRESH_TOKEN_KEY);

        if (!json) return null;

        return JwtToken.createFromJson(json);
    }

    public isAuthenticated(): boolean {
        const token = this.getToken();

        return token?.isValid() ?? false;
    }

    public clearTokens(): void {
        this.localStorageService.remove(JWT_TOKEN_KEY);
        this.localStorageService.remove(REFRESH_TOKEN_KEY);
    }

    public async logout(): Promise<void> {
        this.clearTokens();
        await this.router.navigate(['/login']);
    }
}
