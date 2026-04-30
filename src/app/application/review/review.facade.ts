import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Review, ReviewRepository } from '../../domain/review/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewFacade {
    private readonly repository = inject(ReviewRepository);

    byCourt(courtId: string): Observable<Review[]> {
        return this.repository.findByCourt(courtId);
    }

    create(review: Omit<Review, 'id' | 'createdAt'>): Observable<Review> {
        return this.repository.create(review);
    }

    averageRating(reviews: Review[]): number {
        if (!reviews.length) return 0;
        return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    }
}
