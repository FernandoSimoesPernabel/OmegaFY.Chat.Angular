import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LoginRequest } from '../../features/auth/models/login-request';
import { LoginResult } from '../../features/auth/models/login-result';
import { AppConfig } from '../config/runtime/app-config';
import { ApiResponse } from '../models/base/api-response';

@Injectable({ providedIn: 'root' })
export class OmegaFyChatClient {
    constructor(
        private readonly http: HttpClient,
        private readonly appConfig: AppConfig) { }

    public async login(request: LoginRequest): Promise<ApiResponse<LoginResult>> {
        return firstValueFrom(this.http.post<ApiResponse<LoginResult>>(`${this.appConfig.API_BASE_URL}/Auth/login`, request));
    }
}