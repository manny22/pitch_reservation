import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../domain/user/user.model';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatRadioModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="page">
      <mat-card appearance="outlined" class="card">
        <mat-card-content>
          <header>
            <mat-icon class="brand-icon">sports_soccer</mat-icon>
            <h1>Bienvenido a La Red</h1>
            <p>Ingresa con tu número de teléfono para reservar.</p>
          </header>

          @if (step() === 'phone') {
            <form [formGroup]="phoneForm" (ngSubmit)="requestCode()">
              <mat-form-field appearance="outline">
                <mat-label>Teléfono</mat-label>
                <span matTextPrefix>+57&nbsp;</span>
                <input matInput formControlName="phone" inputmode="numeric" maxlength="10" autocomplete="tel" />
                @if (phoneForm.controls.phone.hasError('pattern')) {
                  <mat-error>Ingresa un número de 10 dígitos.</mat-error>
                }
              </mat-form-field>

              <mat-radio-group formControlName="role" class="roles">
                <mat-radio-button value="player">Jugador</mat-radio-button>
                <mat-radio-button value="court_admin">Admin de cancha</mat-radio-button>
                <mat-radio-button value="platform_admin">Admin La Red</mat-radio-button>
              </mat-radio-group>

              <button mat-flat-button color="primary" type="submit" [disabled]="phoneForm.invalid">
                Recibir código
              </button>
            </form>
          } @else {
            <form [formGroup]="codeForm" (ngSubmit)="verify()">
              <p class="hint">Ingresa el código de 6 dígitos (demo: <strong>123456</strong>)</p>
              <mat-form-field appearance="outline">
                <mat-label>Código</mat-label>
                <input matInput formControlName="code" inputmode="numeric" maxlength="6" />
              </mat-form-field>
              <button mat-flat-button color="primary" type="submit" [disabled]="codeForm.invalid">
                Ingresar
              </button>
              <button mat-button type="button" (click)="step.set('phone')">Cambiar teléfono</button>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [
        `
      .page {
        min-height: calc(100vh - 64px);
        display: flex; align-items: center; justify-content: center;
        padding: 24px;
        background: linear-gradient(135deg, #f5f8fa 0%, #e0f2f1 100%);
      }
      .card { width: 100%; max-width: 420px; }
      header { text-align: center; margin-bottom: 16px; }
      .brand-icon { font-size: 48px; width: 48px; height: 48px; color: #1b5e20; }
      h1 { margin: 8px 0 4px; }
      header p { color: rgba(0, 0, 0, 0.65); margin: 0; }
      form { display: flex; flex-direction: column; gap: 12px; }
      .roles { display: flex; flex-direction: column; gap: 4px; }
      .hint { color: rgba(0,0,0,0.65); font-size: 0.9rem; }
    `,
    ],
})
export class LoginPageComponent {
    private readonly fb = inject(FormBuilder);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    protected readonly step = signal<'phone' | 'code'>('phone');

    protected readonly phoneForm = this.fb.nonNullable.group({
        phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        role: ['player' as UserRole, Validators.required],
    });

    protected readonly codeForm = this.fb.nonNullable.group({
        code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    requestCode(): void {
        if (this.phoneForm.invalid) return;
        this.step.set('code');
    }

    verify(): void {
        if (this.codeForm.invalid) return;
        const { phone, role } = this.phoneForm.getRawValue();
        this.auth.loginWithPhone(phone, role).subscribe(() => {
            const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/';
            this.router.navigateByUrl(redirect);
        });
    }
}
