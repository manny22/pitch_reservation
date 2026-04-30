import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-empty-state',
    standalone: true,
    imports: [MatIconModule, MatButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="empty">
      <mat-icon>{{ icon() }}</mat-icon>
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
      <ng-content></ng-content>
    </div>
  `,
    styles: [
        `
      .empty {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; padding: 48px 24px; color: rgba(0,0,0,0.6); gap: 8px;
      }
      .empty mat-icon { font-size: 56px; width: 56px; height: 56px; color: rgba(0,0,0,0.35); }
      .empty h3 { margin: 0; font-size: 1.1rem; color: rgba(0,0,0,0.85); }
      .empty p { margin: 0; max-width: 360px; }
    `,
    ],
})
export class EmptyStateComponent {
    readonly icon = input<string>('inbox');
    readonly title = input<string>('Sin resultados');
    readonly message = input<string>('No encontramos información para mostrar.');
}
