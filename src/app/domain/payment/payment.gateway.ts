import { Observable } from 'rxjs';

export type PaymentMethod = 'nequi' | 'daviplata' | 'card';
export type PaymentTransactionStatus = 'pending' | 'paid' | 'failed';

export interface CreatePaymentRequest {
    bookingId: string;
    amount: number;
    method: PaymentMethod;
    payerEmail?: string;
    payerName?: string;
}

export interface PaymentTransaction {
    id: string;
    bookingId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentTransactionStatus;
    createdAt: string;
    reference?: string;
}

export abstract class PaymentGateway {
    abstract createPayment(request: CreatePaymentRequest): Observable<PaymentTransaction>;
    abstract confirmPayment(transactionId: string): Observable<PaymentTransaction>;
}
