import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CourtMapComponent } from '../../../shared/components/court-map/court-map.component';
import { CourtFacade } from '../../../application/court/court.facade';
import { ReviewFacade } from '../../../application/review/review.facade';
import { PromotionFacade } from '../../../application/promotion/promotion.facade';
import { AuthService } from '../../../core/auth/auth.service';
import { Court } from '../../../domain/court/court.model';
import { Review } from '../../../domain/review/review.model';
import { Promotion } from '../../../domain/promotion/promotion.model';
import { switchMap } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-court-detail-page',
    standalone: true,
    imports: [
        RouterLink,
        ReactiveFormsModule,
        DatePipe,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatCardModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        CurrencyCopPipe,
        RatingStarsComponent,
        LoadingComponent,
        EmptyStateComponent,
        CourtMapComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './court-detail-page.component.html',
    styleUrl: './court-detail-page.component.scss',
})
export class CourtDetailPageComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
    private readonly courtFacade = inject(CourtFacade);
    private readonly reviewFacade = inject(ReviewFacade);
    private readonly promotionFacade = inject(PromotionFacade);
    private readonly auth = inject(AuthService);
    private readonly snack = inject(MatSnackBar);

    protected readonly court = signal<Court | null>(null);
    protected readonly loading = signal(true);
    protected readonly notFound = signal(false);
    protected readonly reviews = signal<Review[]>([]);
    protected readonly promotion = signal<Promotion | null>(null);
    protected readonly slots = signal<string[]>([]);
    protected readonly selectedPhoto = signal<string>('');

    protected readonly amenitiesList = computed(() => {
        const a = this.court()?.amenities;
        if (!a) return [];
        const map: Record<string, string> = {
            parking: 'Parqueadero',
            showers: 'Vestuarios',
            bibs: 'Petos',
            lighting: 'Iluminación',
            cafeteria: 'Cafetería',
        };
        return Object.entries(a)
            .filter(([, v]) => v)
            .map(([k]) => map[k]);
    });

    protected readonly reviewForm = this.fb.nonNullable.group({
        rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
        comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });

    constructor() {
        const id = this.route.snapshot.paramMap.get('id') ?? '';
        this.courtFacade.getById(id).subscribe((court) => {
            this.loading.set(false);
            if (!court) {
                this.notFound.set(true);
                return;
            }
            this.court.set(court);
            this.selectedPhoto.set(court.photos[0] ?? '');
            this.courtFacade
                .availableSlots(court.id, new Date().toISOString().slice(0, 10))
                .subscribe((s) => this.slots.set(s));
            this.reviewFacade.byCourt(court.id).subscribe((r) => this.reviews.set(r));
            if (court.activePromotionId) {
                this.promotionFacade.byId(court.activePromotionId).subscribe((p) => this.promotion.set(p ?? null));
            }
        });
    }

    selectPhoto(url: string): void {
        this.selectedPhoto.set(url);
    }

    reserve(): void {
        const c = this.court();
        if (!c) return;
        if (!this.auth.isAuthenticated()) {
            this.router.navigate(['/auth/login'], { queryParams: { redirect: `/reservar/${c.id}` } });
            return;
        }
        this.router.navigate(['/reservar', c.id]);
    }

    submitReview(): void {
        if (this.reviewForm.invalid) return;
        const c = this.court();
        if (!c) return;
        if (!this.auth.isAuthenticated()) {
            this.router.navigate(['/auth/login'], { queryParams: { redirect: `/canchas/${c.id}` } });
            return;
        }
        const user = this.auth.currentUser();
        const value = this.reviewForm.getRawValue();
        this.reviewFacade
            .create({
                courtId: c.id,
                userId: user.id,
                userName: user.name,
                rating: value.rating,
                comment: value.comment,
            })
            .pipe(switchMap(() => this.reviewFacade.byCourt(c.id)))
            .subscribe((all) => {
                this.reviews.set(all);
                this.reviewForm.reset({ rating: 5, comment: '' });
                this.snack.open('¡Gracias por tu calificación!', 'Cerrar', { duration: 3000 });
            });
    }
}
