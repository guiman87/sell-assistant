import { google } from 'googleapis';

export const getGoogleAuth = () => {
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!GOOGLE_CLIENT_EMAIL || !privateKey) {
        console.error('Missing credentials. Email:', !!GOOGLE_CLIENT_EMAIL, 'Key:', !!privateKey);
        throw new Error('Missing Google Service Account credentials');
    }

    // Normalize: Replace literal \n with real newlines (common in JSON or env vars)
    privateKey = privateKey.replace(/\\n/g, '\n');

    // Aggressive fix: Reconstruct the key if it looks malformed (e.g. spaces instead of newlines)
    // This handles cases where the key was flattened or stripped of newlines
    if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        const header = '-----BEGIN PRIVATE KEY-----';
        const footer = '-----END PRIVATE KEY-----';
        
        // Check if we are missing the critical newlines around the body
        if (!privateKey.includes(`${header}\n`) || !privateKey.includes(`\n${footer}`)) {
             console.log('Auth: Malformed key detected (missing newlines), reconstructing...');
             
             // Extract body: remove header, footer, and ALL whitespace (spaces, tabs, newlines)
             // Base64 should not have spaces, so this is safe.
             const body = privateKey
                .replace(header, '')
                .replace(footer, '')
                .replace(/\s/g, '');
             
             // Reassemble with correct newlines
             privateKey = `${header}\n${body}\n${footer}`;
        }
    }

    // Basic validation/fix for PEM format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error('Invalid Private Key format: Missing header');
    }

    // Debug logging (safe) - Use JSON.stringify to show hidden characters like \n
    console.log('Auth: Email:', GOOGLE_CLIENT_EMAIL);
    console.log('Auth: Key length:', privateKey.length);
    console.log('Auth: Key start (first 40 chars):', JSON.stringify(privateKey.substring(0, 40)));

    return new google.auth.GoogleAuth({
        credentials: {
            client_email: GOOGLE_CLIENT_EMAIL,
            private_key: privateKey,
        },
        scopes: [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    });
};
