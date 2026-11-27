import { FriendshipStatus } from './friendship-status';

export type GetUsersRequest = {
    displayName?: string;
    status?: FriendshipStatus | null;
};
