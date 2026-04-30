import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs/operators';
import { BookingFacade } from '../../../application/booking/booking.facade';
import { PaymentFacade } from '../../../application/payment/payment.facade';
import { Booking } from '../../../domain/booking/booking.model';
import { PaymentMethod } from '../../../domain/payment/payment.gateway';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
    selector: 'app-payment-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatRadioModule,
        MatCardModule,
        MatDividerModule,
        MatProgressSpinnerModule,
        CurrencyCopPipe,
        LoadingComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './payment-page.component.html',
    styleUrl: './payment-page.component.scss',
})
export class PaymentPageComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
    private readonly bookingFacade = inject(BookingFacade);
    private readonly paymentFacade = inject(PaymentFacade);
    private readonly snack = inject(MatSnackBar);

    protected readonly booking = signal<Booking | null>(null);
    protected readonly loading = signal(true);
    protected readonly processing = signal(false);

    protected readonly form = this.fb.nonNullable.group({
        method: ['nequi' as PaymentMethod, Validators.required],
    });

    constructor() {
        const id = this.route.snapshot.paramMap.get('bookingId') ?? '';
        this.bookingFacade.getById(id).subscribe((b) => {
            this.loading.set(false);
            if (!b) {
                this.router.navigate(['/']);
                return;
            }
            this.booking.set(b);
        });
    }

    pay(): void {
        const b = this.booking();
        if (!b) return;
        this.processing.set(true);
        this.paymentFacade
            .createPayment({
                bookingId: b.id,
                amount: b.totalAmount,
                method: this.form.controls.method.value,
            })
            .pipe(switchMap((tx) => this.paymentFacade.confirmPayment(tx.id)))
            .subscribe({
                next: () => {
                    this.bookingFacade.markPaid(b.id).subscribe(() => {
                        this.processing.set(false);
                        this.router.navigate(['/confirmacion', b.id]);
                    });
                },
                error: () => {
                    this.processing.set(false);
                    this.bookingFacade.markFailed(b.id).subscribe();
                    this.snack.open('Pago rechazado. Intenta con otro método.', 'Cerrar', { duration: 5000 });
                },
            });
    }
}
