import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'conversation',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/conversations/components/conversations.component').then(
                        m => m.ConversationsComponent
                    )
            },
            {
                path: ':id',
                loadComponent: () =>
                    import('./features/conversations/components/conversation-detail.component').then(
                        m => m.ConversationDetailComponent
                    )
            }
        ]
    },
    { path: 'conversations', redirectTo: 'conversation', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];