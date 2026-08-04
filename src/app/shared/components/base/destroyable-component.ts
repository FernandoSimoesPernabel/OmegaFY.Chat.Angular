import { DestroyRef, inject } from '@angular/core';

export abstract class DestroyableComponent {
    protected readonly destroyRef = inject(DestroyRef);
}