import { TestBed } from '@angular/core/testing';
import {
    HttpClient,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('loadingInterceptor', () => {
    let http: HttpClient;
    let controller: HttpTestingController;
    let loadingService: LoadingService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([loadingInterceptor])),
                provideHttpClientTesting(),
            ],
        });
        http = TestBed.inject(HttpClient);
        controller = TestBed.inject(HttpTestingController);
        loadingService = TestBed.inject(LoadingService);
    });

    afterEach(() => controller.verify());

    it('activa loading al iniciar la petición', () => {
        http.get('/api/test').subscribe();
        const req = controller.expectOne('/api/test');
        expect(loadingService.active()).toBe(true);
        req.flush({});
    });

    it('desactiva loading al completar la petición', () => {
        http.get('/api/test').subscribe();
        const req = controller.expectOne('/api/test');
        req.flush({});
        expect(loadingService.active()).toBe(false);
    });

    it('desactiva loading aunque la petición falle', () => {
        http.get('/api/test').subscribe({ error: () => { } });
        const req = controller.expectOne('/api/test');
        req.error(new ProgressEvent('network error'));
        expect(loadingService.active()).toBe(false);
    });
});
