import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Court } from '../../domain/court/court.model';
import { CourtRepository, CourtSearchFilters } from '../../domain/court/court.repository';
import { SEED_COURTS } from '../data/seed.data';

const NETWORK_LATENCY = 350;

@Injectable({ providedIn: 'root' })
export class InMemoryCourtRepository extends CourtRepository {
    private readonly courts = signal<Court[]>([...SEED_COURTS]);

    findAll(filters?: CourtSearchFilters): Observable<Court[]> {
        return of(this.courts()).pipe(
            delay(NETWORK_LATENCY),
            map((courts) => this.applyFilters(courts, filters)),
        );
    }

    findById(id: string): Observable<Court | undefined> {
        return of(this.courts().find((c) => c.id === id)).pipe(delay(NETWORK_LATENCY));
    }

    findFeatured(): Observable<Court[]> {
        return of(this.courts().filter((c) => c.averageRating >= 4.5).slice(0, 4)).pipe(
            delay(NETWORK_LATENCY),
        );
    }

    create(court: Omit<Court, 'id'>): Observable<Court> {
        const created: Court = { ...court, id: `c-${Date.now()}` };
        this.courts.update((list) => [...list, created]);
        return of(created).pipe(delay(NETWORK_LATENCY));
    }

    update(id: string, changes: Partial<Court>): Observable<Court> {
        let updated!: Court;
        this.courts.update((list) =>
            list.map((c) => {
                if (c.id !== id) return c;
                updated = { ...c, ...changes };
                return updated;
            }),
        );
        return of(updated).pipe(delay(NETWORK_LATENCY));
    }

    delete(id: string): Observable<void> {
        this.courts.update((list) => list.filter((c) => c.id !== id));
        return of(void 0).pipe(delay(NETWORK_LATENCY));
    }

    availableSlots(_id: string, _date: string): Observable<string[]> {
        const slots = ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'];
        return of(slots).pipe(delay(NETWORK_LATENCY));
    }

    private applyFilters(courts: Court[], filters?: CourtSearchFilters): Court[] {
        if (!filters) return courts;
        return courts.filter((c) => {
            if (filters.city && !c.location.city.toLowerCase().includes(filters.city.toLowerCase()))
                return false;
            if (filters.type && c.type !== filters.type) return false;
            if (filters.maxPrice != null && c.pricePerHour > filters.maxPrice) return false;
            if (filters.minRating != null && c.averageRating < filters.minRating) return false;
            if (filters.withPromotion && !c.activePromotionId) return false;
            return true;
        });
    }
}
