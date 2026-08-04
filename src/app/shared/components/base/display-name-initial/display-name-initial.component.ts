import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
    selector: 'app-display-name-initial',
    templateUrl: './display-name-initial.component.html',
    styleUrl: './display-name-initial.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayNameInitialComponent {
    public readonly displayName = input<string>('');

    protected readonly initial = computed(() => {
        const normalizedDisplayName = this.displayName().trim();

        if (!normalizedDisplayName)
            return 'N/A';

        return normalizedDisplayName[0].toUpperCase();
    });
}