import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Promotion, PromotionRepository } from '../../domain/promotion/promotion.model';

@Injectable({ providedIn: 'root' })
export class PromotionFacade {
    private readonly repository = inject(PromotionRepository);

    active(): Observable<Promotion[]> {
        return this.repository.findActive();
    }

    byCourt(courtId: string): Observable<Promotion[]> {
        return this.repository.findByCourt(courtId);
    }

    byId(id: string): Observable<Promotion | undefined> {
        return this.repository.findById(id);
    }

    create(promo: Omit<Promotion, 'id'>) {
        return this.repository.create(promo);
    }

    update(id: string, changes: Partial<Promotion>) {
        return this.repository.update(id, changes);
    }

    delete(id: string) {
        return this.repository.delete(id);
    }
}
