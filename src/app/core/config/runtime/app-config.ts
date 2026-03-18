import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class AppConfig {
    public API_BASE_URL: string = '';

    constructor(private readonly http: HttpClient) { }

    public async bind(): Promise<void> {
        const config = await firstValueFrom(this.http.get<Record<string, unknown>>('/app-config.json'));
        this.API_BASE_URL = config['API_BASE_URL'] as string;
    }
}