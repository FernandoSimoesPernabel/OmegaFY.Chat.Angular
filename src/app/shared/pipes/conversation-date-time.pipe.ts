import { formatDate } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'appConversationDateTime',
    standalone: true
})
export class ConversationDateTimePipe implements PipeTransform {
    constructor(@Inject(LOCALE_ID) private readonly localeId: string) { }

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