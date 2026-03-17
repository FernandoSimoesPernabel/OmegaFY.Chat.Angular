import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LoginRequest } from '../../features/auth/models/login-request';
import { LoginResult } from '../../features/auth/models/login-result';
import { API_BASE_URL } from '../config/api/api.config';
import { ApiResponse } from '../models/base/api-response';

@Injectable({ providedIn: 'root' })
export class OmegaFyChatClient {
    constructor(
        private http: HttpClient,
        @Inject(API_BASE_URL) private baseUrl: string) { }

    public async login(request: LoginRequest): Promise<ApiResponse<LoginResult>> {
        return firstValueFrom(this.http.post<ApiResponse<LoginResult>>(`${this.baseUrl}api/Auth/login`, request));
    }
}