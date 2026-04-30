import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Court, CourtType } from '../../../domain/court/court.model';

@Component({
    selector: 'app-court-form-dialog',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCheckboxModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nueva' }} cancha</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="content">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput rows="2" formControlName="description"></textarea>
        </mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="type">
              <mat-option value="5">Fútbol 5</mat-option>
              <mat-option value="7">Fútbol 7</mat-option>
              <mat-option value="8">Fútbol 8</mat-option>
              <mat-option value="11">Fútbol 11</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Precio por hora</mat-label>
            <input matInput type="number" formControlName="pricePerHour" />
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Ciudad</mat-label>
            <input matInput formControlName="city" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Zona</mat-label>
            <input matInput formControlName="zone" />
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="address" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Política de cancelación</mat-label>
          <input matInput formControlName="cancellationPolicy" />
        </mat-form-field>
        <div class="amenities">
          <mat-checkbox formControlName="parking">Parqueadero</mat-checkbox>
          <mat-checkbox formControlName="showers">Vestuarios</mat-checkbox>
          <mat-checkbox formControlName="bibs">Petos</mat-checkbox>
          <mat-checkbox formControlName="lighting">Iluminación</mat-checkbox>
          <mat-checkbox formControlName="cafeteria">Cafetería</mat-checkbox>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="ref.close()">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
    styles: [
        `
      .content { display: flex; flex-direction: column; gap: 4px; min-width: 320px; }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .amenities { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
    `,
    ],
})
export class CourtFormDialogComponent {
    protected readonly ref = inject(MatDialogRef<CourtFormDialogComponent>);
    protected readonly data = inject<Court | null>(MAT_DIALOG_DATA);
    private readonly fb = inject(FormBuilder);

    protected readonly form = this.fb.nonNullable.group({
        name: [this.data?.name ?? '', Validators.required],
        description: [this.data?.description ?? '', Validators.required],
        type: [(this.data?.type ?? '5') as CourtType, Validators.required],
        pricePerHour: [this.data?.pricePerHour ?? 50000, [Validators.required, Validators.min(1000)]],
        city: [this.data?.location.city ?? 'Cartagena', Validators.required],
        zone: [this.data?.location.zone ?? '', Validators.required],
        address: [this.data?.location.address ?? '', Validators.required],
        cancellationPolicy: [this.data?.cancellationPolicy ?? 'Cancelación gratis hasta 12 horas antes.'],
        parking: [this.data?.amenities.parking ?? false],
        showers: [this.data?.amenities.showers ?? false],
        bibs: [this.data?.amenities.bibs ?? false],
        lighting: [this.data?.amenities.lighting ?? true],
        cafeteria: [this.data?.amenities.cafeteria ?? false],
    });

    save(): void {
        if (this.form.invalid) return;
        const v = this.form.getRawValue();
        const result: Partial<Court> = {
            name: v.name,
            description: v.description,
            type: v.type,
            pricePerHour: v.pricePerHour,
            photos: this.data?.photos ?? ['https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800'],
            location: {
                address: v.address,
                city: v.city,
                zone: v.zone,
                latitude: this.data?.location.latitude ?? 10.4006,
                longitude: this.data?.location.longitude ?? -75.5247,
            },
            amenities: {
                parking: v.parking,
                showers: v.showers,
                bibs: v.bibs,
                lighting: v.lighting,
                cafeteria: v.cafeteria,
            },
            averageRating: this.data?.averageRating ?? 0,
            reviewsCount: this.data?.reviewsCount ?? 0,
            available: this.data?.available ?? true,
            cancellationPolicy: v.cancellationPolicy,
            ownerId: this.data?.ownerId ?? 'u-owner-1',
        };
        this.ref.close(result);
    }
}
