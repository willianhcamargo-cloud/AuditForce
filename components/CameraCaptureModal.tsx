import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CameraCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            const startCamera = async () => {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: 'environment' } // Prioritize back camera
                    });
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } catch (err) {
                    console.error("Erro ao acessar a câmera:", err);
                    setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
                }
            };
            startCamera();
        } else {
            stopStream();
        }

        // Cleanup function
        return () => {
            stopStream();
        };
    }, [isOpen, stopStream]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const fileName = `captura-${new Date().toISOString()}.jpg`;
                    const file = new File([blob], fileName, { type: 'image/jpeg' });
                    onCapture(file);
                }
            }, 'image/jpeg', 0.9);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center text-white">
            <div className="relative w-full h-full">
                {error ? (
                    <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-gray-900">
                        <p className="text-red-400 text-center">{error}</p>
                         <button onClick={onClose} className="mt-4 bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">
                            Fechar
                        </button>
                    </div>
                ) : (
                    <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>

                        {/* Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 flex justify-center items-center">
                             <button onClick={onClose} className="absolute left-4 text-sm bg-gray-700 bg-opacity-70 px-4 py-2 rounded-lg">
                                Cancelar
                            </button>
                            <button onClick={handleCapture} className="w-16 h-16 rounded-full bg-white flex items-center justify-center ring-4 ring-gray-400" aria-label="Capturar foto">
                                <div className="w-14 h-14 rounded-full bg-white border-2 border-black"></div>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};