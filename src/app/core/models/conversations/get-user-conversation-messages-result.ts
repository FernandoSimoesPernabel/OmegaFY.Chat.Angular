import { CursorPaginationResultInfo } from '../base/cursor-pagination-result-info';
import { MessageFromMemberModel } from './message-from-member-model';

export type GetUserConversationMessagesResult = {
    messages: MessageFromMemberModel[];
    paginationInfo: CursorPaginationResultInfo<string>;
};