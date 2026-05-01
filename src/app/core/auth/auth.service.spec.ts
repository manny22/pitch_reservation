import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthService);
    });

    it('inicia sin sesión', () => {
        expect(service.isAuthenticated()).toBe(false);
        expect(service.user()).toBeNull();
        expect(service.role()).toBeNull();
    });

    it('inicia sesión por teléfono y persiste en localStorage', (done) => {
        service.loginWithPhone('3001234567', 'player').subscribe((session) => {
            expect(session.token).toMatch(/^token-/);
            expect(session.user.phone).toBe('3001234567');
            expect(session.user.role).toBe('player');
            expect(service.isAuthenticated()).toBe(true);
            expect(service.role()).toBe('player');
            expect(localStorage.getItem('la-red.session')).not.toBeNull();
            done();
        });
    });

    it('logout limpia sesión y localStorage', (done) => {
        service.loginWithPhone('3001234567').subscribe(() => {
            service.logout();
            expect(service.isAuthenticated()).toBe(false);
            expect(localStorage.getItem('la-red.session')).toBeNull();
            done();
        });
    });

    it('hasRole valida correctamente', (done) => {
        service.loginWithPhone('3009999999', 'court_admin').subscribe(() => {
            expect(service.hasRole('court_admin')).toBe(true);
            expect(service.hasRole('platform_admin')).toBe(false);
            expect(service.hasRole('court_admin', 'platform_admin')).toBe(true);
            done();
        });
    });

    it('restaura sesión desde localStorage al instanciar', () => {
        const session = {
            user: {
                id: 'u-1',
                name: 'Test',
                phone: '300',
                role: 'platform_admin',
                createdAt: new Date().toISOString(),
            },
            token: 'tok',
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
        };
        localStorage.setItem('la-red.session', JSON.stringify(session));

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({});
        const restored = TestBed.inject(AuthService);

        expect(restored.isAuthenticated()).toBe(true);
        expect(restored.role()).toBe('platform_admin');
    });

    it('descarta sesión expirada', () => {
        const expired = {
            user: { id: 'u', name: 'x', phone: '', role: 'player', createdAt: '' },
            token: 't',
            expiresAt: new Date(Date.now() - 1000).toISOString(),
        };
        localStorage.setItem('la-red.session', JSON.stringify(expired));

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({});
        const restored = TestBed.inject(AuthService);

        expect(restored.isAuthenticated()).toBe(false);
    });

    it('currentUser devuelve invitado cuando no hay sesión', () => {
        const user = service.currentUser();
        expect(user.id).toBe('u-guest');
        expect(user.role).toBe('player');
    });
});
