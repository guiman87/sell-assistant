import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/services/sheets-server';
import { ItemDraft } from '@/lib/types';

export async function POST(req: NextRequest) {
    try {
        const item: ItemDraft = await req.json();
        await appendToSheet(item);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Submission error:', error);
        return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
    }
}
