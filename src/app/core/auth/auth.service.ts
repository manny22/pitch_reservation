import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthSession, User, UserRole } from '../../domain/user/user.model';

const STORAGE_KEY = 'la-red.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly _session = signal<AuthSession | null>(this.restore());

    readonly session = this._session.asReadonly();
    readonly user = computed(() => this._session()?.user ?? null);
    readonly isAuthenticated = computed(() => this._session() !== null);
    readonly role = computed<UserRole | null>(() => this._session()?.user.role ?? null);

    loginWithPhone(phone: string, role: UserRole = 'player'): Observable<AuthSession> {
        const session: AuthSession = {
            user: {
                id: `u-${phone}`,
                name: role === 'player' ? 'Jugador Demo' : role === 'court_admin' ? 'Admin Cancha' : 'Admin La Red',
                phone,
                role,
                createdAt: new Date().toISOString(),
            },
            token: `token-${Date.now()}`,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        };
        return of(session).pipe(
            delay(300),
            tap((s) => {
                this._session.set(s);
                this.persist(s);
            }),
        );
    }

    logout(): void {
        this._session.set(null);
        if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    }

    hasRole(...roles: UserRole[]): boolean {
        const role = this.role();
        return role !== null && roles.includes(role);
    }

    currentUser(): User {
        return (
            this._session()?.user ?? {
                id: 'u-guest',
                name: 'Invitado',
                phone: '',
                role: 'player',
                createdAt: new Date().toISOString(),
            }
        );
    }

    private restore(): AuthSession | null {
        if (typeof localStorage === 'undefined') return null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as AuthSession;
            if (new Date(parsed.expiresAt).getTime() < Date.now()) return null;
            return parsed;
        } catch {
            return null;
        }
    }

    private persist(session: AuthSession): void {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
}
