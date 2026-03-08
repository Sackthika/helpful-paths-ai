import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, MapPin } from 'lucide-react';
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

            // 1. Check for URL patterns (QR IPS Tracking)
            if (text.includes('/navigate?') || text.includes('http')) {
                onDetected(text.trim());
                return;
            }

            // 2. Clean text to find numbers (ward numbers)
            const matches = text.match(/\d+/g);
            if (matches && matches.length > 0) {
                onDetected(matches[0]);
            } else {
                // If no direct number, maybe it's a department name? 
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
                <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <Camera size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-foreground">
                                {lang === 'ta' ? 'IPS QR ஸ்கேனர்' : 'IPS QR Scanner'}
                            </h2>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                Indoor Positioning System
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 hover:bg-muted rounded-full transition-colors flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative aspect-square bg-black overflow-hidden">
                    {error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
                                <X size={32} />
                            </div>
                            <p className="font-bold text-destructive">{error}</p>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover opacity-70"
                            />

                            {/* Scanning UI Grid */}
                            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
                                {Array.from({ length: 16 }).map((_, i) => (
                                    <div key={i} className="border-[0.5px] border-white/30" />
                                ))}
                            </div>

                            {/* Scanning Bracket */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-64 border-2 border-primary/30 rounded-3xl relative">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary -translate-x-1 -translate-y-1 rounded-tl-xl" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary translate-x-1 -translate-y-1 rounded-tr-xl" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary -translate-x-1 translate-y-1 rounded-bl-xl" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary translate-x-1 translate-y-1 rounded-br-xl" />

                                    {/* Scanning Line */}
                                    <motion.div
                                        className="absolute top-0 left-0 right-0 h-1 bg-primary/50 shadow-[0_0_15px_rgba(233,30,99,0.8)]"
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {isProcessing && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
                            />
                            <p className="text-white font-bold text-xs uppercase tracking-[0.2em] animate-pulse">
                                Analyzing IPS Data...
                            </p>
                        </div>
                    )}

                    {/* AR Markers (Point 8) */}
                    <AnimatePresence>
                        {!isProcessing && !error && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute top-1/4 left-1/4 p-2 bg-blue-600/80 backdrop-blur-md rounded-lg text-white text-[10px] font-bold border border-blue-400/50 flex items-center gap-1 shadow-xl z-10"
                                >
                                    <MapPin size={10} /> ENT DEPT [106]
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="absolute bottom-1/3 right-1/4 p-2 bg-green-600/80 backdrop-blur-md rounded-lg text-white text-[10px] font-bold border border-green-400/50 flex items-center gap-1 shadow-xl z-10"
                                >
                                    <MapPin size={10} /> PHARMACY [G10]
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
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
