import { Routes } from '@angular/router';
import { ShellComponent } from './shared/components/layout/shell.component';
import { roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: ShellComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                loadComponent: () =>
                    import('./features/client/home/home-page.component').then((m) => m.HomePageComponent),
                title: 'La Red · Reserva canchas en 1 minuto',
            },
            {
                path: 'canchas',
                loadComponent: () =>
                    import('./features/client/search/courts-search-page.component').then(
                        (m) => m.CourtsSearchPageComponent,
                    ),
                title: 'Buscar canchas · La Red',
            },
            {
                path: 'canchas/:id',
                loadComponent: () =>
                    import('./features/client/detail/court-detail-page.component').then(
                        (m) => m.CourtDetailPageComponent,
                    ),
            },
            {
                path: 'reservar/:courtId',
                loadComponent: () =>
                    import('./features/client/booking/booking-page.component').then((m) => m.BookingPageComponent),
                title: 'Reservar · La Red',
            },
            {
                path: 'pago/:bookingId',
                loadComponent: () =>
                    import('./features/client/payment/payment-page.component').then((m) => m.PaymentPageComponent),
                title: 'Pago · La Red',
            },
            {
                path: 'confirmacion/:bookingId',
                loadComponent: () =>
                    import('./features/client/confirmation/confirmation-page.component').then(
                        (m) => m.ConfirmationPageComponent,
                    ),
                title: 'Reserva confirmada · La Red',
            },
            {
                path: 'mis-reservas',
                loadComponent: () =>
                    import('./features/client/my-bookings/my-bookings-page.component').then(
                        (m) => m.MyBookingsPageComponent,
                    ),
                title: 'Mis reservas · La Red',
            },
            {
                path: 'auth/login',
                loadComponent: () =>
                    import('./features/auth/login/login-page.component').then((m) => m.LoginPageComponent),
                title: 'Ingresar · La Red',
            },
            {
                path: 'admin',
                canMatch: [roleGuard('court_admin', 'platform_admin')],
                loadChildren: () =>
                    import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
                title: 'Panel · La Red',
            },
        ],
    },
    { path: '**', redirectTo: '' },
];
