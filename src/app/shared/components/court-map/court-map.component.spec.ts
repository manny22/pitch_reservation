import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CourtMapComponent } from './court-map.component';
import { Court } from '../../../domain/court/court.model';

const makeCourt = (overrides: Partial<Court> = {}): Court => ({
    id: 'c-1',
    name: 'Cancha 1',
    description: '',
    type: '5',
    pricePerHour: 80000,
    photos: [],
    location: { address: '', city: '', zone: 'Norte', latitude: 10.4, longitude: -75.5 },
    amenities: { parking: true, showers: true, bibs: true, lighting: true, cafeteria: false },
    averageRating: 4.5,
    reviewsCount: 0,
    available: true,
    cancellationPolicy: '',
    ownerId: 'o-1',
    ...overrides,
});

describe('CourtMapComponent', () => {
    let fixture: ComponentFixture<CourtMapComponent>;
    let component: CourtMapComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CourtMapComponent],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(CourtMapComponent);
        component = fixture.componentInstance;
    });

    it('se crea correctamente', () => {
        fixture.componentRef.setInput('courts', [makeCourt()]);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('respeta los inputs por defecto', () => {
        expect(component.height()).toBe('400px');
        expect(component.fitBounds()).toBe(true);
        expect(component.interactive()).toBe(true);
        expect(component.locateUser()).toBe(false);
    });

    it('emite geolocationError "unsupported" si navigator.geolocation no existe', () => {
        const original = (navigator as any).geolocation;
        Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });

        const errorSpy = jest.fn();
        component.geolocationError.subscribe(errorSpy);

        fixture.componentRef.setInput('locateUser', true);
        fixture.componentRef.setInput('courts', [makeCourt()]);
        fixture.detectChanges();

        expect(errorSpy).toHaveBeenCalledWith('unsupported');

        Object.defineProperty(navigator, 'geolocation', { value: original, configurable: true });
    });

    it('emite geolocationError "denied" cuando el permiso es rechazado', () => {
        const watchPosition = jest.fn((_ok, err) => {
            err({ code: 1, PERMISSION_DENIED: 1, TIMEOUT: 3, POSITION_UNAVAILABLE: 2 });
            return 1;
        });
        Object.defineProperty(navigator, 'geolocation', {
            value: { watchPosition, getCurrentPosition: jest.fn(), clearWatch: jest.fn() },
            configurable: true,
        });
        Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });

        const errorSpy = jest.fn();
        component.geolocationError.subscribe(errorSpy);

        fixture.componentRef.setInput('locateUser', true);
        fixture.componentRef.setInput('courts', [makeCourt()]);
        fixture.detectChanges();

        expect(errorSpy).toHaveBeenCalledWith('denied');
    });

    it('emite userLocated cuando se obtiene la posición', () => {
        const watchPosition = jest.fn((ok) => {
            ok({ coords: { latitude: 10.5, longitude: -75.5, accuracy: 50 } });
            return 1;
        });
        Object.defineProperty(navigator, 'geolocation', {
            value: { watchPosition, getCurrentPosition: jest.fn(), clearWatch: jest.fn() },
            configurable: true,
        });
        Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });

        const locatedSpy = jest.fn();
        component.userLocated.subscribe(locatedSpy);

        fixture.componentRef.setInput('locateUser', true);
        fixture.componentRef.setInput('courts', [makeCourt()]);
        fixture.detectChanges();

        expect(locatedSpy).toHaveBeenCalledWith(
            expect.objectContaining({ latitude: 10.5, longitude: -75.5 }),
        );
    });
});
