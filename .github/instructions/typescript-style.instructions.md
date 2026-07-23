---
description: "Use when writing or editing TypeScript files. Covers code style: visibility modifiers, constructor format, spacing, naming, and type vs class choices."
applyTo: "**/*.ts"
---
# TypeScript Code Style

## Visibility

- Always use explicit `public` modifier on public methods and properties — never rely on implicit public
- Use `private readonly` for injected services not accessed in templates
- Use `public readonly` for injected services accessed in templates
- Use `protected readonly` for component-level signals, forms, and state that are only used in templates

## Constructor Format

Last parameter and `)` go on the same line. No trailing comma on the last parameter.

Empty body:
```ts
constructor(
    private readonly fooService: FooService,
    private readonly barService: BarService) { }
```

With body:
```ts
constructor(
    private readonly fooService: FooService,
    private readonly barService: BarService) {

    this.init();
}
```

## Spacing

- Blank line between logical blocks inside method bodies
- No blank line at top or bottom of a method body

## Formatting

- 4-space indentation
- Single quotes for strings
- No trailing commas on last element before `]`, `}`, `)`
- No trailing newline at end of file
- One class or type per file — never define more than one

## Types vs Classes

- Use `type` for DTOs and data shapes (no methods, no behavior)
- Use `class` for things with behavior (services, components, facades)

## UseCaseResult

Facades and use-cases must return `Promise<UseCaseResult<T>>`. Import from `core/models/base/use-case-result`.

```ts
public async doSomething(): Promise<UseCaseResult<MyResult>> {
    const response = await this.omegaFyChatClient.doSomething(request);

    if (!response.succeeded)
        return { success: false, validationErrors: response.errors };

    return { success: true, data: response.data };
}
```
