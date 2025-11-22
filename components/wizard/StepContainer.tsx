import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StepContainerProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function StepContainer({ title, description, children }: StepContainerProps) {
    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 md:p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                    {description && (
                        <p className="text-gray-600">{description}</p>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}
