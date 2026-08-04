import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class AppConfigFile {
    public API_OMEGAFY_CHAT_BASE_URL_API: string = '';

    public API_OMEGAFY_CHAT_BASE_URL_HUB: string = '';

    constructor(private readonly http: HttpClient) { }

    public async bind(): Promise<void> {
        const config = await firstValueFrom(this.http.get<Record<string, unknown>>('/app-config.json'));
        
        this.API_OMEGAFY_CHAT_BASE_URL_API = config['API_OMEGAFY_CHAT_BASE_URL_API'] as string;
        this.API_OMEGAFY_CHAT_BASE_URL_HUB = config['API_OMEGAFY_CHAT_BASE_URL_HUB'] as string;
    }
}