---
description: "Use when creating or editing Angular components. Covers OnPush, standalone, signal forms, loading/validation services, and template binding patterns."
applyTo: "src/**/*.component.ts"
---
# Angular Component Conventions

## Decorator Baseline

Every component must use:
- `changeDetection: ChangeDetectionStrategy.OnPush`
- `standalone: true` (implicit in Angular 19+; import directly in `imports` array)
- `templateUrl` and `styleUrl` (singular)

## Providers

Scope services to the component via `providers` when they hold per-component state:

```ts
providers: [ComponentLoadingService, ComponentValidationErrorsService]
```

Never inject `ComponentLoadingService` or `ComponentValidationErrorsService` as `providedIn: 'root'`.

## Signal Forms

Use the Angular signal forms API from `@angular/forms/signals`:

```ts
protected readonly myModel = signal<MyRequest>({ field: '' });

protected readonly myForm = form(this.myModel, (f) => {
    required(f.field);
    minLength(f.field, 3);
    maxLength(f.field, 100);
});
```

Form submission:
```ts
await submit(this.myForm, {
    onInvalid: () => { },
    action: async () => {
        await this.loadingService.trackAsync(async () => {
            const result = await this.myFacade.doSomething(this.myForm().value());
            // handle result
        });
        return undefined;
    }
});
```

Field error helper:
```ts
protected hasFieldError(field: 'fieldName', errorKind: string): boolean {
    return this.myForm[field]().errors().some(error => error.kind === errorKind);
}
```

Always import `FormField` from `@angular/forms/signals` into the component's `imports` array.

## Loading State

```ts
public readonly loadingService: ComponentLoadingService   // public — used in template

// In template: <app-loading-overlay [loadingService]="loadingService" />
```

## Validation Errors

```ts
public readonly validationErrorsService: ComponentValidationErrorsService  // public — used in template

// On failure:
this.validationErrorsService.setErrors(result.validationErrors);

// On each new submission attempt:
this.validationErrorsService.clear();
```

## Guard: prevent double-submit

```ts
if (this.loadingService.isLoading())
    return;
```
