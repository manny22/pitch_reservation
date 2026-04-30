import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const session = auth.session();
    if (!session) return next(req);
    const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${session.token}` },
    });
    return next(cloned);
};
