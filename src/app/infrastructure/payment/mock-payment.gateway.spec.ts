import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { MockPaymentGateway } from './mock-payment.gateway';

describe('MockPaymentGateway', () => {
    let gateway: MockPaymentGateway;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        gateway = TestBed.inject(MockPaymentGateway);
    });

    it('createPayment() devuelve transacción en estado pending', (done) => {
        gateway
            .createPayment({ bookingId: 'b-1', amount: 100_000, method: 'nequi' })
            .subscribe((tx) => {
                expect(tx.id).toMatch(/^tx-/);
                expect(tx.bookingId).toBe('b-1');
                expect(tx.amount).toBe(100_000);
                expect(tx.status).toBe('pending');
                expect(tx.reference).toBeTruthy();
                done();
            });
    });

    it('confirmPayment() completa la transacción cuando Math.random > 0.15 (mock exitoso)', (done) => {
        jest.spyOn(Math, 'random').mockReturnValue(0.99);
        gateway.confirmPayment('tx-123').subscribe({
            next: (tx) => {
                expect(tx.status).toBe('paid');
                jest.restoreAllMocks();
                done();
            },
            error: () => {
                jest.restoreAllMocks();
                done.fail('No debería fallar');
            },
        });
    });

    it('confirmPayment() lanza error cuando Math.random <= 0.15 (mock fallo)', (done) => {
        jest.spyOn(Math, 'random').mockReturnValue(0.01);
        gateway.confirmPayment('tx-123').subscribe({
            next: () => {
                jest.restoreAllMocks();
                done.fail('Debería haber fallado');
            },
            error: (err: Error) => {
                expect(err.message).toContain('rechazado');
                jest.restoreAllMocks();
                done();
            },
        });
    });
});
