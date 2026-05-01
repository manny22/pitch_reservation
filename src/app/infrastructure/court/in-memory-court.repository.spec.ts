import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { InMemoryCourtRepository } from './in-memory-court.repository';

describe('InMemoryCourtRepository', () => {
    let repo: InMemoryCourtRepository;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        repo = TestBed.inject(InMemoryCourtRepository);
    });

    it('findAll() devuelve la lista de canchas', (done) => {
        repo.findAll().subscribe((courts) => {
            expect(courts.length).toBeGreaterThan(0);
            expect(courts[0]).toHaveProperty('id');
            expect(courts[0]).toHaveProperty('location');
            done();
        });
    });

    it('findFeatured() solo devuelve canchas con rating >= 4.5', (done) => {
        repo.findFeatured().subscribe((featured) => {
            expect(featured.length).toBeLessThanOrEqual(4);
            featured.forEach((c) => expect(c.averageRating).toBeGreaterThanOrEqual(4.5));
            done();
        });
    });

    it('findById() encuentra una cancha existente', (done) => {
        repo.findAll().pipe(take(1)).subscribe((courts) => {
            const target = courts[0];
            repo.findById(target.id).subscribe((found) => {
                expect(found).toEqual(target);
                done();
            });
        });
    });

    it('findById() devuelve undefined para id inexistente', (done) => {
        repo.findById('nope-xyz').subscribe((found) => {
            expect(found).toBeUndefined();
            done();
        });
    });

    it('create() agrega una nueva cancha con id generado', (done) => {
        repo.findAll().pipe(take(1)).subscribe((before) => {
            const initial = before.length;
            const newCourt = { ...before[0] } as any;
            delete newCourt.id;
            newCourt.name = 'Cancha Nueva Test';

            repo.create(newCourt).subscribe((created) => {
                expect(created.id).toMatch(/^c-/);
                expect(created.name).toBe('Cancha Nueva Test');
                repo.findAll().subscribe((after) => {
                    expect(after.length).toBe(initial + 1);
                    done();
                });
            });
        });
    });

    it('availableSlots() devuelve horarios disponibles', (done) => {
        repo.availableSlots('c-1', '2026-05-01').subscribe((slots) => {
            expect(slots).toContain('08:00');
            expect(slots.length).toBeGreaterThan(0);
            done();
        });
    });
});
