import { getGoogleAuth } from '../google-auth';
import { google } from 'googleapis';

// Server-side helper to actually do the upload
export async function uploadToDrive(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Create a folder if needed, or just upload to root for now
    // Ideally we'd cache the folder ID

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    console.log("Uploading to folder:", folderId); // DEBUG
    if (!folderId) {
        throw new Error('Missing GOOGLE_DRIVE_FOLDER_ID');
    }

    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };
    console.log("File Metadata:", JSON.stringify(fileMetadata)); // DEBUG

    const media = {
        mimeType: mimeType,
        body: require('stream').Readable.from(fileBuffer),
    };

    const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink, thumbnailLink',
        supportsAllDrives: true,
    });

    // Make it public so the AI and user can see it (or use signed URLs)
    // For simplicity in this prototype, we'll make it reader-accessible to anyone with the link
    await drive.permissions.create({
        fileId: file.data.id!,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    // webContentLink is better for direct access (img src and fetch)
    // It usually looks like: https://drive.google.com/uc?id=FILE_ID&export=download
    return file.data.webContentLink || '';
}

