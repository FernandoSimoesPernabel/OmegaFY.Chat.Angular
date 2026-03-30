import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/auth/services/auth.service';
import { OmegaFyChatClient } from '../../../core/external-services/omega-fy-chat-client.service';
import { UseCaseResult } from '../../../core/models/base/use-case-result';
import { LoginRequest } from '../models/login-request';
import { LoginResult } from '../models/login-result';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
    constructor(
        private readonly omegaFyChatClient: OmegaFyChatClient,
        private readonly authService: AuthService) { }

    public async login(request: LoginRequest): Promise<UseCaseResult<LoginResult>> {
        const response = await this.omegaFyChatClient.login(request);

        if (!response.succeeded)
            return { success: false, validationErrors: response.errors };

        this.authService.saveTokens(response.data.token, response.data.refreshToken);

        return { success: true, data: response.data };
    }
}