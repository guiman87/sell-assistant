import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/services/ai-server';

export async function POST(req: NextRequest) {
    try {
        const { imageUrls, contextText } = await req.json();
        const result = await analyzeWithGemini(imageUrls, contextText);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
