
import React from 'react';

interface MeetingConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    invitationDetails: { content: string; filename: string; mailtoUrl: string } | null;
}

export const MeetingConfirmationModal: React.FC<MeetingConfirmationModalProps> = ({ isOpen, onClose, invitationDetails }) => {
    if (!isOpen || !invitationDetails) return null;

    const handleSendInvitation = () => {
        // 1. Trigger the download
        const blob = new Blob([invitationDetails.content], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', invitationDetails.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 2. Open the email client
        window.location.href = invitationDetails.mailtoUrl;

        // 3. Close the modal after a short delay to allow the actions to trigger
        setTimeout(() => {
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-lg m-4 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                     <svg className="h-6 w-6 text-green-600 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold my-3 dark:text-white">Reunião Agendada!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">O próximo passo é enviar o convite por e-mail.</p>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-md text-sm text-left mb-6">
                    <p className="font-semibold">Como funciona:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                        <li>Ao clicar no botão abaixo, o arquivo do convite (.ics) será <strong>baixado</strong>.</li>
                        <li>Seu programa de e-mail padrão será <strong>aberto</strong> com um rascunho.</li>
                        <li><strong>Anexe o arquivo baixado</strong> a este e-mail antes de enviá-lo.</li>
                    </ol>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                     <button 
                        onClick={onClose} 
                        className="w-full sm:w-auto bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors order-2 sm:order-1"
                    >
                        Fechar
                    </button>
                    <button 
                        onClick={handleSendInvitation}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors order-1 sm:order-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Enviar Convite por E-mail
                    </button>
                </div>
            </div>
        </div>
    );
};
