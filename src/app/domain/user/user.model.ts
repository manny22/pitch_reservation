export type UserRole = 'player' | 'court_admin' | 'platform_admin';

export interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: UserRole;
    createdAt: string;
}

export interface AuthSession {
    user: User;
    token: string;
    expiresAt: string;
}
