import { FriendshipStatus } from './friendship-status';

export type UserModel = {
    id: string;
    email: string;
    displayName: string;
    friendshipStatus: FriendshipStatus | null;
};
