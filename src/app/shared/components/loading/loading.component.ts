import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="loading">
      <mat-spinner diameter="40"></mat-spinner>
      <span>Cargando...</span>
    </div>
  `,
    styles: [
        `
      .loading {
        display: flex; flex-direction: column; align-items: center; gap: 12px;
        padding: 32px; color: rgba(0,0,0,0.6);
      }
    `,
    ],
})
export class LoadingComponent { }
