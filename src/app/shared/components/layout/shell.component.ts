import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatProgressBarModule, HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header />
    @if (loading.active()) {
      <mat-progress-bar mode="indeterminate" class="top-loader" />
    }
    <main class="app-main">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: [
    `
      :host { display: flex; flex-direction: column; min-height: 100vh; }
      .app-main { flex: 1; display: block; }
      .top-loader { position: sticky; top: 56px; z-index: 9; }
    `,
  ],
})
export class ShellComponent {
  protected readonly loading = inject(LoadingService);
}
