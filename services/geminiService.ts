import { GoogleGenAI } from "@google/genai";

// Per guidelines, API_KEY is assumed to be pre-configured and valid.
// The SDK will handle the key, so no need for additional variables or checks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRecommendation = async (findingDescription: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Com base na seguinte constatação de auditoria, sugira um plano de ação e recomendação claros e concisos. A resposta deve ser em português do Brasil.\n\nConstatação: "${findingDescription}"`,
            config: {
                temperature: 0.5,
                topP: 0.95,
                topK: 64,
            },
        });

        // FIX: Directly return the 'text' property from the response object as per guidelines.
        return response.text;
    } catch (error) {
        console.error("Error generating recommendation:", error);
        throw new Error("Failed to communicate with the AI model.");
    }
};
