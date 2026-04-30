import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { CourtCardComponent } from '../../../shared/components/court-card/court-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { CourtFacade } from '../../../application/court/court.facade';
import { PromotionFacade } from '../../../application/promotion/promotion.facade';
import { Court } from '../../../domain/court/court.model';
import { Promotion } from '../../../domain/promotion/promotion.model';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';

@Component({
    selector: 'app-home-page',
    standalone: true,
    imports: [
        RouterLink,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        CourtCardComponent,
        LoadingComponent,
        CurrencyCopPipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
    private readonly fb = inject(FormBuilder);
    private readonly courtFacade = inject(CourtFacade);
    private readonly promotionFacade = inject(PromotionFacade);
    private readonly router = inject(Router);

    protected readonly searchForm = this.fb.nonNullable.group({ city: '' });
    protected readonly featured = signal<Court[]>([]);
    protected readonly promotions = signal<Promotion[]>([]);
    protected readonly loading = signal(true);

    constructor() {
        this.courtFacade.loadFeatured().subscribe({
            next: (c) => {
                this.featured.set(c);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
        this.promotionFacade.active().subscribe((p) => this.promotions.set(p));
    }

    search(): void {
        const city = this.searchForm.controls.city.value.trim();
        this.router.navigate(['/canchas'], { queryParams: city ? { city } : undefined });
    }
}
