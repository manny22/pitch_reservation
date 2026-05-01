import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';
import { CourtCardComponent } from './court-card.component';
import { Court } from '../../../domain/court/court.model';
import { By } from '@angular/platform-browser';

const makeCourt = (overrides: Partial<Court> = {}): Court => ({
    id: 'c-1',
    name: 'Cancha Bocagrande',
    description: '',
    type: '5',
    pricePerHour: 80_000,
    photos: ['https://example.com/photo.jpg'],
    location: { address: '', city: 'Cartagena', zone: 'Bocagrande', latitude: 10.4, longitude: -75.5 },
    amenities: { parking: true, showers: true, bibs: true, lighting: true, cafeteria: false },
    averageRating: 4.3,
    reviewsCount: 12,
    available: true,
    cancellationPolicy: '',
    ownerId: 'o-1',
    ...overrides,
});

describe('CourtCardComponent', () => {
    let fixture: ComponentFixture<CourtCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CourtCardComponent, RatingStarsComponent],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(CourtCardComponent);
    });

    it('se crea correctamente', () => {
        fixture.componentRef.setInput('court', makeCourt());
        fixture.detectChanges();
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('muestra el nombre de la cancha', () => {
        fixture.componentRef.setInput('court', makeCourt({ name: 'Cancha Norte' }));
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Cancha Norte');
    });

    it('muestra la zona y ciudad', () => {
        fixture.componentRef.setInput('court', makeCourt());
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Bocagrande');
        expect(fixture.nativeElement.textContent).toContain('Cartagena');
    });

    it('muestra badge "Disponible" cuando available=true', () => {
        fixture.componentRef.setInput('court', makeCourt({ available: true }));
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Disponible');
    });

    it('muestra badge "Ocupada" cuando available=false', () => {
        fixture.componentRef.setInput('court', makeCourt({ available: false }));
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Ocupada');
    });

    it('muestra badge "Promo" cuando hay activePromotionId', () => {
        fixture.componentRef.setInput('court', makeCourt({ activePromotionId: 'p-1' }));
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Promo');
    });

    it('no muestra badge "Promo" sin activePromotionId', () => {
        fixture.componentRef.setInput('court', makeCourt({ activePromotionId: undefined }));
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).not.toContain('Promo');
    });

    it('el enlace "Ver detalles" apunta a /canchas/:id', () => {
        fixture.componentRef.setInput('court', makeCourt({ id: 'c-42' }));
        fixture.detectChanges();
        const link = fixture.debugElement.query(By.css('a[mat-flat-button]'));
        expect(link.nativeElement.getAttribute('href')).toContain('/canchas/c-42');
    });
});
