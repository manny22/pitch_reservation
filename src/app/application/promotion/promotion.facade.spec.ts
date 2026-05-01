import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PromotionFacade } from './promotion.facade';
import { PromotionRepository } from '../../domain/promotion/promotion.model';
import { Promotion } from '../../domain/promotion/promotion.model';

const makePromo = (overrides: Partial<Promotion> = {}): Promotion => ({
    id: 'p-1',
    courtId: 'c-1',
    title: '20% off',
    description: '',
    type: 'percentage',
    value: 20,
    startsAt: '2026-05-01',
    endsAt: '2026-05-31',
    active: true,
    ...overrides,
});

describe('PromotionFacade', () => {
    let facade: PromotionFacade;
    let repoMock: { [k: string]: jest.Mock };

    beforeEach(() => {
        repoMock = {
            findActive: jest.fn(),
            findByCourt: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        TestBed.configureTestingModule({
            providers: [{ provide: PromotionRepository, useValue: repoMock }],
        });
        facade = TestBed.inject(PromotionFacade);
    });

    it('active() delega a findActive()', (done) => {
        repoMock['findActive'].mockReturnValue(of([makePromo()]));
        facade.active().subscribe((list) => {
            expect(list).toHaveLength(1);
            expect(repoMock['findActive']).toHaveBeenCalled();
            done();
        });
    });

    it('byCourt() delega a findByCourt()', (done) => {
        repoMock['findByCourt'].mockReturnValue(of([makePromo()]));
        facade.byCourt('c-1').subscribe(() => {
            expect(repoMock['findByCourt']).toHaveBeenCalledWith('c-1');
            done();
        });
    });

    it('byId() devuelve undefined para id inexistente', (done) => {
        repoMock['findById'].mockReturnValue(of(undefined));
        facade.byId('nope').subscribe((p) => {
            expect(p).toBeUndefined();
            done();
        });
    });

    it('create() pasa los datos al repositorio', (done) => {
        const promo = makePromo();
        repoMock['create'].mockReturnValue(of(promo));
        const { id, ...input } = promo;
        facade.create(input).subscribe((created) => {
            expect(created.id).toBe('p-1');
            done();
        });
    });

    it('delete() llama a repository.delete con el id correcto', (done) => {
        repoMock['delete'].mockReturnValue(of(undefined));
        facade.delete('p-1').subscribe(() => {
            expect(repoMock['delete']).toHaveBeenCalledWith('p-1');
            done();
        });
    });
});
