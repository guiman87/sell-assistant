"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useWizard } from './WizardProvider';
import { StepContainer } from './StepContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Square, ArrowRight, ArrowLeft, MicOff } from 'lucide-react';

// Type definitions for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export function AudioContextStep() {
    const { draft, updateDraft, nextStep, prevStep } = useWizard();
    const [isRecording, setIsRecording] = useState(false);
    const [textInput, setTextInput] = useState(draft.audioText || '');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
            const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;

            if (SpeechRecognitionConstructor) {
                const recognition = new SpeechRecognitionConstructor();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'es-UY';
                recognition.maxAlternatives = 1;

                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        setTextInput(prev => (prev ? prev + ' ' + finalTranscript : finalTranscript));
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                        setError('Acceso al micrófono denegado. Asegurate de usar HTTPS o escribí la descripción.');
                    } else {
                        setError('Error en el reconocimiento de voz. Por favor escribí la descripción.');
                    }
                    setIsRecording(false);
                };

                recognition.onend = () => {
                    setIsRecording(false);
                };

                recognitionRef.current = recognition;
            } else {
                setError('Speech recognition not supported in this browser.');
            }
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            setError('Speech recognition not initialized.');
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            setError(null);
            try {
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Failed to start recording:", err);
                // Sometimes it throws if already started, just reset
                setIsRecording(true);
            }
        }
    };

    const handleNext = () => {
        updateDraft({ audioText: textInput });
        nextStep();
    };

    return (
        <StepContainer
            title="Agregar Detalles"
            description="Grabá o escribí información adicional sobre tu artículo."
        >
            <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-gray-400 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-500 transition-colors">
                    <button
                        onClick={toggleRecording}
                        className={`p-6 rounded-full transition-all ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 shadow-lg'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                            }`}
                    >
                        <Mic className={`w-8 h-8 ${isRecording ? 'text-white animate-pulse' : 'text-white'}`} />
                    </button>
                    <p className="mt-4 text-sm text-gray-700 font-medium text-center">
                        {error ? (
                            <span className="text-red-600 font-semibold">{error}</span>
                        ) : isRecording ? (
                            "Escuchando... (Hablá ahora)"
                        ) : (
                            "Tocá para grabar"
                        )}
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-600 font-semibold">O escribí manualmente</span>
                    </div>
                </div>

                <textarea
                    className="flex min-h-[80px] w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    placeholder="Ej: Comprado el año pasado, talle M, poco uso..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                />

                <div className="flex justify-between gap-4 pt-4">
                    <Button variant="outline" onClick={prevStep}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Atrás
                    </Button>
                    <Button onClick={handleNext} disabled={!textInput.trim()}>
                        Analizar Artículo
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </StepContainer>
    );
}
