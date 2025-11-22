import { ItemDraft } from '../types';
import { getGoogleAuth } from '../google-auth';
import { google } from 'googleapis';

// Server-side helper
export async function appendToSheet(item: ItemDraft) {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // We need a spreadsheet ID. For now, we'll assume it's in an env var
    // or we could create one if it doesn't exist (more complex).
    const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

    if (!SPREADSHEET_ID) {
        throw new Error('Missing GOOGLE_SPREADSHEET_ID');
    }

    const { analysis, images, audioText } = item;

    const values = [
        [
            new Date().toISOString(),
            analysis?.title || '',
            analysis?.description || '',
            analysis?.suggestedPrice || '',
            analysis?.currency || '',
            analysis?.category || '',
            analysis?.condition || '',
            images.join(', '),
            audioText || '',
        ]
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A:I', // Assumes Sheet1 exists
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values,
        },
    });
}

