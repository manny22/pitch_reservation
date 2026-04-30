import { Observable } from 'rxjs';

export interface Review {
    id: string;
    courtId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export abstract class ReviewRepository {
    abstract findByCourt(courtId: string): Observable<Review[]>;
    abstract create(review: Omit<Review, 'id' | 'createdAt'>): Observable<Review>;
}
