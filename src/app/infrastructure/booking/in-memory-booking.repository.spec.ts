import { TestBed } from '@angular/core/testing';
import { InMemoryBookingRepository } from './in-memory-booking.repository';

const baseInput = {
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
    paymentStatus: 'pending' as const,
    bookingStatus: 'pending' as const,
};

describe('InMemoryBookingRepository', () => {
    let repo: InMemoryBookingRepository;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        repo = TestBed.inject(InMemoryBookingRepository);
    });

    it('inicia sin reservas', (done) => {
        repo.findAll().subscribe((list) => {
            expect(list).toHaveLength(0);
            done();
        });
    });

    it('create() genera id y createdAt', (done) => {
        repo.create(baseInput).subscribe((b) => {
            expect(b.id).toMatch(/^b-/);
            expect(b.createdAt).toBeTruthy();
            done();
        });
    });

    it('findByUser() devuelve solo reservas del usuario', (done) => {
        repo.create(baseInput).subscribe(() => {
            repo.create({ ...baseInput, userId: 'u-99' }).subscribe(() => {
                repo.findByUser('u-1').subscribe((list) => {
                    expect(list.every((b) => b.userId === 'u-1')).toBe(true);
                    expect(list).toHaveLength(1);
                    done();
                });
            });
        });
    });

    it('findByCourt() devuelve solo reservas de esa cancha', (done) => {
        repo.create(baseInput).subscribe(() => {
            repo.create({ ...baseInput, courtId: 'c-99' }).subscribe(() => {
                repo.findByCourt('c-1').subscribe((list) => {
                    expect(list.every((b) => b.courtId === 'c-1')).toBe(true);
                    done();
                });
            });
        });
    });

    it('cancel() cambia bookingStatus a cancelled', (done) => {
        repo.create(baseInput).subscribe((created) => {
            repo.cancel(created.id).subscribe((cancelled) => {
                expect(cancelled.bookingStatus).toBe('cancelled');
                done();
            });
        });
    });

    it('update() actualiza campos parciales', (done) => {
        repo.create(baseInput).subscribe((created) => {
            repo.update(created.id, { paymentStatus: 'paid', bookingStatus: 'confirmed' }).subscribe((updated) => {
                expect(updated.paymentStatus).toBe('paid');
                expect(updated.bookingStatus).toBe('confirmed');
                expect(updated.userId).toBe('u-1'); // campos no tocados se conservan
                done();
            });
        });
    });
});
