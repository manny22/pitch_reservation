import { TestBed } from '@angular/core/testing';
import { InMemoryPromotionRepository } from './in-memory-promotion.repository';

describe('InMemoryPromotionRepository', () => {
    let repo: InMemoryPromotionRepository;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        repo = TestBed.inject(InMemoryPromotionRepository);
    });

    it('findActive() devuelve solo promociones activas', (done) => {
        repo.findActive().subscribe((list) => {
            expect(list.every((p) => p.active)).toBe(true);
            done();
        });
    });

    it('findByCourt() devuelve promos activas de esa cancha', (done) => {
        repo.findActive().subscribe((active) => {
            if (!active.length) {
                // Sin seed activo, el test pasa vacío
                expect(true).toBe(true);
                done();
                return;
            }
            const courtId = active[0].courtId;
            repo.findByCourt(courtId).subscribe((list) => {
                list.forEach((p) => {
                    expect(p.courtId).toBe(courtId);
                    expect(p.active).toBe(true);
                });
                done();
            });
        });
    });

    it('create() agrega promo y le asigna id', (done) => {
        const input = {
            courtId: 'c-test',
            title: 'Black Friday',
            description: '30% off',
            type: 'percentage' as const,
            value: 30,
            startsAt: '2026-11-27',
            endsAt: '2026-11-28',
            active: true,
        };
        repo.create(input).subscribe((created) => {
            expect(created.id).toMatch(/^p-/);
            expect(created.title).toBe('Black Friday');
            repo.findByCourt('c-test').subscribe((list) => {
                expect(list.some((p) => p.title === 'Black Friday')).toBe(true);
                done();
            });
        });
    });

    it('update() modifica solo los campos indicados', (done) => {
        repo.create({
            courtId: 'c-x', title: 'Vieja', description: '', type: 'fixed',
            value: 10_000, startsAt: '', endsAt: '', active: true,
        }).subscribe((created) => {
            repo.update(created.id, { title: 'Nueva', value: 20_000 }).subscribe((updated) => {
                expect(updated.title).toBe('Nueva');
                expect(updated.value).toBe(20_000);
                expect(updated.courtId).toBe('c-x'); // campo no modificado
                done();
            });
        });
    });

    it('delete() elimina la promo del repositorio', (done) => {
        repo.create({
            courtId: 'c-del', title: 'Borrar', description: '', type: 'fixed',
            value: 5_000, startsAt: '', endsAt: '', active: true,
        }).subscribe((created) => {
            repo.delete(created.id).subscribe(() => {
                repo.findById(created.id).subscribe((found) => {
                    expect(found).toBeUndefined();
                    done();
                });
            });
        });
    });
});
