import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="app-footer">
      <div class="container">
        <div class="brand">
          <strong>La Red</strong>
          <span>Reserva, paga y juega en minutos.</span>
        </div>
        <small>© {{ year }} La Red · Cartagena, Colombia</small>
      </div>
    </footer>
  `,
  styles: [
    `
      .app-footer {
        background: #0f1f2e;
        color: rgba(255, 255, 255, 0.85);
        padding: 24px 16px;
        margin-top: 48px;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .brand { display: flex; flex-direction: column; }
      .brand strong { font-size: 1.05rem; }
      .brand span { color: rgba(255, 255, 255, 0.65); font-size: 0.9rem; }
      small { color: rgba(255, 255, 255, 0.55); }
      @media (min-width: 768px) {
        .container { flex-direction: row; align-items: center; justify-content: space-between; }
      }
    `,
  ],
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
