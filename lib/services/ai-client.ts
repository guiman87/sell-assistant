import { AnalysisResult } from '../types';

export interface AIService {
    analyzeItem(imageUrls: string[], contextText?: string): Promise<AnalysisResult>;
}

export class GeminiAIClientService implements AIService {
    async analyzeItem(imageUrls: string[], contextText?: string): Promise<AnalysisResult> {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrls, contextText }),
        });

        if (!response.ok) {
            throw new Error('Failed to analyze item');
        }

        return await response.json();
    }
}

export const geminiAIService = new GeminiAIClientService();
