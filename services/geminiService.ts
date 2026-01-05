
import { GoogleGenAI } from "@google/genai";
import type { Audit, AuditGrid, ActionPlan } from '../types';

// Lazy initialization to prevent top-level crashes if env vars aren't ready or process is undefined.
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
    if (!ai) {
        // Per guidelines, API_KEY is assumed to be pre-configured and valid.
        // We add a safety check for 'process' to prevent ReferenceError in pure browser environments.
        const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
        
        if (!apiKey) {
            console.warn("API Key not found. AI features will not work.");
        }
        
        ai = new GoogleGenAI({ apiKey: apiKey || '' });
    }
    return ai;
}

export const generateRecommendation = async (findingDescription: string): Promise<string> => {
    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Com base na seguinte constatação de auditoria, sugira um plano de ação e recomendação claros e concisos. A resposta deve ser em português do Brasil.\n\nConstatação: "${findingDescription}"`,
            config: {
                temperature: 0.5,
                topP: 0.95,
                topK: 64,
            },
        });

        // FIX: Directly return the 'text' property from the response object as per guidelines.
        return response.text || '';
    } catch (error) {
        console.error("Error generating recommendation:", error);
        throw new Error("Failed to communicate with the AI model.");
    }
};

export const getChatbotResponse = async (
    prompt: string,
    audits: Audit[],
    grids: AuditGrid[],
    actionPlans: ActionPlan[]
): Promise<string> => {
    // Create a simplified and relevant context from the user's data
    const contextData = {
        audits: audits.map(audit => ({
            code: audit.code,
            title: audit.title,
            status: audit.status,
            scope: audit.scope,
            period: `${audit.startDate} to ${audit.endDate}`,
            findings: audit.findings.map(finding => ({
                title: finding.title,
                status: finding.status,
                description: finding.description,
            })),
        })),
        action_plans: actionPlans.map(plan => ({
            action: plan.what,
            status: plan.status,
            due_date: plan.when,
            related_finding_title: audits
                .flatMap(a => a.findings)
                .find(f => f.id === plan.findingId)?.title || 'N/A',
        })),
    };

    const contextString = JSON.stringify(contextData, null, 2);

    const systemInstruction = `Você é o "AuditBot", um assistente especialista em auditoria interna. Sua função é:
1.  **Analisar Dados:** Ajudar os usuários a analisar os dados de auditoria que foram atribuídos a eles.
2.  **Sugerir Ações:** Propor planos de ação detalhados (usando a metodologia 5W2H se apropriado) para as "Não Conformidades" encontradas.
3.  **Ser um Instrutor:** Fornecer orientação e insights sobre como melhorar os processos de auditoria, especialmente para novos auditores.
4.  **Basear-se em Fatos:** Responda EST exclusiva E estritamente com base nos "Dados de Contexto do Usuário" fornecidos abaixo. Não invente informações, auditorias, ou achados.
5.  **Ser Claro e Conciso:** Suas respostas devem ser úteis, claras e bem estruturadas.
6.  **Formatação:** Formate suas respostas usando Markdown simples: use '### ' para títulos, '* ' para itens de lista e '**texto**' para negrito.
7.  **Idioma:** Responda sempre em português do Brasil.
8.  **Escopo:** Se a pergunta for sobre um tópico fora do contexto de auditoria ou dos dados fornecidos, educadamente afirme que você só pode discutir informações relacionadas às auditorias do usuário.

### Dados de Contexto do Usuário:
\`\`\`json
${contextString}
\`\`\`
`;

    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-pro-preview-02-05",
            contents: `A pergunta do usuário é: "${prompt}"`,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3, // Lower temperature for more factual responses
            },
        });

        return response.text || '';
    } catch (error) {
        console.error("Error generating chatbot response:", error);
        throw new Error("Failed to communicate with the AI model for chatbot.");
    }
};
