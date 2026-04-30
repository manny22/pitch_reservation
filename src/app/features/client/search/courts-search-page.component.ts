import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { CourtCardComponent } from '../../../shared/components/court-card/court-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CourtFacade } from '../../../application/court/court.facade';
import { Court } from '../../../domain/court/court.model';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-courts-search-page',
    standalone: true,
    imports: [
        DecimalPipe,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        CourtCardComponent,
        LoadingComponent,
        EmptyStateComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './courts-search-page.component.html',
    styleUrl: './courts-search-page.component.scss',
})
export class CourtsSearchPageComponent {
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly facade = inject(CourtFacade);

    protected readonly form = this.fb.nonNullable.group({
        city: this.route.snapshot.queryParamMap.get('city') ?? '',
        type: this.route.snapshot.queryParamMap.get('type') ?? '',
        maxPrice: 250000,
        minRating: 0,
        withPromotion: this.route.snapshot.queryParamMap.get('promo') === '1',
    });

    protected readonly courts = signal<Court[]>([]);
    protected readonly loading = signal(true);
    protected readonly error = signal<string | null>(null);

    constructor() {
        this.form.valueChanges
            .pipe(
                startWith(this.form.getRawValue()),
                debounceTime(250),
                switchMap(() => {
                    this.loading.set(true);
                    this.error.set(null);
                    const v = this.form.getRawValue();
                    return this.facade.search({
                        city: v.city || undefined,
                        type: v.type || undefined,
                        maxPrice: v.maxPrice,
                        minRating: v.minRating || undefined,
                        withPromotion: v.withPromotion || undefined,
                    });
                }),
            )
            .subscribe({
                next: (list) => {
                    this.courts.set(list);
                    this.loading.set(false);
                },
                error: (err: Error) => {
                    this.error.set(err.message);
                    this.loading.set(false);
                },
            });
    }

    reset(): void {
        this.form.reset({ city: '', type: '', maxPrice: 250000, minRating: 0, withPromotion: false });
    }
}
