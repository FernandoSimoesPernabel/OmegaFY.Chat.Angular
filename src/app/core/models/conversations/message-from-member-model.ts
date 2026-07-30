import { MemberMessageStatus } from './member-message-status';
import { MessageType } from './message-type';

export type MessageFromMemberModel = {
    messageId: string;
    conversationId: string;
    memberId: string;
    senderMemberId: string;
    senderDisplayName: string;
    destinationMemberId: string;
    destinationDisplayName: string;
    sendDate: string;
    deliveryDate: string;
    type: MessageType;
    status: MemberMessageStatus;
    content: string;
    isMessageFromMember: boolean;
};