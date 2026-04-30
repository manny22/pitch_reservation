import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PromotionFacade } from '../../../application/promotion/promotion.facade';
import { Promotion } from '../../../domain/promotion/promotion.model';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
    selector: 'app-admin-promotions',
    standalone: true,
    imports: [
        SlicePipe,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
        CurrencyCopPipe,
        EmptyStateComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <h1>Promociones activas</h1>
    @if (!items().length) {
      <app-empty-state icon="local_offer" title="Sin promociones" message="Aún no hay promociones activas." />
    } @else {
      <table mat-table [dataSource]="items()" class="mat-elevation-z1">
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Promoción</th>
          <td mat-cell *matCellDef="let p">{{ p.title }}</td>
        </ng-container>
        <ng-container matColumnDef="value">
          <th mat-header-cell *matHeaderCellDef>Descuento</th>
          <td mat-cell *matCellDef="let p">
            {{ p.type === 'percentage' ? p.value + '%' : (p.value | currencyCop) }}
          </td>
        </ng-container>
        <ng-container matColumnDef="dates">
          <th mat-header-cell *matHeaderCellDef>Vigencia</th>
          <td mat-cell *matCellDef="let p">{{ p.startsAt | slice: 0:10 }} → {{ p.endsAt | slice: 0:10 }}</td>
        </ng-container>
        <ng-container matColumnDef="active">
          <th mat-header-cell *matHeaderCellDef>Activa</th>
          <td mat-cell *matCellDef="let p">
            <mat-slide-toggle [checked]="p.active" (change)="toggle(p, $event.checked)" />
          </td>
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
export class AdminPromotionsComponent {
    private readonly facade = inject(PromotionFacade);
    private readonly snack = inject(MatSnackBar);
    protected readonly items = signal<Promotion[]>([]);
    protected readonly displayed = ['title', 'value', 'dates', 'active'];

    constructor() {
        this.load();
    }

    toggle(p: Promotion, active: boolean): void {
        this.facade.update(p.id, { active }).subscribe(() => {
            this.snack.open(active ? 'Promoción activada' : 'Promoción pausada', 'Cerrar', { duration: 2500 });
            this.load();
        });
    }

    private load(): void {
        this.facade.active().subscribe((list) => this.items.set(list));
    }
}
