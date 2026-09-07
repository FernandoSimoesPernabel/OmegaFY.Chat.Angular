import { FriendshipStatus } from './user-model';

export type GetUsersRequest = {
    displayName?: string;
    status?: FriendshipStatus | null;
};
