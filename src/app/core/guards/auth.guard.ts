import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../../domain/user/user.model';

export const authGuard: CanMatchFn = (): boolean | UrlTree => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};

export const roleGuard = (...roles: UserRole[]): CanMatchFn => {
    return (): boolean | UrlTree => {
        const auth = inject(AuthService);
        const router = inject(Router);
        if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
        return auth.hasRole(...roles) ? true : router.createUrlTree(['/']);
    };
};
