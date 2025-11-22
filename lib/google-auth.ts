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
