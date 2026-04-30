import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./shell/admin-shell.component').then((m) => m.AdminShellComponent),
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
            },
            {
                path: 'canchas',
                loadComponent: () =>
                    import('./courts/admin-courts.component').then((m) => m.AdminCourtsComponent),
            },
            {
                path: 'reservas',
                loadComponent: () =>
                    import('./bookings/admin-bookings.component').then((m) => m.AdminBookingsComponent),
            },
            {
                path: 'promociones',
                loadComponent: () =>
                    import('./promotions/admin-promotions.component').then((m) => m.AdminPromotionsComponent),
            },
        ],
    },
];
