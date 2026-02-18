import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraAssistantProps {
    onDetected: (text: string) => void;
    onClose: () => void;
    lang: 'en' | 'ta';
}

const CameraAssistant: React.FC<CameraAssistantProps> = ({ onDetected, onClose, lang }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError(lang === 'ta' ? 'கேமராவை அணுக முடியவில்லை.' : 'Could not access camera.');
        }
    };

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureAndProcess = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;

        setIsProcessing(true);
        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        // Draw video frame to canvas
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        try {
            const { data: { text } } = await Tesseract.recognize(
                canvasRef.current,
                'eng',
                { logger: m => console.log(m) }
            );

            // Clean text to find numbers (ward numbers)
            const matches = text.match(/\d+/g);
            if (matches && matches.length > 0) {
                onDetected(matches[0]);
            } else {
                // If no direct number, maybe it's a department name? 
                // For simplicity, let's pass the first line of text
                const firstLine = text.split('\n')[0].trim();
                if (firstLine.length > 2) {
                    onDetected(firstLine);
                }
            }
        } catch (err) {
            console.error('OCR Error:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, onDetected]);

    // Auto-process every 3 seconds while active
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isProcessing) captureAndProcess();
        }, 3000);
        return () => clearInterval(interval);
    }, [isProcessing, captureAndProcess]);

    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera className="text-primary" />
                        <h2 className="font-bold">
                            {lang === 'ta' ? 'வழியைக் காட்ட கேமராவில் வார்டு எண்ணைக் காண்பிக்கவும்' : 'Show Ward Number to Camera'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative aspect-video bg-black">
                    {error ? (
                        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-destructive">
                            {error}
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 border-2 border-primary/50 m-12 rounded-lg pointer-events-none">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                            </div>
                        </>
                    )}

                    {isProcessing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <RefreshCw className="text-white" size={32} />
                            </motion.div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-muted/30">
                    <p className="text-sm text-center text-muted-foreground">
                        {lang === 'ta'
                            ? 'உங்கள் வார்டு அட்டையை அல்லது எண்ணை கேமராவின் முன் தெளிவாக நிலைநிறுத்தவும்.'
                            : 'Position your ward card or number clearly in front of the camera.'}
                    </p>
                    <button
                        onClick={captureAndProcess}
                        disabled={isProcessing || !!error}
                        className="w-full mt-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {lang === 'ta' ? 'இப்போதே ஸ்கேன் செய்' : 'Scan Now'}
                    </button>
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </motion.div>
        </div>
    );
};

export default CameraAssistant;
