import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { BookingFacade } from '../../../application/booking/booking.facade';
import { Booking } from '../../../domain/booking/booking.model';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
    selector: 'app-confirmation-page',
    standalone: true,
    imports: [
        RouterLink,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDividerModule,
        CurrencyCopPipe,
        LoadingComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    @if (loading()) {
      <app-loading />
    } @else if (booking(); as b) {
      <div class="confirm">
        <div class="check">
          <mat-icon>check_circle</mat-icon>
        </div>
        <h1>¡Reserva confirmada!</h1>
        <p class="subtitle">Te enviamos los detalles a tu WhatsApp.</p>

        <mat-card appearance="outlined" class="ticket">
          <mat-card-content>
            <div class="row"><span>Cancha</span><strong>{{ b.courtName }}</strong></div>
            <div class="row"><span>Fecha</span><strong>{{ b.date }}</strong></div>
            <div class="row"><span>Hora</span><strong>{{ b.startTime }} - {{ b.endTime }}</strong></div>
            <div class="row"><span>Duración</span><strong>{{ b.duration }} h</strong></div>
            <mat-divider />
            <div class="row total"><span>Total pagado</span><strong>{{ b.totalAmount | currencyCop }}</strong></div>
            <div class="row"><span>Código</span><strong>{{ b.id.toUpperCase() }}</strong></div>
          </mat-card-content>
        </mat-card>

        <div class="actions">
          <a mat-flat-button color="primary" routerLink="/canchas">
            <mat-icon>map</mat-icon> Ver más canchas
          </a>
          <button mat-stroked-button (click)="share()">
            <mat-icon>share</mat-icon> Compartir con el equipo
          </button>
          <a mat-stroked-button routerLink="/mis-reservas">
            <mat-icon>event</mat-icon> Mis reservas
          </a>
        </div>
      </div>
    }
  `,
    styles: [
        `
      .confirm {
        max-width: 560px;
        margin: 32px auto;
        padding: 0 16px;
        text-align: center;
      }
      .check mat-icon { font-size: 72px; width: 72px; height: 72px; color: #2e7d32; }
      h1 { margin: 12px 0 4px; }
      .subtitle { color: rgba(0, 0, 0, 0.6); margin: 0 0 24px; }
      .ticket .row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        text-align: left;
      }
      .ticket .row span { color: rgba(0, 0, 0, 0.6); }
      .ticket .row.total { font-size: 1.05rem; }
      .actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin-top: 24px;
      }
    `,
    ],
})
export class ConfirmationPageComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly bookingFacade = inject(BookingFacade);

    protected readonly booking = signal<Booking | null>(null);
    protected readonly loading = signal(true);

    constructor() {
        const id = this.route.snapshot.paramMap.get('bookingId') ?? '';
        this.bookingFacade.getById(id).subscribe((b) => {
            this.booking.set(b ?? null);
            this.loading.set(false);
        });
    }

    share(): void {
        const b = this.booking();
        if (!b) return;
        const text = `¡Reserva confirmada! ${b.courtName} el ${b.date} a las ${b.startTime}. Código: ${b.id.toUpperCase()}`;
        if (navigator.share) {
            navigator.share({ title: 'Reserva La Red', text }).catch(() => undefined);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        }
    }
}
