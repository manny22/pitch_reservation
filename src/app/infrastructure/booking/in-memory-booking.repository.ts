import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Booking } from '../../domain/booking/booking.model';
import { BookingRepository } from '../../domain/booking/booking.repository';

@Injectable({ providedIn: 'root' })
export class InMemoryBookingRepository extends BookingRepository {
    private readonly bookings = signal<Booking[]>([]);

    findAll(): Observable<Booking[]> {
        return of(this.bookings()).pipe(delay(200));
    }

    findByUser(userId: string): Observable<Booking[]> {
        return of(this.bookings().filter((b) => b.userId === userId)).pipe(delay(200));
    }

    findByCourt(courtId: string): Observable<Booking[]> {
        return of(this.bookings().filter((b) => b.courtId === courtId)).pipe(delay(200));
    }

    findById(id: string): Observable<Booking | undefined> {
        return of(this.bookings().find((b) => b.id === id)).pipe(delay(200));
    }

    create(input: Omit<Booking, 'id' | 'createdAt'>): Observable<Booking> {
        const booking: Booking = {
            ...input,
            id: `b-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        this.bookings.update((list) => [...list, booking]);
        return of(booking).pipe(delay(200));
    }

    update(id: string, changes: Partial<Booking>): Observable<Booking> {
        let updated!: Booking;
        this.bookings.update((list) =>
            list.map((b) => {
                if (b.id !== id) return b;
                updated = { ...b, ...changes };
                return updated;
            }),
        );
        return of(updated).pipe(delay(200));
    }

    cancel(id: string): Observable<Booking> {
        return this.update(id, { bookingStatus: 'cancelled' });
    }
}
