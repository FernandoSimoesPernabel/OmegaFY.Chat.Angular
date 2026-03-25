import { Injectable } from '@angular/core';
import { OMEGAFY_JWT_TOKEN_KEY, OMEGAFY_REFRESH_TOKEN_KEY } from '../../../shared/constants/local-storage-keys.constants';
import { Token } from '../../models/auth/token';
import { LocalStorageService } from '../../services/local-storage.service';
import { JwtToken } from '../models/jwt-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(private readonly localStorageService: LocalStorageService) { }

    public saveTokens(token: Token, refreshToken: Token | null): void {
        this.localStorageService.set(OMEGAFY_JWT_TOKEN_KEY, JwtToken.createFromJson(token));

        refreshToken
            ? this.localStorageService.set(OMEGAFY_REFRESH_TOKEN_KEY, JwtToken.createFromJson(refreshToken))
            : this.localStorageService.remove(OMEGAFY_REFRESH_TOKEN_KEY);
    }

    public getToken(): JwtToken | null {
        const json = this.localStorageService.get<Token>(OMEGAFY_JWT_TOKEN_KEY);

        if (!json) return null;

        return JwtToken.createFromJson(json);
    }

    public getRefreshToken(): JwtToken | null {
        const json = this.localStorageService.get<Token>(OMEGAFY_REFRESH_TOKEN_KEY);

        if (!json) return null;

        return JwtToken.createFromJson(json);
    }

    public isAuthenticated(): boolean {
        const token = this.getToken();

        return token?.isValid() ?? false;
    }

    public clearTokens(): void {
        this.localStorageService.remove(OMEGAFY_JWT_TOKEN_KEY);
        this.localStorageService.remove(OMEGAFY_REFRESH_TOKEN_KEY);
    }

    public async logout(): Promise<void> {
        this.clearTokens();
    }
}
