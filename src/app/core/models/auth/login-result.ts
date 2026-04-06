import { Token } from './token';

export type LoginResult = {
    userId: string;
    displayName: string;
    email: string;
    token: Token;
    refreshToken: Token | null;
};