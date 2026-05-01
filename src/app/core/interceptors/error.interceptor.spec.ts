import { TestBed } from '@angular/core/testing';
import {
    HttpClient,
    HttpErrorResponse,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
    let http: HttpClient;
    let controller: HttpTestingController;
    let snackMock: { open: jest.Mock };

    beforeEach(() => {
        snackMock = { open: jest.fn() };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([errorInterceptor])),
                provideHttpClientTesting(),
                { provide: MatSnackBar, useValue: snackMock },
            ],
        });
        http = TestBed.inject(HttpClient);
        controller = TestBed.inject(HttpTestingController);
    });

    afterEach(() => controller.verify());

    it('no abre snackbar en respuesta exitosa', () => {
        http.get('/api/ok').subscribe();
        controller.expectOne('/api/ok').flush({ ok: true });
        expect(snackMock.open).not.toHaveBeenCalled();
    });

    it('abre snackbar con el mensaje del servidor en error 400', () => {
        http.get('/api/bad').subscribe({ error: () => { } });
        controller.expectOne('/api/bad').flush(
            { message: 'Datos inválidos' },
            { status: 400, statusText: 'Bad Request' },
        );
        expect(snackMock.open).toHaveBeenCalledWith(
            'Datos inválidos',
            'Cerrar',
            expect.objectContaining({ duration: 4000 }),
        );
    });

    it('abre snackbar con mensaje genérico cuando no hay body.message', () => {
        http.get('/api/fail').subscribe({ error: () => { } });
        controller
            .expectOne('/api/fail')
            .flush('Internal error', { status: 500, statusText: 'Server Error' });
        expect(snackMock.open).toHaveBeenCalled();
        const msg: string = snackMock.open.mock.calls[0][0];
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
    });

    it('relanza el error para que el suscriptor lo maneje', (done) => {
        http.get('/api/err').subscribe({
            error: (err: HttpErrorResponse) => {
                expect(err.status).toBe(404);
                done();
            },
        });
        controller
            .expectOne('/api/err')
            .flush({}, { status: 404, statusText: 'Not Found' });
    });
});
