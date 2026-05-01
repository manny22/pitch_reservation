import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BookingFacade, BookingDraft } from './booking.facade';
import { BookingRepository } from '../../domain/booking/booking.repository';
import { Booking } from '../../domain/booking/booking.model';
import { Court } from '../../domain/court/court.model';
import { Promotion } from '../../domain/promotion/promotion.model';

const fakeCourt: Court = {
    id: 'c-1',
    name: 'Cancha Test',
    description: '',
    type: '5',
    pricePerHour: 100_000,
    photos: [],
    location: { address: '', city: '', zone: '', latitude: 0, longitude: 0 },
    amenities: { parking: true, showers: true, bibs: true, lighting: true, cafeteria: false },
    averageRating: 4.5,
    reviewsCount: 0,
    available: true,
    cancellationPolicy: '',
    ownerId: 'o-1',
};

const fakeBooking: Booking = {
    id: 'b-1',
    courtId: 'c-1',
    courtName: 'Cancha Test',
    userId: 'u-1',
    date: '2026-05-01',
    startTime: '10:00',
    endTime: '12:00',
    duration: 2,
    pricePerHour: 100_000,
    discountAmount: 0,
    totalAmount: 200_000,
    paymentStatus: 'pending',
    bookingStatus: 'pending',
    createdAt: new Date().toISOString(),
};

describe('BookingFacade', () => {
    let facade: BookingFacade;
    let repoMock: { [k: string]: jest.Mock };

    beforeEach(() => {
        repoMock = {
            findAll: jest.fn(),
            findByUser: jest.fn(),
            findByCourt: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            cancel: jest.fn(),
        };
        TestBed.configureTestingModule({
            providers: [{ provide: BookingRepository, useValue: repoMock }],
        });
        facade = TestBed.inject(BookingFacade);
    });

    describe('computeTotals()', () => {
        const draft: BookingDraft = { date: '2026-05-01', startTime: '10:00', duration: 2 };

        it('calcula subtotal = precio * duración', () => {
            const { subtotal } = facade.computeTotals(fakeCourt, draft);
            expect(subtotal).toBe(200_000);
        });

        it('sin promoción el discount es 0', () => {
            const { discount, total } = facade.computeTotals(fakeCourt, draft);
            expect(discount).toBe(0);
            expect(total).toBe(200_000);
        });

        it('aplica descuento porcentual (20%)', () => {
            const promo: Promotion = {
                id: 'p-1', courtId: 'c-1', title: '20%', description: '',
                type: 'percentage', value: 20,
                startsAt: '', endsAt: '', active: true,
            };
            const { discount, total } = facade.computeTotals(fakeCourt, draft, promo);
            expect(discount).toBe(40_000);
            expect(total).toBe(160_000);
        });

        it('aplica descuento fijo (30000)', () => {
            const promo: Promotion = {
                id: 'p-2', courtId: 'c-1', title: '-30k', description: '',
                type: 'fixed', value: 30_000,
                startsAt: '', endsAt: '', active: true,
            };
            const { discount, total } = facade.computeTotals(fakeCourt, draft, promo);
            expect(discount).toBe(30_000);
            expect(total).toBe(170_000);
        });

        it('descuento no puede superar el subtotal', () => {
            const promo: Promotion = {
                id: 'p-3', courtId: 'c-1', title: 'todo gratis', description: '',
                type: 'fixed', value: 999_999,
                startsAt: '', endsAt: '', active: true,
            };
            const { discount, total } = facade.computeTotals(fakeCourt, draft, promo);
            expect(discount).toBe(200_000);
            expect(total).toBe(0);
        });

        it('ignora promoción inactiva', () => {
            const promo: Promotion = {
                id: 'p-4', courtId: 'c-1', title: 'inactiva', description: '',
                type: 'percentage', value: 50,
                startsAt: '', endsAt: '', active: false,
            };
            const { discount } = facade.computeTotals(fakeCourt, draft, promo);
            expect(discount).toBe(0);
        });
    });

    describe('create()', () => {
        it('calcula endTime correctamente y llama a repository.create', (done) => {
            repoMock['create'].mockReturnValue(of(fakeBooking));
            const draft: BookingDraft = { date: '2026-05-01', startTime: '10:00', duration: 2 };
            facade.create({ court: fakeCourt, userId: 'u-1', draft }).subscribe(() => {
                const payload = repoMock['create'].mock.calls[0][0];
                expect(payload.endTime).toBe('12:00');
                expect(payload.totalAmount).toBe(200_000);
                expect(payload.bookingStatus).toBe('pending');
                done();
            });
        });
    });

    it('cancel() delega al repositorio', (done) => {
        repoMock['cancel'].mockReturnValue(of({ ...fakeBooking, bookingStatus: 'cancelled' }));
        facade.cancel('b-1').subscribe((b) => {
            expect(b.bookingStatus).toBe('cancelled');
            expect(repoMock['cancel']).toHaveBeenCalledWith('b-1');
            done();
        });
    });

    it('markPaid() actualiza paymentStatus y bookingStatus', (done) => {
        const paid = { ...fakeBooking, paymentStatus: 'paid' as const, bookingStatus: 'confirmed' as const };
        repoMock['update'].mockReturnValue(of(paid));
        facade.markPaid('b-1').subscribe((b) => {
            expect(repoMock['update']).toHaveBeenCalledWith('b-1', {
                paymentStatus: 'paid',
                bookingStatus: 'confirmed',
            });
            done();
        });
    });

    it('byUser() filtra por userId', (done) => {
        repoMock['findByUser'].mockReturnValue(of([fakeBooking]));
        facade.byUser('u-1').subscribe((list) => {
            expect(list).toHaveLength(1);
            expect(repoMock['findByUser']).toHaveBeenCalledWith('u-1');
            done();
        });
    });
});
