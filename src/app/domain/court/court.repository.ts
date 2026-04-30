import { Observable } from 'rxjs';
import { Court } from './court.model';

export interface CourtSearchFilters {
    city?: string;
    date?: string;
    startTime?: string;
    type?: string;
    maxPrice?: number;
    minRating?: number;
    withPromotion?: boolean;
}

export abstract class CourtRepository {
    abstract findAll(filters?: CourtSearchFilters): Observable<Court[]>;
    abstract findById(id: string): Observable<Court | undefined>;
    abstract findFeatured(): Observable<Court[]>;
    abstract create(court: Omit<Court, 'id'>): Observable<Court>;
    abstract update(id: string, court: Partial<Court>): Observable<Court>;
    abstract delete(id: string): Observable<void>;
    abstract availableSlots(id: string, date: string): Observable<string[]>;
}
