import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingFacade } from '../../../application/booking/booking.facade';
import { AuthService } from '../../../core/auth/auth.service';
import { Booking } from '../../../domain/booking/booking.model';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
    selector: 'app-my-bookings-page',
    standalone: true,
    imports: [
        RouterLink,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        CurrencyCopPipe,
        LoadingComponent,
        EmptyStateComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="page">
      <h1>Mis reservas</h1>

      @if (loading()) {
        <app-loading />
      } @else if (!bookings().length) {
        <app-empty-state
          icon="event_busy"
          title="Aún no tienes reservas"
          message="Cuando reserves una cancha la verás aquí."
        >
          <a mat-flat-button color="primary" routerLink="/canchas">Buscar canchas</a>
        </app-empty-state>
      } @else {
        <div class="grid">
          @for (b of bookings(); track b.id) {
            <mat-card appearance="outlined">
              <mat-card-content>
                <header>
                  <h3>{{ b.courtName }}</h3>
                  <mat-chip [color]="chipColor(b.bookingStatus)" highlighted>
                    {{ statusLabel(b.bookingStatus) }}
                  </mat-chip>
                </header>
                <p><mat-icon>event</mat-icon> {{ b.date }} · {{ b.startTime }} - {{ b.endTime }}</p>
                <p><mat-icon>payments</mat-icon> {{ b.totalAmount | currencyCop }}</p>
              </mat-card-content>
              <mat-card-actions>
                @if (b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending') {
                  <button mat-button color="warn" (click)="cancel(b.id)">Cancelar</button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
    styles: [
        `
      .page { max-width: 1100px; margin: 24px auto; padding: 0 16px; }
      h1 { margin-bottom: 16px; }
      .grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
      header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      header h3 { margin: 0 0 8px; }
      p {
        display: flex; align-items: center; gap: 6px;
        margin: 4px 0; color: rgba(0, 0, 0, 0.7);
      }
      p mat-icon { font-size: 18px; width: 18px; height: 18px; }
    `,
    ],
})
export class MyBookingsPageComponent {
    private readonly bookingFacade = inject(BookingFacade);
    private readonly auth = inject(AuthService);
    private readonly snack = inject(MatSnackBar);

    protected readonly bookings = signal<Booking[]>([]);
    protected readonly loading = signal(true);

    constructor() {
        this.load();
    }

    cancel(id: string): void {
        this.bookingFacade.cancel(id).subscribe(() => {
            this.snack.open('Reserva cancelada', 'Cerrar', { duration: 3000 });
            this.load();
        });
    }

    statusLabel(s: Booking['bookingStatus']): string {
        return { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada' }[s];
    }

    chipColor(s: Booking['bookingStatus']): 'primary' | 'accent' | 'warn' | undefined {
        if (s === 'confirmed') return 'primary';
        if (s === 'cancelled') return 'warn';
        if (s === 'completed') return 'accent';
        return undefined;
    }

    private load(): void {
        this.loading.set(true);
        this.bookingFacade.byUser(this.auth.currentUser().id).subscribe((b) => {
            this.bookings.set(b);
            this.loading.set(false);
        });
    }
}
