import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ComponentValidationErrorsService } from '../../services/component-validation-errors.service';

@Component({
    selector: 'app-validation-errors',
    templateUrl: './validation-errors.component.html',
    styleUrl: './validation-errors.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationErrorsComponent {
    public readonly title = input('Erros encontrados:');

    public readonly hasErrors = computed(() => this.validationErrorsService.errors().length > 0);

    constructor(public readonly validationErrorsService: ComponentValidationErrorsService) { }
}