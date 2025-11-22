"use client";

import React from 'react';
import { WizardProvider, useWizard } from '@/components/wizard/WizardProvider';
import { PhotoUploadStep } from '@/components/wizard/PhotoUploadStep';
import { AudioContextStep } from '@/components/wizard/AudioContextStep';
import { ReviewStep } from '@/components/wizard/ReviewStep';

function WizardContent() {
    const { currentStep } = useWizard();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mb-8">
                <div className="flex justify-center mb-8">
                    <div className="flex space-x-2">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${step === currentStep
                                        ? 'bg-blue-600 text-white'
                                        : step < currentStep
                                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                            : 'bg-gray-200 text-gray-700 border-2 border-gray-300'
                                    }`}
                            >
                                Paso {step}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    />
                </div>
            </div>

            {currentStep === 1 && <PhotoUploadStep />}
            {currentStep === 2 && <AudioContextStep />}
            {currentStep === 3 && <ReviewStep />}
        </div>
    );
}

export default function WizardPage() {
    return (
        <WizardProvider>
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
                <WizardContent />
            </div>
        </WizardProvider>
    );
}
