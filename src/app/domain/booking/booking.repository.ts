import { Observable } from 'rxjs';
import { Booking } from './booking.model';

export abstract class BookingRepository {
    abstract findAll(): Observable<Booking[]>;
    abstract findByUser(userId: string): Observable<Booking[]>;
    abstract findByCourt(courtId: string): Observable<Booking[]>;
    abstract findById(id: string): Observable<Booking | undefined>;
    abstract create(booking: Omit<Booking, 'id' | 'createdAt'>): Observable<Booking>;
    abstract update(id: string, changes: Partial<Booking>): Observable<Booking>;
    abstract cancel(id: string): Observable<Booking>;
}
