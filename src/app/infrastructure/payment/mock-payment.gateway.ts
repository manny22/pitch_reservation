import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import {
    CreatePaymentRequest,
    PaymentGateway,
    PaymentTransaction,
} from '../../domain/payment/payment.gateway';

@Injectable({ providedIn: 'root' })
export class MockPaymentGateway extends PaymentGateway {
    createPayment(request: CreatePaymentRequest): Observable<PaymentTransaction> {
        const tx: PaymentTransaction = {
            id: `tx-${Date.now()}`,
            bookingId: request.bookingId,
            amount: request.amount,
            method: request.method,
            status: 'pending',
            createdAt: new Date().toISOString(),
            reference: `LR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        };
        return of(tx).pipe(delay(600));
    }

    confirmPayment(transactionId: string): Observable<PaymentTransaction> {
        return of(transactionId).pipe(
            delay(900),
            mergeMap((id) => {
                const success = Math.random() > 0.15;
                if (!success) {
                    return throwError(() => new Error('Pago rechazado por la pasarela.'));
                }
                const tx: PaymentTransaction = {
                    id,
                    bookingId: '',
                    amount: 0,
                    method: 'card',
                    status: 'paid',
                    createdAt: new Date().toISOString(),
                };
                return of(tx);
            }),
        );
    }
}
