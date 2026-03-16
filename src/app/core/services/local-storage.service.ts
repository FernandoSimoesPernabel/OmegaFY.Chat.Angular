import { Injectable } from '@angular/core';
import { JsonUtils } from '../../shared/utils/json.utils';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
    public get<T>(key: string): T | null {
        const json = localStorage.getItem(key);

        if (!json) return null;

        return JsonUtils.deserialize<T>(json);
    }

    public set<T>(key: string, value: T): void {
        localStorage.setItem(key, JsonUtils.serialize(value));
    }

    public remove(key: string): void {
        localStorage.removeItem(key);
    }
}