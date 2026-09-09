import { DestroyRef } from '@angular/core';

export abstract class DestroyableComponent {
    protected readonly destroyRef: DestroyRef;

    public constructor(destroyRef: DestroyRef) {
        this.destroyRef = destroyRef;
    }
}