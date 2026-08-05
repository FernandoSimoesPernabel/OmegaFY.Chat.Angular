export enum SignalREventType {
    ConversationStarted = 'ConversationStartedAsync',
    MessageReceived = 'MessageReceivedAsync',
    FriendshipRequestReceived = 'FriendshipRequestReceivedAsync',
    FriendshipRequestRejected = 'FriendshipRequestRejectedAsync',
    FriendshipRemoved = 'FriendshipRemovedAsync',
    MemberAddedToGroup = 'MemberAddedToGroupAsync',
    MemberRemovedFromGroup = 'MemberRemovedFromGroupAsync',
    FriendLoggedIn = 'FriendLoggedInAsync',
    FriendLoggedOff = 'FriendLoggedOffAsync',
}