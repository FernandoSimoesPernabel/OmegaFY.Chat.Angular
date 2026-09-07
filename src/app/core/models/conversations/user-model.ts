export enum FriendshipStatus {
    NotFriends = 0,
    SentRequest = 1,
    ReceivedRequest = 2,
    Friends = 3
}

export type UserModel = {
    id: string;
    email: string;
    displayName: string;
    friendshipStatus: FriendshipStatus | null;
};
