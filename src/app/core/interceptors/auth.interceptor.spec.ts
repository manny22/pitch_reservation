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
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../auth/auth.service';
import { signal } from '@angular/core';
import { AuthSession } from '../../domain/user/user.model';

const makeSession = (token: string): AuthSession => ({
    user: {
        id: 'u-1',
        name: 'Test',
        phone: '300',
        role: 'player',
        createdAt: new Date().toISOString(),
    },
    token,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
});

describe('authInterceptor', () => {
    let http: HttpClient;
    let controller: HttpTestingController;
    let authMock: { session: ReturnType<typeof signal<AuthSession | null>> };

    beforeEach(() => {
        authMock = { session: signal<AuthSession | null>(null) };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authMock },
            ],
        });
        http = TestBed.inject(HttpClient);
        controller = TestBed.inject(HttpTestingController);
    });

    afterEach(() => controller.verify());

    it('no agrega Authorization cuando no hay sesión', () => {
        authMock.session.set(null);
        http.get('/api/test').subscribe();
        const req = controller.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('agrega Authorization Bearer cuando hay sesión', () => {
        authMock.session.set(makeSession('mi-token-123'));
        http.get('/api/test').subscribe();
        const req = controller.expectOne('/api/test');
        expect(req.request.headers.get('Authorization')).toBe('Bearer mi-token-123');
        req.flush({});
    });
});
