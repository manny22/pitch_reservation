import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CourtFacade } from '../../../application/court/court.facade';
import { BookingFacade } from '../../../application/booking/booking.facade';
import { PromotionFacade } from '../../../application/promotion/promotion.facade';
import { Booking } from '../../../domain/booking/booking.model';
import { Court } from '../../../domain/court/court.model';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [MatCardModule, MatIconModule, CurrencyCopPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <h1>Resumen</h1>
    <div class="metrics">
      <mat-card appearance="outlined">
        <mat-card-content>
          <mat-icon>stadium</mat-icon>
          <span class="value">{{ courts().length }}</span>
          <span class="label">Canchas activas</span>
        </mat-card-content>
      </mat-card>
      <mat-card appearance="outlined">
        <mat-card-content>
          <mat-icon>event</mat-icon>
          <span class="value">{{ bookings().length }}</span>
          <span class="label">Reservas totales</span>
        </mat-card-content>
      </mat-card>
      <mat-card appearance="outlined">
        <mat-card-content>
          <mat-icon>payments</mat-icon>
          <span class="value">{{ income() | currencyCop }}</span>
          <span class="label">Ingresos confirmados</span>
        </mat-card-content>
      </mat-card>
      <mat-card appearance="outlined">
        <mat-card-content>
          <mat-icon>local_offer</mat-icon>
          <span class="value">{{ promotionsCount() }}</span>
          <span class="label">Promociones activas</span>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [
        `
      h1 { margin: 0 0 16px; }
      .metrics {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
      mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      mat-icon { color: #1b5e20; font-size: 28px; width: 28px; height: 28px; }
      .value { font-size: 1.6rem; font-weight: 700; }
      .label { color: rgba(0, 0, 0, 0.6); }
    `,
    ],
})
export class AdminDashboardComponent {
    private readonly courtFacade = inject(CourtFacade);
    private readonly bookingFacade = inject(BookingFacade);
    private readonly promotionFacade = inject(PromotionFacade);

    protected readonly courts = signal<Court[]>([]);
    protected readonly bookings = signal<Booking[]>([]);
    protected readonly promotionsCount = signal(0);

    protected readonly income = computed(() =>
        this.bookings()
            .filter((b) => b.paymentStatus === 'paid')
            .reduce((sum, b) => sum + b.totalAmount, 0),
    );

    constructor() {
        this.courtFacade.search().subscribe((c) => this.courts.set(c));
        this.bookingFacade.list().subscribe((b) => this.bookings.set(b));
        this.promotionFacade.active().subscribe((p) => this.promotionsCount.set(p.length));
    }
}
