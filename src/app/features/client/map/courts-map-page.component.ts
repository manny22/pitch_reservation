import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CourtMapComponent,
  GeolocationErrorReason,
} from '../../../shared/components/court-map/court-map.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { CourtFacade } from '../../../application/court/court.facade';
import { Court } from '../../../domain/court/court.model';

@Component({
  selector: 'app-courts-map-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    CourtMapComponent,
    LoadingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page" [formGroup]="form">
      <header class="head">
        <div>
          <h1>Mapa de canchas</h1>
          <p>Visualiza todas las canchas disponibles en tu zona.</p>
        </div>
        <div class="filters">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="type">
              <mat-option value="">Todos</mat-option>
              <mat-option value="5">Fútbol 5</mat-option>
              <mat-option value="7">Fútbol 7</mat-option>
              <mat-option value="8">Fútbol 8</mat-option>
              <mat-option value="11">Fútbol 11</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-checkbox formControlName="onlyAvailable">Solo disponibles</mat-checkbox>
        </div>
      </header>

      <div class="legend">
        <span><i class="dot dot-available"></i> Disponible</span>
        <span><i class="dot dot-unavailable"></i> Ocupada</span>
      </div>

      @if (loading()) {
        <app-loading />
      } @else {
        <app-court-map
          [courts]="filtered()"
          height="70vh"
          [locateUser]="true"
          (geolocationError)="onGeoError($event)"
        />
      }
    </div>
  `,
  styles: [
    `
      .page { max-width: 1280px; margin: 24px auto; padding: 0 16px; }
      .head {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 12px;
      }
      .head h1 { margin: 0; }
      .head p { margin: 0; color: rgba(0, 0, 0, 0.6); }
      .filters {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }
      .legend {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
        color: rgba(0, 0, 0, 0.7);
        font-size: 0.9rem;
      }
      .legend span { display: inline-flex; align-items: center; gap: 6px; }
      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
      }
      .dot-available { background: #2e7d32; }
      .dot-unavailable { background: #9e9e9e; }
      @media (min-width: 768px) {
        .head { flex-direction: row; align-items: flex-end; justify-content: space-between; }
      }
    `,
  ],
})
export class CourtsMapPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly courtFacade = inject(CourtFacade);
  private readonly snack = inject(MatSnackBar);

  protected readonly form = this.fb.nonNullable.group({
    type: '',
    onlyAvailable: false,
  });

  protected readonly courts = signal<Court[]>([]);
  protected readonly loading = signal(true);
  private readonly filterTick = signal(0);

  protected readonly filtered = computed(() => {
    this.filterTick();
    const v = this.form.getRawValue();
    return this.courts().filter((c) => {
      if (v.type && c.type !== v.type) return false;
      if (v.onlyAvailable && !c.available) return false;
      return true;
    });
  });

  constructor() {
    this.courtFacade.search().subscribe({
      next: (list) => {
        this.courts.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.form.valueChanges.subscribe(() => this.filterTick.update((n) => n + 1));
  }

  protected onGeoError(reason: GeolocationErrorReason): void {
    const messages: Record<GeolocationErrorReason, string> = {
      unsupported: 'Tu navegador no soporta geolocalización.',
      insecure: 'La geolocalización requiere HTTPS o localhost.',
      denied: 'Permiso de ubicación denegado. Actívalo en el navegador.',
      unavailable: 'No pudimos obtener tu ubicación en este momento.',
      timeout: 'Tomó demasiado tiempo obtener tu ubicación.',
    };
    this.snack.open(messages[reason], 'Cerrar', { duration: 5000 });
  }
}
