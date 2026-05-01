import { TestBed } from '@angular/core/testing';
import { InMemoryCourtRepository } from './in-memory-court.repository';

describe('InMemoryCourtRepository — applyFilters()', () => {
    let repo: InMemoryCourtRepository;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        repo = TestBed.inject(InMemoryCourtRepository);
    });

    it('filtra por tipo de cancha', (done) => {
        repo.findAll({ type: '5' }).subscribe((list) => {
            expect(list.every((c) => c.type === '5')).toBe(true);
            done();
        });
    });

    it('filtra por precio máximo', (done) => {
        repo.findAll({ maxPrice: 80_000 }).subscribe((list) => {
            expect(list.every((c) => c.pricePerHour <= 80_000)).toBe(true);
            done();
        });
    });

    it('filtra por rating mínimo', (done) => {
        repo.findAll({ minRating: 4.5 }).subscribe((list) => {
            expect(list.every((c) => c.averageRating >= 4.5)).toBe(true);
            done();
        });
    });

    it('filtra por ciudad (case-insensitive)', (done) => {
        repo.findAll({ city: 'cartagena' }).subscribe((list) => {
            list.forEach((c) =>
                expect(c.location.city.toLowerCase()).toContain('cartagena'),
            );
            done();
        });
    });

    it('filtra withPromotion (solo canchas con promoción)', (done) => {
        repo.findAll({ withPromotion: true }).subscribe((list) => {
            list.forEach((c) => expect(c.activePromotionId).toBeTruthy());
            done();
        });
    });

    it('sin filtros devuelve todas las canchas', (done) => {
        repo.findAll().subscribe((all) => {
            repo.findAll({}).subscribe((filtered) => {
                expect(filtered.length).toBe(all.length);
                done();
            });
        });
    });
});
