import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'conversations',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/conversations/conversations.component').then(m => m.ConversationsComponent)
    },
    { path: '**', redirectTo: 'login' }
];