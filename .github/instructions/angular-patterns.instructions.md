---
description: "Use when creating facades, adding API endpoints, routes, guards, or implementing the Core/Shared/Features architecture. Covers facade pattern, OmegaFyChatClient, routing, and architecture boundaries."
---
# Angular Architecture & Patterns

## Architecture Layers

```
core/         — framework-level: auth, config, HTTP client, interceptors, base models
shared/       — reusable UI/services with no feature dependency
features/     — vertical slices: auth, conversations, etc.
  └─ components/
  └─ facades/
```

Rules:
- `features/` can depend on `core/` and `shared/`, never on other features
- `shared/` can depend on `core/`, never on `features/`
- `core/` has no dependency on `shared/` or `features/`

## Shared Style Architecture

- Reusable style modules live in `src/app/shared/styles/`
- Feature component stylesheets may import shared style modules
- Shared style modules must not import from `features/`
- When style rules are duplicated across 2 or more components, extract them into shared style modules
- Keep feature-specific layout and one-off visual rules in each component stylesheet

## Facade Pattern

Facades live in `features/<name>/facades/`. They are the single integration point between components and the HTTP client + domain services.

```ts
@Injectable({ providedIn: 'root' })
export class MyFacade {
    constructor(
        private readonly omegaFyChatClient: OmegaFyChatClient,
        private readonly someService: SomeService) { }

    public async doSomething(request: MyRequest): Promise<UseCaseResult<MyResult>> {
        const response = await this.omegaFyChatClient.doSomething(request);

        if (!response.succeeded)
            return { success: false, validationErrors: response.errors };

        return { success: true, data: response.data };
    }
}
```

Return type is always `Promise<UseCaseResult<T>>`.

## OmegaFyChatClient — Adding Endpoints

Use the private generic helpers. Keep methods one-line delegations:

```ts
public async myEndpoint(request: MyRequest): Promise<ApiResponse<MyResult>> {
    return this.post<MyRequest, MyResult>('Resource/my-endpoint', request);
}

public async myGetEndpoint(): Promise<ApiResponse<MyResult>> {
    return this.get<MyResult>('Resource/my-endpoint');
}
```

Available helpers: `post`, `get`, `put`, `delete`.

## Models

- Request/response types go in `core/models/<domain>/`
- Use `type` for all DTOs (no behavior)
- API contract: `ApiResponse<T>` with `{ succeeded: boolean; data: T; errors: ValidationError[] }`
- Facade contract: `UseCaseResult<T>` — `{ success: true; data: T }` | `{ success: false; validationErrors: ValidationError[] }`

## Routing

Route files are named `<feature>.routes.ts` and live in `features/<feature>/`. Use `loadComponent` for lazy-loaded components and `loadChildren` for route groups:

```ts
// features/my-feature/my-feature.routes.ts
export const myFeatureRoutes: Routes = [
    {
        path: 'list',
        loadComponent: () => import('./components/list/list.component').then(m => m.ListComponent)
    }
];

// app.routes.ts — group under a guard
{
    path: 'my-feature',
    canActivate: [authGuard],
    loadChildren: () => import('./features/my-feature/my-feature.routes').then(m => m.myFeatureRoutes)
}
```

## Guards

Guards use the functional `CanActivateFn` form and `inject()` — never class-based guards:

```ts
export const myGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated())
        return true;

    return router.createUrlTree(['/login']);
};
```

Guards live in `core/auth/guards/`.

## Auth

Tokens are stored in localStorage via `AuthService.saveTokens(token, refreshToken)`. Never access localStorage directly for auth — always go through `AuthService`.
