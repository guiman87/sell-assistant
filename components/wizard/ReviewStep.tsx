"use client";

import React, { useEffect, useState } from 'react';
import { useWizard } from './WizardProvider';
import { StepContainer } from './StepContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { geminiAIService } from '@/lib/services/ai-client';
import { googleSheetsService } from '@/lib/services/sheets-client';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';

export function ReviewStep() {
    const { draft, updateDraft, prevStep } = useWizard();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Trigger analysis on mount if not already done
    useEffect(() => {
        if (!draft.analysis && !isAnalyzing) {
            const analyze = async () => {
                setIsAnalyzing(true);
                try {
                    const result = await geminiAIService.analyzeItem(draft.images, draft.audioText);
                    updateDraft({ analysis: result, status: 'reviewed' });
                } catch (error) {
                    console.error("Analysis failed", error);
                } finally {
                    setIsAnalyzing(false);
                }
            };
            analyze();
        }
    }, [draft.analysis, draft.images, draft.audioText, updateDraft]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await googleSheetsService.submitItem(draft);
            updateDraft({ status: 'submitted' });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <StepContainer title="¡Éxito!">
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                    <h3 className="text-xl font-semibold text-green-600">¡Éxito!</h3>
                    <p className="text-center text-gray-700 font-medium">Tu artículo fue guardado en Google Sheets.</p>
                    <Button onClick={() => window.location.reload()} className="mt-4">
                        Vender Otro Artículo
                    </Button>
                </div>
            </StepContainer>
        );
    }

    if (isAnalyzing || !draft.analysis) {
        return (
            <StepContainer title="Analizando Artículo...">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Spinner className="w-8 h-8" />
                    <p className="text-sm text-gray-600 text-center font-medium">
                        Nuestra IA está analizando tus fotos y descripción...
                    </p>
                </div>
            </StepContainer>
        );
    }

    const { analysis } = draft;

    return (
        <StepContainer
            title="Revisar Detalles"
            description="Revisá la información generada por IA y editala si es necesario."
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                        value={analysis.title}
                        onChange={(e) => updateDraft({
                            analysis: { ...analysis, title: e.target.value }
                        })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={analysis.description}
                        onChange={(e) => updateDraft({
                            analysis: { ...analysis, description: e.target.value }
                        })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Precio ({analysis.currency})</label>
                        <Input
                            type="number"
                            value={analysis.suggestedPrice}
                            onChange={(e) => updateDraft({
                                analysis: { ...analysis, suggestedPrice: parseFloat(e.target.value) }
                            })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Condición</label>
                        <Input
                            value={analysis.condition}
                            onChange={(e) => updateDraft({
                                analysis: { ...analysis, condition: e.target.value }
                            })}
                        />
                    </div>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                    <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Atrás
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner className="mr-2" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar en Sheets"
                        )}
                    </Button>
                </div>
            </div>
        </StepContainer>
    );
}
