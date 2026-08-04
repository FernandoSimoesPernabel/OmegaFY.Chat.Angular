import { formatDate } from '@angular/common';
import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';

@Pipe({
    name: 'appConversationDateTime',
    standalone: true
})
export class ConversationDateTimePipe implements PipeTransform {
    private readonly localeId = inject(LOCALE_ID);

    public transform(value: string | Date | null | undefined): string | Date | null | undefined {
        if (!value)
            return value;

        try {
            return formatDate(value, 'dd/MM/yyyy HH:mm', this.localeId);
        } catch {
            return value;
        }
    }
}