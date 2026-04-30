import { Provider } from '@angular/core';
import { CourtRepository } from '../domain/court/court.repository';
import { BookingRepository } from '../domain/booking/booking.repository';
import { ReviewRepository } from '../domain/review/review.model';
import { PromotionRepository } from '../domain/promotion/promotion.model';
import { PaymentGateway } from '../domain/payment/payment.gateway';
import { InMemoryCourtRepository } from '../infrastructure/court/in-memory-court.repository';
import { InMemoryBookingRepository } from '../infrastructure/booking/in-memory-booking.repository';
import { InMemoryReviewRepository } from '../infrastructure/review/in-memory-review.repository';
import { InMemoryPromotionRepository } from '../infrastructure/promotion/in-memory-promotion.repository';
import { MockPaymentGateway } from '../infrastructure/payment/mock-payment.gateway';

export const INFRASTRUCTURE_PROVIDERS: Provider[] = [
    { provide: CourtRepository, useClass: InMemoryCourtRepository },
    { provide: BookingRepository, useClass: InMemoryBookingRepository },
    { provide: ReviewRepository, useClass: InMemoryReviewRepository },
    { provide: PromotionRepository, useClass: InMemoryPromotionRepository },
    { provide: PaymentGateway, useClass: MockPaymentGateway },
];
