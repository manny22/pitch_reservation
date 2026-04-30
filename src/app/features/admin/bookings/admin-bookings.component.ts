import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingFacade } from '../../../application/booking/booking.facade';
import { Booking } from '../../../domain/booking/booking.model';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
    selector: 'app-admin-bookings',
    standalone: true,
    imports: [
        MatTableModule,
        MatChipsModule,
        MatButtonModule,
        MatIconModule,
        CurrencyCopPipe,
        EmptyStateComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <h1>Reservas</h1>
    @if (!bookings().length) {
      <app-empty-state icon="event_busy" title="Sin reservas" message="Aún no se han registrado reservas." />
    } @else {
      <table mat-table [dataSource]="bookings()" class="mat-elevation-z1">
        <ng-container matColumnDef="court">
          <th mat-header-cell *matHeaderCellDef>Cancha</th>
          <td mat-cell *matCellDef="let b">{{ b.courtName }}</td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Fecha / Hora</th>
          <td mat-cell *matCellDef="let b">{{ b.date }} · {{ b.startTime }}</td>
        </ng-container>
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let b">{{ b.totalAmount | currencyCop }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let b">
            <mat-chip [color]="chipColor(b.bookingStatus)" highlighted>{{ statusLabel(b.bookingStatus) }}</mat-chip>
          </td>
        </ng-container>
        <ng-container matColumnDef="payment">
          <th mat-header-cell *matHeaderCellDef>Pago</th>
          <td mat-cell *matCellDef="let b">{{ paymentLabel(b.paymentStatus) }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayed"></tr>
        <tr mat-row *matRowDef="let row; columns: displayed"></tr>
      </table>
    }
  `,
    styles: [
        `
      h1 { margin: 0 0 16px; }
      table { width: 100%; background: #fff; border-radius: 8px; overflow: hidden; }
    `,
    ],
})
export class AdminBookingsComponent {
    private readonly facade = inject(BookingFacade);
    protected readonly bookings = signal<Booking[]>([]);
    protected readonly displayed = ['court', 'date', 'amount', 'status', 'payment'];

    constructor() {
        this.facade.list().subscribe((b) => this.bookings.set(b));
    }

    statusLabel(s: Booking['bookingStatus']): string {
        return { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada' }[s];
    }

    paymentLabel(s: Booking['paymentStatus']): string {
        return { pending: 'Pendiente', paid: 'Pagado', failed: 'Fallido', refunded: 'Reembolsado' }[s];
    }

    chipColor(s: Booking['bookingStatus']): 'primary' | 'accent' | 'warn' | undefined {
        if (s === 'confirmed') return 'primary';
        if (s === 'cancelled') return 'warn';
        if (s === 'completed') return 'accent';
        return undefined;
    }
}
