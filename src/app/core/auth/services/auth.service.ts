import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JWT_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../../shared/constants/local-storage-keys.constants';
import { Token } from '../../models/auth/token';
import { LocalStorageService } from '../../services/local-storage.service';
import { JwtToken } from '../models/jwt-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(
        private localStorageService: LocalStorageService,
        private router: Router) { }

    public saveTokens(token: Token, refreshToken: Token | null): void {
        const jwt = JwtToken.createFromJson(token);
        
        this.localStorageService.set(JWT_TOKEN_KEY, jwt.toJson());

        if (refreshToken) {
            const refreshJwt = JwtToken.createFromJson(refreshToken);
            this.localStorageService.set(REFRESH_TOKEN_KEY, refreshJwt.toJson());
        }
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

        return token !== null && token.isValid();
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
