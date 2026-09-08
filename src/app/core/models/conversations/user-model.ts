export enum FriendshipStatus {
    Pending = 0,
    Accepted = 1,
    Rejected = 2
}

export type UserModel = {
    id: string;
    email: string;
    displayName: string;
    friendshipStatus: FriendshipStatus | null;
};
