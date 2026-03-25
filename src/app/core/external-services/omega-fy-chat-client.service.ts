import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LoginRequest } from '../../features/auth/models/login-request';
import { LoginResult } from '../../features/auth/models/login-result';
import { NOT_DOMAIN_ERROR } from '../../shared/constants/error-codes.constants';
import { AppConfigFile } from '../config/app-config-file';
import { RefreshTokenRequest } from '../models/auth/refresh-token-request';
import { RefreshTokenResult } from '../models/auth/refresh-token-result';
import { ApiResponse } from '../models/base/api-response';

@Injectable({ providedIn: 'root' })
export class OmegaFyChatClient {
    constructor(
        private readonly http: HttpClient,
        private readonly appConfigFile: AppConfigFile) { }

    public async login(request: LoginRequest): Promise<ApiResponse<LoginResult>> {
        return this.post<LoginRequest, LoginResult>('Auth/login', request);
    }

    public async refreshToken(request: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResult>> {
        return this.post<RefreshTokenRequest, RefreshTokenResult>('Auth/refresh-token', request);
    }

    private async post<TRequest, TResponse>(endpoint: string, request: TRequest): Promise<ApiResponse<TResponse>> {
        try {
            return await firstValueFrom(this.http.post<ApiResponse<TResponse>>(this.buildUrl(endpoint), request));
        } catch (ex: unknown) {
            return this.createApiResponseFromException<TResponse>(ex);
        }
    }

    private createApiResponseFromException<TResponse>(ex: unknown): ApiResponse<TResponse> {
        if (ex instanceof HttpErrorResponse) {
            const errorApiResponse = ex.error as ApiResponse<TResponse>;

            if (!errorApiResponse)
                return this.createUnknownApiResponse<TResponse>();

            if (Array.isArray(errorApiResponse.errors)
                && errorApiResponse.errors.every(error => typeof error.code === 'string' && typeof error.message === 'string')) {
                return errorApiResponse;
            }
        }

        return this.createUnknownApiResponse<TResponse>();
    }

    private createUnknownApiResponse<TResponse>(): ApiResponse<TResponse> {
        return {
            succeeded: false,
            data: null,
            errors: [{ code: NOT_DOMAIN_ERROR, message: 'Houve um problema ao processar a solicitação. Tente novamente.', }]
        } as ApiResponse<TResponse>;
    }

    private buildUrl(endpoint: string): string {
        return `${this.appConfigFile.API_OMEGAFY_CHAT_BASE_URL}/${endpoint}`;
    }
}