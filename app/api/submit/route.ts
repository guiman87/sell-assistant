import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/services/sheets-server';
import { ItemDraft } from '@/lib/types';

export async function POST(req: NextRequest) {
    try {
        const item: ItemDraft = await req.json();
        await appendToSheet(item);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Submission error:', error);
        // Return the actual error message for debugging
        return NextResponse.json({ error: 'Submission failed', details: error.message }, { status: 500 });
    }
}
