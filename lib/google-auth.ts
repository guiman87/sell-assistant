import { google } from 'googleapis';

export const getGoogleAuth = () => {
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!GOOGLE_CLIENT_EMAIL || !privateKey) {
        console.error('Missing credentials. Email:', !!GOOGLE_CLIENT_EMAIL, 'Key:', !!privateKey);
        throw new Error('Missing Google Service Account credentials');
    }

    // If the key contains literal \n characters (common in JSON or env vars), replace them
    if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // Also handle space-separated keys which can happen if newlines are lost
    if (!privateKey.includes('\n') && privateKey.includes(' PRIVATE KEY----- ')) {
        console.log('Auth: Detected space-separated key, attempting to fix...');
        privateKey = privateKey.replace('-----BEGIN PRIVATE KEY----- ', '-----BEGIN PRIVATE KEY-----\n');
        privateKey = privateKey.replace(' -----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
        // The middle part might still be space separated, but let's see if the header fix is enough
        // or if we need to be more aggressive.
        // A more aggressive fix for the body:
        const header = '-----BEGIN PRIVATE KEY-----\n';
        const footer = '\n-----END PRIVATE KEY-----';
        const body = privateKey.replace(header, '').replace(footer, '').replace(/ /g, '\n');
        // This is risky if there are legitimate spaces, but base64 shouldn't have spaces.
        // Let's try a safer approach first: just ensuring header/footer are on own lines.
    }

    // Basic validation/fix for PEM format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error('Invalid Private Key format: Missing header');
    }

    // Debug logging (safe)
    console.log('Auth: Email:', GOOGLE_CLIENT_EMAIL);
    console.log('Auth: Key length:', privateKey.length);
    console.log('Auth: Key start:', privateKey.substring(0, 35).replace(/\n/g, ' '));

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
