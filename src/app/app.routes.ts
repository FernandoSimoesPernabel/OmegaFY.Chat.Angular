import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { unauthorizedGuard } from './core/auth/guards/unauthorized.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: '',
        canActivate: [unauthorizedGuard],
        component: AuthLayoutComponent,
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'conversations',
        canActivate: [authGuard],
        component: MainLayoutComponent,
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