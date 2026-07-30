import { CursorPaginationResultInfo } from '../base/cursor-pagination-result-info';
import { MessageFromMemberModel } from './message-from-member-model';

export type GetUserConversationMessagesQueryResult = {
    conversationDisplayName: string;
    messages: MessageFromMemberModel[];
    paginationInfo: CursorPaginationResultInfo<string>;
};