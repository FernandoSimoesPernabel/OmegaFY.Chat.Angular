---
description: "Use when creating or editing Angular HTML templates. Covers Angular control flow syntax, Material UI patterns, signal form bindings, loading overlay, and validation errors."
applyTo: "src/**/*.html"
---
# Angular Template Conventions

## Control Flow

Use Angular's built-in control flow — never `*ngIf`, `*ngFor`, or `*ngSwitch`:

```html
@if (condition) {
    ...
} @else {
    ...
}

@for (item of items(); track item.id) {
    ...
} @empty {
    <p>Nenhum item encontrado.</p>
}

@switch (value()) {
    @case ('a') { ... }
    @default { ... }
}
```

## Styling (Mandatory)

- Never use static inline style attributes like `style="..."` in templates
- Use semantic `class` names in HTML and define styles in the component stylesheet
- For runtime-dependent style values, use Angular style bindings (`[style.width.px]`, `[style.color]`, etc.)
- Never use `ngStyle`

If a style block is repeated in 2 or more components, extract it to a shared style module under `src/app/shared/styles/` and import it from each component stylesheet:

```css
@import '../../../../shared/styles/auth-ui-base.css';
```

Keep shared style modules generic and token-based. Keep page-specific layout in the component-local stylesheet.

## Signal Form Bindings

Bind inputs and checkboxes using `[formField]` (requires `FormField` in component `imports`):

```html
<input matInput [formField]="myForm.fieldName" type="text" />
<mat-checkbox [formField]="myForm.active">Label</mat-checkbox>
```

Disable the submit button while loading or the form is invalid:

```html
<button mat-flat-button type="submit"
    [disabled]="loadingService.isLoading() || myForm().invalid()">
    @if (loadingService.isLoading()) { Processando... }
    @else { Confirmar }
</button>
```

## Loading Overlay

Render inside the component root when `ComponentLoadingService` is provided:

```html
@if (loadingService.isLoading()) {
    <app-loading-overlay />
}
```

`LoadingOverlayComponent` must be listed in the component's `imports` array.

## Server-Side Validation Errors

Display server validation errors using `app-validation-errors` when `ComponentValidationErrorsService` is in scope:

```html
<app-validation-errors />
```

`ValidationErrorsComponent` must be listed in the component's `imports` array. It reads errors from the scoped `ComponentValidationErrorsService` injected in the component class.

## Field Errors (Client-Side)

Use `@if` inside `mat-form-field` to show per-field errors via the `hasFieldError` helper:

```html
<mat-form-field appearance="outline">
    <mat-label>Email</mat-label>
    <input matInput [formField]="myForm.email" type="email" />
    @if (hasFieldError('email', 'required')) {
        <mat-error>Email é obrigatório</mat-error>
    } @else if (hasFieldError('email', 'email')) {
        <mat-error>Email inválido</mat-error>
    }
</mat-form-field>
```

## Navigation

Use `routerLink` for internal navigation (requires `RouterLink` in component `imports`):

```html
<button mat-button routerLink="/conversations">Conversas</button>
<a routerLink="/login">Entrar</a>
```