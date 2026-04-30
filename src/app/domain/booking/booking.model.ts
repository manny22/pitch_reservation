export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Booking {
    id: string;
    courtId: string;
    courtName: string;
    userId: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    pricePerHour: number;
    discountAmount: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
    createdAt: string;
}
