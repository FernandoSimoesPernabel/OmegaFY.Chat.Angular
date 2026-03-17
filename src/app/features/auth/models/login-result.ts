import { Token } from '../../../core/models/auth/token';

export type LoginResult = {
    userId: string;
    displayName: string;
    email: string;
    token: Token;
    refreshToken: Token | null;
};