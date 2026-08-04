# OmegaFY Chat — Workspace Guidelines

## Tech Stack

- Angular 19+ (standalone components, signal forms, OnPush change detection)
- Angular Material (all UI components)
- TypeScript strict mode
- JWT authentication with silent refresh token interceptor

## Instruction Files

Load the appropriate instruction file before generating code:

| File | When to apply |
|------|--------------|
| `angular-components.instructions.md` | Creating or editing `*.component.ts` |
| `angular-templates.instructions.md` | Creating or editing `*.html` templates |
| `angular-patterns.instructions.md` | Adding facades, routes, guards, HTTP endpoints |
| `typescript-style.instructions.md` | Any `*.ts` file |

## Key Rules

- All components: `ChangeDetectionStrategy.OnPush`, standalone, `templateUrl` + `styleUrl`
- Templates: never use inline style attributes (`style="..."`) for static styles; use CSS classes
- Shared styling: if the same style block appears in 2+ components, extract it to `src/app/shared/styles/` and import it from component stylesheets
- Forms: signal forms from `@angular/forms/signals` — never `ReactiveFormsModule` or `FormsModule`
- Facades are the single integration point between components and `OmegaFyChatClient`
- `NotificationService` — user feedback (success/error/warning snackbars)
- `ComponentLoadingService` — per-component loading state; always scoped via `providers`
- `ComponentValidationErrorsService` — server-side validation errors; always scoped via `providers`
- Never access localStorage directly — use `LocalStorageService`
- Never access auth tokens directly — use `AuthService`