import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
    let service: LoadingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LoadingService);
    });

    it('inicia inactivo', () => {
        expect(service.active()).toBe(false);
    });

    it('show() activa el loading', () => {
        service.show();
        expect(service.active()).toBe(true);
    });

    it('hide() después de show() lo desactiva', () => {
        service.show();
        service.hide();
        expect(service.active()).toBe(false);
    });

    it('necesita tantos hide() como show() para desactivarse (contador)', () => {
        service.show();
        service.show();
        service.hide();
        expect(service.active()).toBe(true);
        service.hide();
        expect(service.active()).toBe(false);
    });

    it('hide() sin show() previo no baja de 0', () => {
        service.hide();
        expect(service.active()).toBe(false);
    });
});
