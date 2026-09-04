import { MessageType } from './message-type';

export type SendMessageRequest = {
    type: MessageType;
    body: string;
};