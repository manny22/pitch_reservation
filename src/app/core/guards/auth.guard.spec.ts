import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard, roleGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';

describe('auth guards', () => {
    let routerMock: { createUrlTree: jest.Mock };
    let authMock: Partial<AuthService> & {
        isAuthenticated: jest.Mock;
        hasRole: jest.Mock;
    };

    beforeEach(() => {
        routerMock = { createUrlTree: jest.fn(() => ({}) as UrlTree) };
        authMock = {
            isAuthenticated: jest.fn(),
            hasRole: jest.fn(),
        };
        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: routerMock },
                { provide: AuthService, useValue: authMock },
            ],
        });
    });

    describe('authGuard', () => {
        it('permite si está autenticado', () => {
            authMock.isAuthenticated.mockReturnValue(true);
            const result = TestBed.runInInjectionContext(() =>
                authGuard({} as never, [] as never),
            );
            expect(result).toBe(true);
        });

        it('redirige a /auth/login si no autenticado', () => {
            authMock.isAuthenticated.mockReturnValue(false);
            TestBed.runInInjectionContext(() => authGuard({} as never, [] as never));
            expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
        });
    });

    describe('roleGuard', () => {
        it('redirige a /auth/login si no autenticado', () => {
            authMock.isAuthenticated.mockReturnValue(false);
            const guard = roleGuard('court_admin');
            TestBed.runInInjectionContext(() => guard({} as never, [] as never));
            expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
        });

        it('permite si el rol coincide', () => {
            authMock.isAuthenticated.mockReturnValue(true);
            authMock.hasRole.mockReturnValue(true);
            const guard = roleGuard('court_admin', 'platform_admin');
            const result = TestBed.runInInjectionContext(() =>
                guard({} as never, [] as never),
            );
            expect(result).toBe(true);
            expect(authMock.hasRole).toHaveBeenCalledWith('court_admin', 'platform_admin');
        });

        it('redirige a / si rol no coincide', () => {
            authMock.isAuthenticated.mockReturnValue(true);
            authMock.hasRole.mockReturnValue(false);
            const guard = roleGuard('platform_admin');
            TestBed.runInInjectionContext(() => guard({} as never, [] as never));
            expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
        });
    });
});
