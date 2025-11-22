"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ItemDraft, WizardState, AnalysisResult } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface WizardContextType extends WizardState {
    setDraft: (draft: ItemDraft) => void;
    updateDraft: (updates: Partial<ItemDraft>) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    resetWizard: () => void;
}

const initialDraft: ItemDraft = {
    id: '',
    images: [],
    status: 'draft',
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [draft, setDraft] = useState<ItemDraft>(initialDraft);

    const updateDraft = (updates: Partial<ItemDraft>) => {
        setDraft((prev) => ({ ...prev, ...updates }));
    };

    const nextStep = () => setCurrentStep((prev) => prev + 1);
    const prevStep = () => setCurrentStep((prev) => Math.max(1, prev - 1));
    const goToStep = (step: number) => setCurrentStep(step);

    const resetWizard = () => {
        setCurrentStep(1);
        setDraft({ ...initialDraft, id: generateId() });
    };

    // Initialize ID on mount if empty
    React.useEffect(() => {
        if (!draft.id) {
            setDraft(prev => ({ ...prev, id: generateId() }));
        }
    }, []);

    return (
        <WizardContext.Provider
            value={{
                currentStep,
                draft,
                setDraft,
                updateDraft,
                nextStep,
                prevStep,
                goToStep,
                resetWizard,
            }}
        >
            {children}
        </WizardContext.Provider>
    );
}

export function useWizard() {
    const context = useContext(WizardContext);
    if (context === undefined) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
}
