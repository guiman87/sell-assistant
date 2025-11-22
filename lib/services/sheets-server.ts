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

    // Check if the sheet is empty (or just check A1) to add headers
    try {
        const checkHeaders = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1',
        });

        if (!checkHeaders.data.values || checkHeaders.data.values.length === 0) {
            // Add headers
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Sheet1!A1:I1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [[
                        'Date',
                        'Title',
                        'Description',
                        'Price',
                        'Currency',
                        'Category',
                        'Condition',
                        'Images',
                        'Audio Notes'
                    ]],
                },
            });
        }
    } catch (e) {
        console.warn('Could not check/add headers:', e);
        // Continue anyway to append the row
    }

    // Construct full image URLs
    // In Home Assistant Add-on, we don't easily know the external URL.
    // We can try to use a configured BASE_URL or fall back to relative.
    // Ideally, the user should configure their external URL in the add-on options.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''; 
    
    const fullImageUrls = images.map(img => {
        if (img.startsWith('http')) return img;
        // Remove leading slash if base url has trailing slash to avoid double slashes
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanImg = img.startsWith('/') ? img : `/${img}`;
        return `${cleanBase}${cleanImg}`;
    });

    const values = [
        [
            new Date().toISOString(),
            analysis?.title || '',
            analysis?.description || '',
            analysis?.suggestedPrice || '',
            analysis?.currency || '',
            analysis?.category || '',
            analysis?.condition || '',
            fullImageUrls.join(', '),
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

