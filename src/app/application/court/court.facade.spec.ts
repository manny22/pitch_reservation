import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CourtFacade } from './court.facade';
import { CourtRepository } from '../../domain/court/court.repository';
import { Court } from '../../domain/court/court.model';

const fakeCourt: Court = {
    id: 'c-1',
    name: 'Cancha Test',
    description: '',
    type: '5',
    pricePerHour: 80000,
    photos: [],
    location: { address: '', city: '', zone: '', latitude: 0, longitude: 0 },
    amenities: { parking: true, showers: true, bibs: true, lighting: true, cafeteria: false },
    averageRating: 4.7,
    reviewsCount: 10,
    available: true,
    cancellationPolicy: '',
    ownerId: 'o-1',
};

describe('CourtFacade', () => {
    let facade: CourtFacade;
    let repoMock: {
        findAll: jest.Mock;
        findById: jest.Mock;
        findFeatured: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
        delete: jest.Mock;
        availableSlots: jest.Mock;
    };

    beforeEach(() => {
        repoMock = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findFeatured: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            availableSlots: jest.fn(),
        };
        TestBed.configureTestingModule({
            providers: [{ provide: CourtRepository, useValue: repoMock }],
        });
        facade = TestBed.inject(CourtFacade);
    });

    it('search() actualiza señales courts y loading', (done) => {
        repoMock.findAll.mockReturnValue(of([fakeCourt]));
        expect(facade.loading()).toBe(false);

        facade.search().subscribe((list) => {
            expect(list).toEqual([fakeCourt]);
            expect(facade.courts()).toEqual([fakeCourt]);
            expect(facade.loading()).toBe(false);
            expect(facade.error()).toBeNull();
            done();
        });
    });

    it('search() captura errores en signal error', (done) => {
        repoMock.findAll.mockReturnValue(throwError(() => new Error('boom')));

        facade.search().subscribe({
            error: () => {
                expect(facade.error()).toBe('boom');
                expect(facade.loading()).toBe(false);
                done();
            },
        });
    });

    it('loadFeatured() popula la señal featured', (done) => {
        repoMock.findFeatured.mockReturnValue(of([fakeCourt]));

        facade.loadFeatured().subscribe(() => {
            expect(facade.featured()).toEqual([fakeCourt]);
            done();
        });
    });

    it('getById() delega al repositorio', (done) => {
        repoMock.findById.mockReturnValue(of(fakeCourt));

        facade.getById('c-1').subscribe((court) => {
            expect(court).toBe(fakeCourt);
            expect(repoMock.findById).toHaveBeenCalledWith('c-1');
            done();
        });
    });
});
