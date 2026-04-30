import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CourtFacade } from '../../../application/court/court.facade';
import { PromotionFacade } from '../../../application/promotion/promotion.facade';
import { BookingFacade } from '../../../application/booking/booking.facade';
import { AuthService } from '../../../core/auth/auth.service';
import { Court } from '../../../domain/court/court.model';
import { Promotion } from '../../../domain/promotion/promotion.model';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
    selector: 'app-booking-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatDividerModule,
        CurrencyCopPipe,
        LoadingComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './booking-page.component.html',
    styleUrl: './booking-page.component.scss',
})
export class BookingPageComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
    private readonly courtFacade = inject(CourtFacade);
    private readonly promotionFacade = inject(PromotionFacade);
    private readonly bookingFacade = inject(BookingFacade);
    private readonly auth = inject(AuthService);

    protected readonly court = signal<Court | null>(null);
    protected readonly promotion = signal<Promotion | null>(null);
    protected readonly slots = signal<string[]>([]);
    protected readonly loading = signal(true);
    protected readonly submitting = signal(false);
    protected readonly today = new Date();

    protected readonly form = this.fb.nonNullable.group({
        date: [new Date(), Validators.required],
        startTime: ['', Validators.required],
        duration: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
    });

    protected readonly totals = computed(() => {
        const c = this.court();
        if (!c) return { subtotal: 0, discount: 0, total: 0 };
        const v = this.form.getRawValue();
        const draft = {
            date: this.formatDate(v.date),
            startTime: v.startTime,
            duration: v.duration,
        };
        return this.bookingFacade.computeTotals(c, draft, this.promotion() ?? undefined);
    });

    constructor() {
        const id = this.route.snapshot.paramMap.get('courtId') ?? '';
        this.courtFacade.getById(id).subscribe((c) => {
            this.loading.set(false);
            if (!c) {
                this.router.navigate(['/canchas']);
                return;
            }
            this.court.set(c);
            this.courtFacade
                .availableSlots(c.id, this.formatDate(this.form.controls.date.value))
                .subscribe((s) => {
                    this.slots.set(s);
                    if (s.length) this.form.controls.startTime.setValue(s[0]);
                });
            if (c.activePromotionId) {
                this.promotionFacade.byId(c.activePromotionId).subscribe((p) => this.promotion.set(p ?? null));
            }
        });

        this.form.controls.date.valueChanges.subscribe((d) => {
            const c = this.court();
            if (!c || !d) return;
            this.courtFacade.availableSlots(c.id, this.formatDate(d)).subscribe((s) => {
                this.slots.set(s);
                if (s.length) this.form.controls.startTime.setValue(s[0]);
            });
        });

        // Trigger recompute on form changes
        this.form.valueChanges.subscribe(() => this.form);
    }

    confirm(): void {
        const c = this.court();
        if (!c || this.form.invalid) return;
        if (!this.auth.isAuthenticated()) {
            this.router.navigate(['/auth/login'], { queryParams: { redirect: `/reservar/${c.id}` } });
            return;
        }
        this.submitting.set(true);
        const v = this.form.getRawValue();
        this.bookingFacade
            .create({
                court: c,
                userId: this.auth.currentUser().id,
                draft: { date: this.formatDate(v.date), startTime: v.startTime, duration: v.duration },
                promotion: this.promotion() ?? undefined,
            })
            .subscribe({
                next: (b) => this.router.navigate(['/pago', b.id]),
                error: () => this.submitting.set(false),
            });
    }

    private formatDate(d: Date): string {
        return d.toISOString().slice(0, 10);
    }
}
