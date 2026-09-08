import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NOT_DOMAIN_ERROR } from '../../shared/constants/error-codes.constants';
import { AppConfigFile } from '../config/app-config-file';
import { LoginRequest } from '../models/auth/login-request';
import { LoginResult } from '../models/auth/login-result';
import { RefreshTokenRequest } from '../models/auth/refresh-token-request';
import { RefreshTokenResult } from '../models/auth/refresh-token-result';
import { RegisterNewUserRequest } from '../models/auth/register-new-user-request';
import { RegisterNewUserResult } from '../models/auth/register-new-user-result';
import { ApiResponse } from '../models/base/api-response';
import { CursorPagination } from '../models/base/cursor-pagination';
import { AddMemberToGroupRequest } from '../models/conversations/add-member-to-group-request';
import { AddMemberToGroupResult } from '../models/conversations/add-member-to-group-result';
import { ChangeGroupConfigRequest } from '../models/conversations/change-group-config-request';
import { ChangeGroupConfigResult } from '../models/conversations/change-group-config-result';
import { CreateGroupConversationRequest } from '../models/conversations/create-group-conversation-request';
import { CreateGroupConversationResult } from '../models/conversations/create-group-conversation-result';
import { GetConversationByIdResult } from '../models/conversations/get-conversation-by-id-result';
import { GetUserConversationMessagesResult } from '../models/conversations/get-user-conversation-messages-result';
import { GetUserConversationsResult } from '../models/conversations/get-user-conversations-result';
import { GetUsersRequest } from '../models/conversations/get-users-request';
import { GetUsersResult } from '../models/conversations/get-users-result';
import { SendMessageResult } from '../models/conversations/send-message-result';
import { SendMessageRequest } from '../models/conversations/send-message-request';

@Injectable({ providedIn: 'root' })
export class OmegaFyChatClient {
    constructor(
        private readonly http: HttpClient,
        private readonly appConfigFile: AppConfigFile) { }

    public async login(request: LoginRequest): Promise<ApiResponse<LoginResult>> {
        return this.post<LoginRequest, LoginResult>('Auth/login', request);
    }

    public async registerNewUser(request: RegisterNewUserRequest): Promise<ApiResponse<RegisterNewUserResult>> {
        return this.post<RegisterNewUserRequest, RegisterNewUserResult>('Auth/register-new-user', request);
    }

    public async refreshToken(request: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResult>> {
        return this.post<RefreshTokenRequest, RefreshTokenResult>('Auth/refresh-token', request);
    }

    public async getUserConversations(): Promise<ApiResponse<GetUserConversationsResult>> {
        return this.get<GetUserConversationsResult>('Chat/me/conversations');
    }

    public async getConversationById(conversationId: string): Promise<ApiResponse<GetConversationByIdResult>> {
        return this.get<GetConversationByIdResult>(`Chat/${conversationId}`);
    }

    public async getUserConversationMessages(conversationId: string, pagination: CursorPagination<string>): Promise<ApiResponse<GetUserConversationMessagesResult>> {
        return this.get<GetUserConversationMessagesResult>(`Chat/me/${conversationId}/messages?Take=${pagination.take}&Cursor=${pagination.cursor ?? ''}`);
    }

    public async sendMessage(conversationId: string, request: SendMessageRequest): Promise<ApiResponse<SendMessageResult>> {
        return this.post<SendMessageRequest, SendMessageResult>(`Chat/${conversationId}/messages`, request);
    }

    public async createGroupConversation(request: CreateGroupConversationRequest): Promise<ApiResponse<CreateGroupConversationResult>> {
        return this.post<CreateGroupConversationRequest, CreateGroupConversationResult>('Chat', request);
    }

    public async addMemberToGroup(conversationId: string, request: AddMemberToGroupRequest): Promise<ApiResponse<AddMemberToGroupResult>> {
        return this.post<AddMemberToGroupRequest, AddMemberToGroupResult>(`Chat/${conversationId}/members`, request);
    }

    public async changeGroupConfig(conversationId: string, request: ChangeGroupConfigRequest): Promise<ApiResponse<ChangeGroupConfigResult>> {
        return this.put<ChangeGroupConfigRequest, ChangeGroupConfigResult>(`Chat/${conversationId}/group-config`, request);
    }

    public async removeMemberFromGroup(conversationId: string, memberId: string): Promise<ApiResponse<void>> {
        return this.delete<void, void>(`Chat/${conversationId}/members/${memberId}`, undefined as any);
    }

    public async getUsers(request: GetUsersRequest): Promise<ApiResponse<GetUsersResult>> {
        const params = new URLSearchParams();
        if (request.displayName) params.append('DisplayName', request.displayName);
        if (request.status) params.append('Status', request.status.toString());

        const queryString = params.toString();
        return this.get<GetUsersResult>(queryString ? `Chat/users?${queryString}` : 'Chat/users');
    }

    private async get<TResponse>(endpoint: string): Promise<ApiResponse<TResponse>> {
        try {
            return await firstValueFrom(this.http.get<ApiResponse<TResponse>>(this.buildUrl(endpoint)));
        } catch (ex: unknown) {
            return this.createApiResponseFromException<TResponse>(ex);
        }
    }

    private async post<TRequest, TResponse>(endpoint: string, request: TRequest): Promise<ApiResponse<TResponse>> {
        try {
            return await firstValueFrom(this.http.post<ApiResponse<TResponse>>(this.buildUrl(endpoint), request));
        } catch (ex: unknown) {
            return this.createApiResponseFromException<TResponse>(ex);
        }
    }

    private async put<TRequest, TResponse>(endpoint: string, request: TRequest): Promise<ApiResponse<TResponse>> {
        try {
            return await firstValueFrom(this.http.put<ApiResponse<TResponse>>(this.buildUrl(endpoint), request));
        } catch (ex: unknown) {
            return this.createApiResponseFromException<TResponse>(ex);
        }
    }

    private async delete<TRequest, TResponse>(endpoint: string, request: TRequest): Promise<ApiResponse<TResponse>> {
        try {
            return await firstValueFrom(this.http.delete<ApiResponse<TResponse>>(this.buildUrl(endpoint), { body: request }));
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
        return `${this.appConfigFile.API_OMEGAFY_CHAT_BASE_URL_API}/${endpoint}`;
    }
}