import { ItemDraft } from '../types';

export interface SheetsService {
    submitItem(item: ItemDraft): Promise<void>;
}

export class GoogleSheetsClientService implements SheetsService {
    async submitItem(item: ItemDraft): Promise<void> {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });

        if (!response.ok) {
            throw new Error('Failed to submit item');
        }
    }
}

export const googleSheetsService = new GoogleSheetsClientService();
