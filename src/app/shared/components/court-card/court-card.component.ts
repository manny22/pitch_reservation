import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Court } from '../../../domain/court/court.model';
import { CurrencyCopPipe } from '../../pipes/currency-cop.pipe';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

@Component({
    selector: 'app-court-card',
    standalone: true,
    imports: [
        RouterLink,
        MatCardModule,
        MatChipsModule,
        MatButtonModule,
        MatIconModule,
        CurrencyCopPipe,
        RatingStarsComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <mat-card class="court-card" appearance="outlined">
      <div class="image" [style.background-image]="'url(' + court().photos[0] + ')'">
        @if (court().activePromotionId) {
          <span class="badge promo">Promo</span>
        }
        <span class="badge availability" [class.unavailable]="!court().available">
          {{ court().available ? 'Disponible' : 'Ocupada' }}
        </span>
      </div>
      <mat-card-content>
        <h3>{{ court().name }}</h3>
        <p class="zone">
          <mat-icon>place</mat-icon>{{ court().location.zone }} · {{ court().location.city }}
        </p>
        <div class="meta">
          <app-rating-stars [value]="court().averageRating"></app-rating-stars>
          <small>({{ court().reviewsCount }})</small>
        </div>
        <p class="price">{{ court().pricePerHour | currencyCop }} <small>/ hora</small></p>
      </mat-card-content>
      <mat-card-actions align="end">
        <a mat-flat-button color="primary" [routerLink]="['/canchas', court().id]">Ver detalles</a>
      </mat-card-actions>
    </mat-card>
  `,
    styleUrl: './court-card.component.scss',
})
export class CourtCardComponent {
    readonly court = input.required<Court>();
}
