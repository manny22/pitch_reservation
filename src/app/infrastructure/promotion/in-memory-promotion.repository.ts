import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Promotion } from '../../domain/promotion/promotion.model';
import { PromotionRepository } from '../../domain/promotion/promotion.model';
import { SEED_PROMOTIONS } from '../data/seed.data';

@Injectable({ providedIn: 'root' })
export class InMemoryPromotionRepository extends PromotionRepository {
    private readonly items = signal<Promotion[]>([...SEED_PROMOTIONS]);

    findActive(): Observable<Promotion[]> {
        return of(this.items().filter((p) => p.active)).pipe(delay(150));
    }

    findByCourt(courtId: string): Observable<Promotion[]> {
        return of(this.items().filter((p) => p.courtId === courtId && p.active)).pipe(delay(150));
    }

    findById(id: string): Observable<Promotion | undefined> {
        return of(this.items().find((p) => p.id === id)).pipe(delay(150));
    }

    create(promo: Omit<Promotion, 'id'>): Observable<Promotion> {
        const created: Promotion = { ...promo, id: `p-${Date.now()}` };
        this.items.update((list) => [...list, created]);
        return of(created).pipe(delay(150));
    }

    update(id: string, changes: Partial<Promotion>): Observable<Promotion> {
        let updated!: Promotion;
        this.items.update((list) =>
            list.map((p) => {
                if (p.id !== id) return p;
                updated = { ...p, ...changes };
                return updated;
            }),
        );
        return of(updated).pipe(delay(150));
    }

    delete(id: string): Observable<void> {
        this.items.update((list) => list.filter((p) => p.id !== id));
        return of(void 0).pipe(delay(150));
    }
}
