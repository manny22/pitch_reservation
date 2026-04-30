import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <mat-toolbar color="primary" class="app-header">
      <a routerLink="/" class="brand" aria-label="Ir al inicio">
        <mat-icon>sports_soccer</mat-icon>
        <span>La Red</span>
      </a>

      <nav class="links">
        <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
        <a mat-button routerLink="/canchas" routerLinkActive="active">Canchas</a>
        @if (isAdmin()) {
          <a mat-button routerLink="/admin" routerLinkActive="active">Panel</a>
        }
      </nav>

      <span class="spacer"></span>

      @if (auth.isAuthenticated()) {
        <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Menú de usuario">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <span mat-menu-item disabled>{{ auth.user()?.name }}</span>
          <a mat-menu-item routerLink="/mis-reservas">
            <mat-icon>event</mat-icon>
            <span>Mis reservas</span>
          </a>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Cerrar sesión</span>
          </button>
        </mat-menu>
      } @else {
        <a mat-stroked-button routerLink="/auth/login" class="login-btn">Iniciar sesión</a>
      }
    </mat-toolbar>
  `,
    styles: [
        `
      .app-header {
        position: sticky;
        top: 0;
        z-index: 10;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: inherit;
        text-decoration: none;
        font-weight: 700;
        font-size: 1.1rem;
      }
      .links { display: none; gap: 4px; margin-left: 24px; }
      .links .active { background: rgba(255, 255, 255, 0.15); }
      .spacer { flex: 1; }
      .login-btn { color: #fff; border-color: rgba(255, 255, 255, 0.6); }
      @media (min-width: 768px) {
        .links { display: inline-flex; }
      }
    `,
    ],
})
export class HeaderComponent {
    protected readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    protected readonly isAdmin = computed(() => this.auth.hasRole('court_admin', 'platform_admin'));

    logout(): void {
        this.auth.logout();
        this.router.navigateByUrl('/');
    }
}
