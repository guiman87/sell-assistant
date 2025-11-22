import { AnalysisResult } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Server-side helper
export async function analyzeWithGemini(imageUrls: string[], contextText?: string): Promise<AnalysisResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Missing GEMINI_API_KEY');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Fetch images and convert to base64 (Gemini needs base64 or file URI, but for simplicity we'll fetch and convert)
    // Note: This might be slow for large images. 
    // Optimization: Use the file API if we uploaded to Gemini's file manager, but here we are using Drive.
    // So we fetch from the public Drive URL.

    const imageParts = await Promise.all(imageUrls.map(async (url) => {
        console.log('Analyzing URL:', url, 'Is Local:', url.startsWith('/uploads/')); // DEBUG
        // Check if it's a local upload
        if (url.startsWith('/uploads/')) {
            const fs = await import('fs/promises');
            const path = await import('path');
            const filePath = path.join(process.cwd(), 'public', url);
            const buffer = await fs.readFile(filePath);
            return {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: 'image/jpeg', // Assuming jpeg/png, could detect from extension
                },
            };
        }

        // External URL (e.g. Drive)
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return {
            inlineData: {
                data: Buffer.from(buffer).toString('base64'),
                mimeType: response.headers.get('content-type') || 'image/jpeg',
            },
        };
    }));

    const prompt = `
    Analizá estas imágenes y la siguiente descripción del usuario: "${contextText || ''}".
    Proporcioná una salida JSON estructurada para un listado de venta EN ESPAÑOL DE URUGUAY.
    El JSON debe seguir estrictamente este esquema:
    {
      "title": "Título descriptivo corto",
      "description": "Descripción detallada de venta",
      "category": "Ruta de categoría (ej. Ropa > Hombre > Camisas)",
      "brand": "Nombre de marca si es visible",
      "model": "Nombre de modelo si es visible",
      "size": "Talle si aplica",
      "color": "Color principal",
      "condition": "Condición estimada (Nuevo, Como Nuevo, Bueno, Regular)",
      "suggestedPrice": número (valor estimado en dólares USD),
      "currency": "USD",
      "tags": ["etiqueta1", "etiqueta2"]
    }
    No incluyas bloques de código markdown, solo el JSON puro.
  `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown if present
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonString);
}

