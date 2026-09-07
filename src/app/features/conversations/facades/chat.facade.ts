import { Injectable } from '@angular/core';
import { OmegaFyChatClient } from '../../../core/external-services/omega-fy-chat-client.service';
import { ApiResponse } from '../../../core/models/base/api-response';
import { CursorPagination } from '../../../core/models/base/cursor-pagination';
import { UseCaseResult } from '../../../core/models/base/use-case-result';
import { AddMemberToGroupRequest } from '../../../core/models/conversations/add-member-to-group-request';
import { AddMemberToGroupResult } from '../../../core/models/conversations/add-member-to-group-result';
import { ChangeGroupConfigRequest } from '../../../core/models/conversations/change-group-config-request';
import { ChangeGroupConfigResult } from '../../../core/models/conversations/change-group-config-result';
import { CreateGroupConversationRequest } from '../../../core/models/conversations/create-group-conversation-request';
import { CreateGroupConversationResult } from '../../../core/models/conversations/create-group-conversation-result';
import { GetConversationByIdResult } from '../../../core/models/conversations/get-conversation-by-id-result';
import { GetUserConversationMessagesResult } from '../../../core/models/conversations/get-user-conversation-messages-result';
import { GetUserConversationsResult } from '../../../core/models/conversations/get-user-conversations-result';
import { GetUsersRequest } from '../../../core/models/conversations/get-users-request';
import { GetUsersResult } from '../../../core/models/conversations/get-users-result';
import { SendMessageRequest } from '../../../core/models/conversations/send-message-request';
import { SendMessageResult } from '../../../core/models/conversations/send-message-result';

@Injectable({ providedIn: 'root' })
export class ChatFacade {
    constructor(private readonly omegaFyChatClient: OmegaFyChatClient) { }

    public async getUserConversations(): Promise<UseCaseResult<GetUserConversationsResult>> {
        const response = await this.omegaFyChatClient.getUserConversations();
        return this.toUseCaseResult(response);
    }

    public async getConversationById(conversationId: string): Promise<UseCaseResult<GetConversationByIdResult>> {
        const response = await this.omegaFyChatClient.getConversationById(conversationId);
        return this.toUseCaseResult(response);
    }

    public async getUserConversationMessages(conversationId: string, pagination: CursorPagination<string>): Promise<UseCaseResult<GetUserConversationMessagesResult>> {
        const response = await this.omegaFyChatClient.getUserConversationMessages(conversationId, pagination);
        return this.toUseCaseResult(response);
    }

    public async sendMessage(conversationId: string, request: SendMessageRequest): Promise<UseCaseResult<SendMessageResult>> {
        const response = await this.omegaFyChatClient.sendMessage(conversationId, request);
        return this.toUseCaseResult(response);
    }

    public async createGroupConversation(request: CreateGroupConversationRequest): Promise<UseCaseResult<CreateGroupConversationResult>> {
        const response = await this.omegaFyChatClient.createGroupConversation(request);
        return this.toUseCaseResult(response);
    }

    public async addMemberToGroup(conversationId: string, request: AddMemberToGroupRequest): Promise<UseCaseResult<AddMemberToGroupResult>> {
        const response = await this.omegaFyChatClient.addMemberToGroup(conversationId, request);
        return this.toUseCaseResult(response);
    }

    public async changeGroupConfig(conversationId: string, request: ChangeGroupConfigRequest): Promise<UseCaseResult<ChangeGroupConfigResult>> {
        const response = await this.omegaFyChatClient.changeGroupConfig(conversationId, request);
        return this.toUseCaseResult(response);
    }

    public async removeMemberFromGroup(conversationId: string, memberId: string): Promise<UseCaseResult<void>> {
        const response = await this.omegaFyChatClient.removeMemberFromGroup(conversationId, memberId);
        return this.toUseCaseResult(response);
    }

    public async getUsers(request: GetUsersRequest): Promise<UseCaseResult<GetUsersResult>> {
        const response = await this.omegaFyChatClient.getUsers(request);
        return this.toUseCaseResult(response);
    }

    private toUseCaseResult<TData>(response: ApiResponse<TData>): UseCaseResult<TData> {
        return !response.succeeded ? { success: false, validationErrors: response.errors } : { success: true, data: response.data };
    }
}