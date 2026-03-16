export class JsonUtils {
    public static serialize<T>(value: T): string {
        return JSON.stringify(value);
    }

    public static deserialize<T>(json: string): T | null {
        try {
            return JSON.parse(json) as T;
        } catch {
            return null;
        }
    }
}