import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-admin-shell',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        RouterOutlet,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <mat-sidenav-container class="admin">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="brand">
          <mat-icon>admin_panel_settings</mat-icon>
          <strong>Panel Admin</strong>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Inicio</span>
          </a>
          <a mat-list-item routerLink="/admin/canchas" routerLinkActive="active">
            <mat-icon matListItemIcon>stadium</mat-icon>
            <span matListItemTitle>Canchas</span>
          </a>
          <a mat-list-item routerLink="/admin/reservas" routerLinkActive="active">
            <mat-icon matListItemIcon>event</mat-icon>
            <span matListItemTitle>Reservas</span>
          </a>
          <a mat-list-item routerLink="/admin/promociones" routerLinkActive="active">
            <mat-icon matListItemIcon>local_offer</mat-icon>
            <span matListItemTitle>Promociones</span>
          </a>
        </mat-nav-list>
        <div class="user">
          <small>{{ auth.user()?.name }}</small>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
    styles: [
        `
      .admin { min-height: calc(100vh - 64px); background: #f5f8fa; }
      .sidenav { width: 240px; background: #0f1f2e; color: #fff; }
      .sidenav .brand { padding: 16px; display: flex; align-items: center; gap: 8px; }
      .sidenav mat-icon { color: #ffd54f; }
      .sidenav a { color: rgba(255, 255, 255, 0.85) !important; }
      .sidenav a.active { background: rgba(255, 255, 255, 0.1); }
      .sidenav .user { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
      .content { padding: 24px; }
      @media (max-width: 768px) {
        .sidenav { width: 200px; }
        .content { padding: 16px; }
      }
    `,
    ],
})
export class AdminShellComponent {
    protected readonly auth = inject(AuthService);
}
