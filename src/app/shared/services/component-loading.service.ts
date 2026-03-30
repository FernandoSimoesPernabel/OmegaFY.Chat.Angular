import { Injectable, signal } from '@angular/core';

@Injectable()
export class ComponentLoadingService {
    public readonly isLoading = signal(false);

    public async trackAsync<T>(operation: () => Promise<T>): Promise<T> {
        this.start();

        try {
            return await operation();
        } finally {
            this.stop();
        }
    }

    private start(): void {
        this.isLoading.set(true);
    }

    private stop(): void {
        this.isLoading.set(false);
    }
}