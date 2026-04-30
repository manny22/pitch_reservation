import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourtFacade } from '../../../application/court/court.facade';
import { Court } from '../../../domain/court/court.model';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { CourtFormDialogComponent } from './court-form.dialog';

@Component({
    selector: 'app-admin-courts',
    standalone: true,
    imports: [
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        CurrencyCopPipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <header class="head">
      <h1>Gestión de canchas</h1>
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> Nueva cancha
      </button>
    </header>

    <table mat-table [dataSource]="courts()" class="mat-elevation-z1">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Nombre</th>
        <td mat-cell *matCellDef="let c">{{ c.name }}</td>
      </ng-container>
      <ng-container matColumnDef="type">
        <th mat-header-cell *matHeaderCellDef>Tipo</th>
        <td mat-cell *matCellDef="let c">Fútbol {{ c.type }}</td>
      </ng-container>
      <ng-container matColumnDef="zone">
        <th mat-header-cell *matHeaderCellDef>Zona</th>
        <td mat-cell *matCellDef="let c">{{ c.location.zone }}</td>
      </ng-container>
      <ng-container matColumnDef="price">
        <th mat-header-cell *matHeaderCellDef>Precio/h</th>
        <td mat-cell *matCellDef="let c">{{ c.pricePerHour | currencyCop }}</td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef class="actions-col">Acciones</th>
        <td mat-cell *matCellDef="let c" class="actions-col">
          <button mat-icon-button (click)="openForm(c)" aria-label="Editar"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button color="warn" (click)="remove(c)" aria-label="Eliminar"><mat-icon>delete</mat-icon></button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayed"></tr>
      <tr mat-row *matRowDef="let row; columns: displayed"></tr>
    </table>
  `,
    styles: [
        `
      .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      table { width: 100%; background: #fff; border-radius: 8px; overflow: hidden; }
      .actions-col { text-align: right; width: 120px; }
    `,
    ],
})
export class AdminCourtsComponent {
    private readonly facade = inject(CourtFacade);
    private readonly dialog = inject(MatDialog);
    private readonly snack = inject(MatSnackBar);

    protected readonly courts = signal<Court[]>([]);
    protected readonly displayed = ['name', 'type', 'zone', 'price', 'actions'];

    constructor() {
        this.load();
    }

    openForm(court?: Court): void {
        const ref = this.dialog.open(CourtFormDialogComponent, { data: court ?? null, width: '520px' });
        ref.afterClosed().subscribe((result?: Partial<Court>) => {
            if (!result) return;
            const action$ = court
                ? this.facade.update(court.id, result)
                : this.facade.create(result as Omit<Court, 'id'>);
            action$.subscribe(() => {
                this.snack.open(court ? 'Cancha actualizada' : 'Cancha creada', 'Cerrar', { duration: 3000 });
                this.load();
            });
        });
    }

    remove(court: Court): void {
        if (!confirm(`¿Eliminar la cancha "${court.name}"?`)) return;
        this.facade.delete(court.id).subscribe(() => {
            this.snack.open('Cancha eliminada', 'Cerrar', { duration: 3000 });
            this.load();
        });
    }

    private load(): void {
        this.facade.search().subscribe((c) => this.courts.set(c));
    }
}
