import { CursorPaginationResultInfo } from '../base/cursor-pagination-result-info';
import { MessageFromMemberModel } from './message-from-member-model';

export type GetUserConversationMessagesQueryResult = {
    messages: MessageFromMemberModel[];
    paginationInfo: CursorPaginationResultInfo<string>;
};