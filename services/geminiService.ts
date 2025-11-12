import { GoogleGenAI } from "@google/genai";

interface ImagePart {
    b64: string;
    mimeType: string;
}

export const generateResponse = async (prompt: string, temperature: number, image: ImagePart | null): Promise<string> => {
    if (!prompt && !image) {
        throw new Error("Prompt and image cannot both be empty.");
    }
    
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set. Please configure it to use the Gemini API.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const parts: any[] = [];
        if (prompt) {
            parts.push({ text: prompt });
        }
        if (image) {
            parts.push({
                inlineData: {
                    mimeType: image.mimeType,
                    data: image.b64,
                },
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                temperature: temperature,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        if (error instanceof Error) {
            throw new Error(`Error generating response: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the response.");
    }
};
