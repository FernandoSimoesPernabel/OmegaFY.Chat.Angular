import { Token } from './token';

export type RegisterNewUserResult = {
    userId: string;
    token: Token;
    refreshToken: Token | null;
};