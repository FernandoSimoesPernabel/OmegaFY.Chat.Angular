import { Token } from '../../models/auth/token';

export class JwtToken {
    public readonly value: string;

    public readonly expirationDate: Date;

    private constructor(value: string, expirationDate: Date) {
        this.value = value;
        this.expirationDate = expirationDate;
    }

    public static createFromJson(json: Token): JwtToken {
        return new JwtToken(json.value, new Date(json.expirationDate));
    }

    public isExpired(): boolean {
        return this.expirationDate.getTime() <= Date.now();
    }

    public isValid(): boolean {
        return !!this.value && !this.isExpired();
    }
}