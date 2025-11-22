export interface AnalysisResult {
    title: string;
    description: string;
    category: string;
    brand?: string;
    model?: string;
    size?: string;
    color?: string;
    condition?: string;
    suggestedPrice?: number;
    currency: string;
    tags: string[];
}

export interface ItemDraft {
    id: string;
    images: string[]; // URLs
    audioBlob?: Blob;
    audioText?: string; // Transcribed or manually entered text
    analysis?: AnalysisResult;
    status: 'draft' | 'analyzing' | 'reviewed' | 'submitting' | 'submitted';
}

export interface WizardState {
    currentStep: number;
    draft: ItemDraft;
}
