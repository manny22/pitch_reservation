import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Review, ReviewRepository } from '../../domain/review/review.model';
import { SEED_REVIEWS } from '../data/seed.data';

@Injectable({ providedIn: 'root' })
export class InMemoryReviewRepository extends ReviewRepository {
    private readonly items = signal<Review[]>([...SEED_REVIEWS]);

    findByCourt(courtId: string): Observable<Review[]> {
        return of(this.items().filter((r) => r.courtId === courtId)).pipe(delay(150));
    }

    create(review: Omit<Review, 'id' | 'createdAt'>): Observable<Review> {
        const created: Review = {
            ...review,
            id: `r-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        this.items.update((list) => [...list, created]);
        return of(created).pipe(delay(150));
    }
}
