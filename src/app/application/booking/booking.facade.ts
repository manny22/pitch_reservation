import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from '../../domain/booking/booking.model';
import { BookingRepository } from '../../domain/booking/booking.repository';
import { Court } from '../../domain/court/court.model';
import { Promotion } from '../../domain/promotion/promotion.model';

export interface BookingDraft {
    date: string;
    startTime: string;
    duration: number;
}

@Injectable({ providedIn: 'root' })
export class BookingFacade {
    private readonly repository = inject(BookingRepository);

    list(): Observable<Booking[]> {
        return this.repository.findAll();
    }

    byUser(userId: string): Observable<Booking[]> {
        return this.repository.findByUser(userId);
    }

    byCourt(courtId: string): Observable<Booking[]> {
        return this.repository.findByCourt(courtId);
    }

    getById(id: string): Observable<Booking | undefined> {
        return this.repository.findById(id);
    }

    cancel(id: string) {
        return this.repository.cancel(id);
    }

    computeTotals(court: Court, draft: BookingDraft, promotion?: Promotion) {
        const subtotal = court.pricePerHour * draft.duration;
        let discount = 0;
        if (promotion && promotion.active) {
            discount = promotion.type === 'percentage' ? (subtotal * promotion.value) / 100 : promotion.value;
        }
        discount = Math.min(discount, subtotal);
        return { subtotal, discount, total: subtotal - discount };
    }

    create(input: {
        court: Court;
        userId: string;
        draft: BookingDraft;
        promotion?: Promotion;
    }): Observable<Booking> {
        const { court, draft, promotion, userId } = input;
        const totals = this.computeTotals(court, draft, promotion);
        const startHour = parseInt(draft.startTime.split(':')[0], 10);
        const endHour = startHour + draft.duration;
        const endTime = `${endHour.toString().padStart(2, '0')}:00`;
        return this.repository.create({
            courtId: court.id,
            courtName: court.name,
            userId,
            date: draft.date,
            startTime: draft.startTime,
            endTime,
            duration: draft.duration,
            pricePerHour: court.pricePerHour,
            discountAmount: totals.discount,
            totalAmount: totals.total,
            paymentStatus: 'pending',
            bookingStatus: 'pending',
        });
    }

    markPaid(id: string) {
        return this.repository.update(id, { paymentStatus: 'paid', bookingStatus: 'confirmed' });
    }

    markFailed(id: string) {
        return this.repository.update(id, { paymentStatus: 'failed' });
    }
}
