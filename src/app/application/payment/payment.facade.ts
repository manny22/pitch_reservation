import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
    CreatePaymentRequest,
    PaymentGateway,
    PaymentTransaction,
} from '../../domain/payment/payment.gateway';

@Injectable({ providedIn: 'root' })
export class PaymentFacade {
    private readonly gateway = inject(PaymentGateway);

    createPayment(request: CreatePaymentRequest): Observable<PaymentTransaction> {
        return this.gateway.createPayment(request);
    }

    confirmPayment(transactionId: string): Observable<PaymentTransaction> {
        return this.gateway.confirmPayment(transactionId);
    }
}
