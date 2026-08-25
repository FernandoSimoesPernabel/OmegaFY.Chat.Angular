import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { AppConfigFile } from "../config/app-config-file";
import { HealthCheckStatus } from "../models/health-check/health-check-status";

@Injectable({ providedIn: 'root' })
export class HealthCheckService {
    constructor(
        private readonly http: HttpClient,
        private readonly appConfigFile: AppConfigFile) { }

    public async checkHealth(): Promise<HealthCheckStatus> {
        try {
            const response = await firstValueFrom(this.http.get(this.appConfigFile.API_OMEGAFY_CHAT_BASE_URL_HEALTH, { responseType: 'text' }));
            return response as HealthCheckStatus;
        } catch (ex: unknown) {
            return 'Unavailable';
        }
    }
}