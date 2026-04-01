import { ConversationStatus } from './conversation-status';
import { ConversationType } from './conversation-type';
import { LastMessageFromConversation } from './last-message-from-conversation';

export type UserConversation = {
    conversationId: string;
    displayName: string;
    type: ConversationType;
    status: ConversationStatus;
    lastMessage?: LastMessageFromConversation | null;
};