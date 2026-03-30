import { MemberMessageStatus } from './member-message-status';
import { MessageType } from './message-type';

export type LastMessageFromConversation = {
    messageId: string;
    conversationId: string;
    senderMemberId: string;
    sendDate: string;
    content: string;
    senderDisplayName: string;
    type: MessageType;
    status: MemberMessageStatus;
};