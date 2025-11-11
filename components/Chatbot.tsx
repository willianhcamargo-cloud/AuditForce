import React, { useState, useRef, useEffect } from 'react';
import type { User, Audit, AuditGrid, ActionPlan } from '../types';
import { getChatbotResponse } from '../services/geminiService';

interface ChatbotProps {
    currentUser: User;
    audits: Audit[];
    grids: AuditGrid[];
    actionPlans: ActionPlan[];
}

interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const processLine = (line: string) => {
        // Handle **bold** text -> <strong>...</strong>
        return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentListItems: string[] = [];

    const flushList = (key: string | number) => {
        if (currentListItems.length > 0) {
            elements.push(
                <ul key={key} className="list-disc pl-5 space-y-1 my-2">
                    {currentListItems.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: processLine(item) }} />
                    ))}
                </ul>
            );
            currentListItems = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.startsWith('### ')) {
            flushList(`ul-${index}`);
            const content = line.substring(4);
            elements.push(<h3 key={index} className="text-lg font-bold my-2" dangerouslySetInnerHTML={{ __html: processLine(content) }} />);
        } else if (line.startsWith('* ')) {
            const content = line.substring(2);
            currentListItems.push(content);
        } else {
            flushList(`ul-${index}`);
            if (line.trim()) {
                 elements.push(<p key={index} className="my-1" dangerouslySetInnerHTML={{ __html: processLine(line) }} />);
            }
        }
    });

    flushList('ul-end'); // Flush any remaining list

    return <>{elements}</>;
};

const ChatMessage: React.FC<{ message: Message; avatarUrl?: string }> = ({ message, avatarUrl }) => {
    const isBot = message.sender === 'bot';
    return (
        <div className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
            {!isBot && avatarUrl && <img src={avatarUrl} alt="User" className="w-8 h-8 rounded-full" />}
            {isBot && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    AI
                </div>
            )}
            <div className={`p-3 rounded-lg max-w-lg ${isBot ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900'}`}>
                 <div className="text-sm text-on-surface dark:text-dark-on-surface">
                   {isBot ? <MarkdownRenderer text={message.text} /> : <p className="whitespace-pre-wrap">{message.text}</p>}
                </div>
            </div>
        </div>
    );
};


export const Chatbot: React.FC<ChatbotProps> = ({ currentUser, audits, grids, actionPlans }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'bot', text: `Olá, ${currentUser.name}! Sou o AuditBot, seu assistente de auditoria. Como posso ajudar hoje? Você pode perguntar sobre suas auditorias, pedir sugestões para não conformidades ou dicas para melhorar seu processo.` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponseText = await getChatbotResponse(input, audits, grids, actionPlans);
            const botMessage: Message = { id: Date.now() + 1, sender: 'bot', text: botResponseText };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { id: Date.now() + 1, sender: 'bot', text: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const promptSuggestions = [
        "Quais auditorias estão em andamento?",
        "Mostre as não conformidades da auditoria AUD-TI-2023-001.",
        "Sugira um plano de ação para 'Política de segurança desatualizada'.",
        "Como posso melhorar a coleta de evidências?"
    ];

    return (
        <div className="h-full flex flex-col bg-surface dark:bg-dark-surface rounded-lg shadow-md">
            <header className="p-4 border-b dark:border-gray-700">
                <h1 className="text-xl font-bold text-on-surface dark:text-dark-on-surface">AuditBot - Assistente IA</h1>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} avatarUrl={currentUser.avatarUrl} />
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                           <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t dark:border-gray-700">
                 <div className="flex flex-wrap gap-2 mb-2">
                    {promptSuggestions.map((prompt, i) => (
                        <button key={i} onClick={() => setInput(prompt)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            {prompt}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pergunte ao AuditBot..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-primary text-white p-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600"
                        aria-label="Enviar mensagem"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};