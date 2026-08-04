import { Token } from '../../models/auth/token';

export class JwtToken {
    public readonly userId: string;
    
    public readonly value: string;

    public readonly expirationDate: Date;

    private constructor(userId: string, value: string, expirationDate: Date) {
        this.userId = userId;
        this.value = value;
        this.expirationDate = expirationDate;
    }

    public isExpired(): boolean {
        return this.expirationDate.getTime() <= Date.now();
    }

    public isValid(): boolean {
        return !!this.value && !this.isExpired();
    }

    public static createFromToken(json: Token): JwtToken {
        return new JwtToken(json.userId, json.value, new Date(json.expirationDate));
    }

    public static decodeTokenPayload(tokenPayload: string): Record<string, unknown> | null {
        const tokenParts = tokenPayload.split('.');

        if (tokenParts.length < 2)
            return null;

        try {
            const payloadPart = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');

            const padLength = payloadPart.length % 4;

            const paddedPayload = padLength === 0 ? payloadPart : payloadPart + '='.repeat(4 - padLength);

            const payload = JSON.parse(atob(paddedPayload)) as unknown;

            return payload && typeof payload === 'object' && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
        } catch {
            return null;
        }
    }
}