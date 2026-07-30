import { Injectable } from '@angular/core';
import { OmegaFyChatClient } from '../../../core/external-services/omega-fy-chat-client.service';
import { CursorPagination } from '../../../core/models/base/cursor-pagination';
import { UseCaseResult } from '../../../core/models/base/use-case-result';
import { GetUserConversationMessagesQueryResult } from '../../../core/models/conversations/get-user-conversation-messages-query-result';
import { GetUserConversationsQueryResult } from '../../../core/models/conversations/get-user-conversations-query-result';

@Injectable({ providedIn: 'root' })
export class ChatFacade {
    constructor(private readonly omegaFyChatClient: OmegaFyChatClient) { }

    public async getUserConversations(): Promise<UseCaseResult<GetUserConversationsQueryResult>> {
        const response = await this.omegaFyChatClient.getUserConversations();

        if (!response.succeeded)
            return { success: false, validationErrors: response.errors };

        return { success: true, data: response.data };
    }

    public async getUserConversationMessages(conversationId: string, pagination: CursorPagination<string>): Promise<UseCaseResult<GetUserConversationMessagesQueryResult>> {
        const response = await this.omegaFyChatClient.getUserConversationMessages(conversationId, pagination);

        if (!response.succeeded)
            return { success: false, validationErrors: response.errors };

        return { success: true, data: response.data };
    }
}