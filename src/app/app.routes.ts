import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { unauthorizedGuard } from './core/auth/guards/unauthorized.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: '',
        canActivate: [unauthorizedGuard],
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'conversations',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/conversations/components/conversations/conversations.component').then(
                        m => m.ConversationsComponent
                    )
            },
            {
                path: ':id',
                loadComponent: () =>
                    import('./features/conversations/components/conversation-detail/conversation-detail.component').then(
                        m => m.ConversationDetailComponent
                    )
            }
        ]
    },
    { path: '**', redirectTo: 'login' }
];