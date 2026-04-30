import { Observable } from 'rxjs';

export type PromotionType = 'percentage' | 'fixed';

export interface Promotion {
    id: string;
    courtId: string;
    title: string;
    description: string;
    type: PromotionType;
    value: number;
    startsAt: string;
    endsAt: string;
    active: boolean;
}

export abstract class PromotionRepository {
    abstract findActive(): Observable<Promotion[]>;
    abstract findByCourt(courtId: string): Observable<Promotion[]>;
    abstract findById(id: string): Observable<Promotion | undefined>;
    abstract create(promotion: Omit<Promotion, 'id'>): Observable<Promotion>;
    abstract update(id: string, changes: Partial<Promotion>): Observable<Promotion>;
    abstract delete(id: string): Observable<void>;
}
