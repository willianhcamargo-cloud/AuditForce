import React, { useState, useRef, useEffect } from 'react';
import type { Finding, AuditRequirement, Attachment } from '../types';
import { FindingStatus } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';

interface FindingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    finding: Finding;
    requirement: AuditRequirement;
    onUpdateFindingStatus: (findingId: string, status: FindingStatus) => void;
    onUpdateFindingDescription: (findingId: string, description: string) => void;
    onAttachFile: (findingId: string, file: File) => void;
    onDeleteAttachment: (findingId: string, attachmentId: string) => void;
    onCreateActionPlan: (findingId: string) => void;
    onGetAIAssistance: (findingDescription: string) => void;
    aiRecommendation: string;
    isGeneratingAIRecommendation: boolean;
    isReadOnly: boolean;
}

const findingStatusClasses: Record<FindingStatus, string> = {
    [FindingStatus.Compliant]: 'bg-green-100 text-green-800 border-green-300 focus:ring-green-500 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    [FindingStatus.NonCompliant]: 'bg-red-100 text-red-800 border-red-300 focus:ring-red-500 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
    [FindingStatus.NotApplicable]: 'bg-gray-100 text-gray-800 border-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const AttachmentChip: React.FC<{ attachment: Attachment; onDelete: () => void; canDelete: boolean; }> = ({ attachment, onDelete, canDelete }) => (
    <div className="bg-gray-200 text-gray-700 text-xs font-medium mr-2 mb-2 pl-2.5 py-1 rounded-full flex items-center dark:bg-gray-700 dark:text-gray-200 transition-colors group">
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a1 1 0 112 0v4a5 5 0 01-10 0V7a5 5 0 0110 0v4a1 1 0 11-2 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
            {attachment.name} ({formatBytes(attachment.size)})
        </a>
        {canDelete && (
            <button 
                onClick={(e) => {
                    e.stopPropagation(); // Prevent modal interactions
                    onDelete();
                }}
                className="ml-1.5 mr-1 p-0.5 rounded-full text-gray-500 hover:bg-red-200 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-800 dark:hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`Excluir anexo ${attachment.name}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        )}
    </div>
);

export const FindingDetailsModal: React.FC<FindingDetailsModalProps> = ({ isOpen, onClose, finding, requirement, onUpdateFindingStatus, onUpdateFindingDescription, onAttachFile, onDeleteAttachment, onCreateActionPlan, onGetAIAssistance, aiRecommendation, isGeneratingAIRecommendation, isReadOnly }) => {
    
    const [description, setDescription] = useState(finding.description);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDescription(finding.description);
    }, [finding.id]);

    if (!isOpen) return null;

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            Array.from(event.target.files).forEach(file => {
                onAttachFile(finding.id, file);
            });
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleCapture = (file: File) => {
        onAttachFile(finding.id, file);
        setIsCameraOpen(false);
    };

    const handleSaveDescription = () => {
        if(isReadOnly) {
            onClose();
            return;
        }
        onUpdateFindingDescription(finding.id, description);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h2 className="text-xl font-bold text-on-surface dark:text-dark-on-surface">Detalhes do Achado</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Requirement Info */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{requirement.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{requirement.description}</p>
                            <div className="mt-3 border-t dark:border-gray-600 pt-3">
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Orientação para Auditoria</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">{requirement.guidance}</p>
                            </div>
                        </div>

                        {/* Auditor's Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição do Achado / Considerações do Auditor</label>
                            <textarea 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={5}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-700"
                                placeholder="Descreva aqui o achado, incluindo detalhes, evidências encontradas e o impacto potencial..."
                                disabled={isReadOnly}
                            ></textarea>
                        </div>

                        {/* Attachments */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Evidências</h4>
                            <div className="flex flex-wrap">
                                {finding.attachments.map(att => <AttachmentChip key={att.id} attachment={att} onDelete={() => onDeleteAttachment(finding.id, att.id)} canDelete={!isReadOnly} />)}
                            </div>
                            {!isReadOnly && (
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm text-primary dark:text-dark-primary font-semibold hover:underline flex items-center">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                        Anexar arquivo
                                    </button>
                                    <button onClick={() => setIsCameraOpen(true)} className="md:hidden mt-2 text-sm text-primary dark:text-dark-primary font-semibold hover:underline flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 4.372A1 1 0 0116 5.05v9.9a1 1 0 01-1.447.894L12 14.118V5.882l2.553-1.51z" /></svg>
                                        Tirar Foto
                                    </button>
                                    <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                </div>
                            )}
                        </div>

                        {/* AI Assistance */}
                        {(aiRecommendation || isGeneratingAIRecommendation) && (
                            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg dark:bg-indigo-900/20 dark:border-indigo-500">
                                <h3 className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center">Assistente IA</h3>
                                {isGeneratingAIRecommendation ? (
                                    <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-300 animate-pulse">Gerando recomendação...</p>
                                ) : (
                                    <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-300 whitespace-pre-wrap">{aiRecommendation}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="finding-status-select" className="text-sm font-medium dark:text-gray-300">Status:</label>
                            <select
                                id="finding-status-select"
                                value={finding.status}
                                onChange={(e) => onUpdateFindingStatus(finding.id, e.target.value as FindingStatus)}
                                className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full transition-colors appearance-none border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 ${findingStatusClasses[finding.status]} disabled:opacity-70 disabled:cursor-not-allowed`}
                                disabled={isReadOnly}
                            >
                                <option value={FindingStatus.Compliant}>Conforme</option>
                                <option value={FindingStatus.NonCompliant}>Não Conforme</option>
                                <option value={FindingStatus.NotApplicable}>Não Aplicável</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            {!isReadOnly && (
                                <button onClick={() => onGetAIAssistance(description)} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                                    Assistência IA
                                </button>
                            )}
                            {finding.status === FindingStatus.NonCompliant && !isReadOnly && (
                                <button onClick={() => onCreateActionPlan(finding.id)} className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                                    Criar Plano de Ação
                                </button>
                            )}
                            <button onClick={handleSaveDescription} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors text-sm">
                                {isReadOnly ? 'Fechar' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <CameraCaptureModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={handleCapture}
            />
        </>
    );
};