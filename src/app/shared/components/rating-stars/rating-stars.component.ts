import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-rating-stars',
    standalone: true,
    imports: [MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <span class="rating" [attr.aria-label]="'Calificación ' + value() + ' de 5'">
      @for (star of stars; track $index) {
        <mat-icon [class.filled]="star <= value()">
          {{ star <= value() ? 'star' : 'star_border' }}
        </mat-icon>
      }
      @if (showValue()) {
        <small>{{ value().toFixed(1) }}</small>
      }
    </span>
  `,
    styles: [
        `
      .rating { display: inline-flex; align-items: center; gap: 2px; color: #f5a623; }
      .rating mat-icon { font-size: 18px; width: 18px; height: 18px; }
      .rating small { margin-left: 6px; color: rgba(0,0,0,0.7); font-weight: 500; }
    `,
    ],
})
export class RatingStarsComponent {
    readonly value = input<number>(0);
    readonly showValue = input<boolean>(true);
    readonly stars = [1, 2, 3, 4, 5];
}
