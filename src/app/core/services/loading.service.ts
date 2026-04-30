import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private readonly counter = signal(0);
    readonly active = signal(false);

    show(): void {
        this.counter.update((n) => n + 1);
        this.active.set(this.counter() > 0);
    }

    hide(): void {
        this.counter.update((n) => Math.max(0, n - 1));
        this.active.set(this.counter() > 0);
    }
}
