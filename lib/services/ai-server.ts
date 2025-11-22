import { AnalysisResult } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Server-side helper
export async function analyzeWithGemini(imageUrls: string[], contextText?: string): Promise<AnalysisResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Missing GEMINI_API_KEY');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use a specific version alias if the generic one fails
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

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
            
            // Extract filename from URL
            const filename = url.split('/').pop();
            if (!filename) throw new Error('Invalid file URL');

            // Use UPLOAD_DIR env var or default to public/uploads
            const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public/uploads');
            console.log('AI Server using uploadDir:', uploadDir); // DEBUG
            const filePath = path.join(uploadDir, filename);
            
            console.log('Reading file from:', filePath); // DEBUG
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

