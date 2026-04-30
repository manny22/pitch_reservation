import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Court } from '../../domain/court/court.model';
import { CourtRepository, CourtSearchFilters } from '../../domain/court/court.repository';

@Injectable({ providedIn: 'root' })
export class CourtFacade {
    private readonly repository = inject(CourtRepository);

    readonly courts = signal<Court[]>([]);
    readonly featured = signal<Court[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    search(filters?: CourtSearchFilters): Observable<Court[]> {
        this.loading.set(true);
        this.error.set(null);
        return this.repository.findAll(filters).pipe(
            tap({
                next: (courts) => {
                    this.courts.set(courts);
                    this.loading.set(false);
                },
                error: (err: Error) => {
                    this.error.set(err.message ?? 'Error al cargar canchas');
                    this.loading.set(false);
                },
            }),
        );
    }

    loadFeatured(): Observable<Court[]> {
        return this.repository.findFeatured().pipe(tap((courts) => this.featured.set(courts)));
    }

    getById(id: string): Observable<Court | undefined> {
        return this.repository.findById(id);
    }

    availableSlots(id: string, date: string) {
        return this.repository.availableSlots(id, date);
    }

    create(court: Omit<Court, 'id'>) {
        return this.repository.create(court);
    }

    update(id: string, changes: Partial<Court>) {
        return this.repository.update(id, changes);
    }

    delete(id: string) {
        return this.repository.delete(id);
    }
}
