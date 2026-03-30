import { Token } from './token';

export type RefreshTokenResult = {
    token: Token;
    refreshToken: Token;
};