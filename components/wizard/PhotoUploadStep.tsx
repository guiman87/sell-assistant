"use client";

import React, { useRef, useState } from 'react';
import { useWizard } from './WizardProvider';
import { StepContainer } from './StepContainer';
import { Button } from '@/components/ui/button';
import { googleDriveService } from '@/lib/services/drive-client';
import { Camera, Upload, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export function PhotoUploadStep() {
    const { draft, updateDraft, nextStep } = useWizard();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            const newImages = [...draft.images];

            try {
                for (let i = 0; i < e.target.files.length; i++) {
                    const file = e.target.files[i];
                    const url = await googleDriveService.uploadImage(file);
                    newImages.push(url);
                }
                updateDraft({ images: newImages });
            } catch (error) {
                console.error("Upload failed", error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const removeImage = (index: number) => {
        const newImages = draft.images.filter((_, i) => i !== index);
        updateDraft({ images: newImages });
    };

    return (
        <StepContainer
            title="Sacá Fotos"
            description="Subí fotos del artículo que querés vender. Fotos claras y bien iluminadas funcionan mejor."
        >
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    {draft.images.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                            <img src={url} alt={`Item ${index + 1}`} className="object-cover w-full h-full" />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-md border-2 border-dashed border-gray-400 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-500 transition-colors"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Spinner />
                        ) : (
                            <>
                                <Camera className="w-8 h-8 text-gray-600" />
                                <span className="text-sm text-gray-700 font-medium">Agregar Foto</span>
                            </>
                        )}
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleFileSelect}
                />

                <div className="flex justify-end gap-4">
                    <Button
                        onClick={nextStep}
                        disabled={draft.images.length === 0 || isUploading}
                        className="w-full sm:w-auto"
                    >
                        Siguiente: Agregar Detalles
                    </Button>
                </div>
            </div>
        </StepContainer>
    );
}
