import { ConversationStatus } from './conversation-status';
import { ConversationType } from './conversation-type';
import { GroupConfigModel } from './group-config-model';
import { MemberModel } from './member-model';

export type ConversationAndMembersModel = {
    conversationId: string;
    displayName: string;
    type: ConversationType;
    status: ConversationStatus;
    createdDate: string;
    groupConfig: GroupConfigModel;
    members: MemberModel[];
};