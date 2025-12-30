import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateUtilsService {
    toApiDate(
        value: Date | string | null
    ): string | null {
        if (!value) {
            return null;
        }

        let year: number, month: number, day: number;

        if (value instanceof Date) {
            const d = value;
            year = d.getUTCFullYear();
            month = d.getUTCMonth() + 1;
            day = d.getUTCDate();
        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const parts = value.split('-').map((p) => parseInt(p, 10));
            year = parts[0];
            month = parts[1];
            day = parts[2];
        } else {
            const parsed = new Date(value as string);
            if (isNaN(parsed.valueOf())) return null;
            year = parsed.getUTCFullYear();
            month = parsed.getUTCMonth() + 1;
            day = parsed.getUTCDate();
        }

        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}T00:00:00Z`;
    }

    toInputDate(
        dateParameter: Date | string | null
    ): string | null {
        if (!dateParameter) {
            return null;
        }

        const date = dateParameter instanceof Date
            ? dateParameter
            : new Date(dateParameter);

        if (isNaN(date.valueOf())) {
            return null;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}
