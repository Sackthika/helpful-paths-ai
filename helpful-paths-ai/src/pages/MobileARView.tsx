import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, X, Navigation, Info, User, Camera } from 'lucide-react';

const MobileARView = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const deptId = searchParams.get('deptId');

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Could not access camera. Simulation mode active.');
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

    // Mock AR Labels based on hallway positions
    const arMarkers = [
        { id: 1, label: 'X-ray room', time: '7:00 am - 7:00 pm', top: '35%', left: '72%', icon: <Info size={14} /> },
        { id: 2, label: 'Dr. Smith', time: '9:00 am - 4:00 pm', top: '15%', left: '85%', icon: <User size={14} />, status: 'online' },
        { id: 3, label: 'Restrooms', time: 'Available', top: '45%', left: '55%', icon: <Navigation size={14} /> },
    ];

    return (
        <div className="fixed inset-0 bg-black overflow-hidden font-sans select-none">
            {/* Camera Background */}
            <div className="absolute inset-0 z-0">
                {stream ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-muted-foreground p-12 text-center text-sm italic">
                        {error || "Initializing AR Engine..."}
                    </div>
                )}
            </div>

            {/* Perspective Floor Grid (Teal) */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] z-10 pointer-events-none overflow-hidden opacity-40">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(20, 184, 166, 0.3) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(20, 184, 166, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        transform: 'perspective(500px) rotateX(65deg) scale(2)',
                        transformOrigin: 'bottom'
                    }}
                />
                {/* Horizontal pulses */}
                <motion.div
                    animate={{ y: ['100%', '-100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-teal-400/20 to-transparent h-20"
                    style={{ transform: 'perspective(500px) rotateX(65deg)', transformOrigin: 'bottom' }}
                />
            </div>

            {/* Floating 3D Arrows */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <div className="relative w-full h-full">
                    {/* Central Arrow Path */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8, x: 100 }}
                                animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.2, 0.8], x: [-100, 0, 50, 150] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeInOut"
                                }}
                                className="text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.8)]"
                            >
                                <ChevronRight size={120} strokeWidth={4} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Smaller perspective arrows in distance */}
                    <div className="absolute top-[48%] left-[48%] flex gap-2 scale-50 opacity-40">
                        {[0, 1].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ x: [-20, 20], opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 1 }}
                                className="text-teal-400"
                            >
                                <ChevronRight size={40} strokeWidth={4} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AR Markers */}
            <div className="absolute inset-0 z-30 pointer-events-none">
                {arMarkers.map((marker) => (
                    <motion.div
                        key={marker.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute flex flex-col items-center gap-2"
                        style={{ top: marker.top, left: marker.left }}
                    >
                        {/* The Label Card */}
                        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-2xl border border-white/20 flex items-start gap-3 min-w-[140px]">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                {marker.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[11px] font-black text-gray-900 leading-none">{marker.label}</p>
                                    {marker.status === 'online' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                </div>
                                <p className="text-[9px] font-bold text-gray-500 mt-0.5">{marker.time}</p>
                            </div>
                        </div>
                        {/* The Dot & Line Connector */}
                        <div className="w-3 h-3 rounded-full bg-white border-2 border-primary shadow-[0_0_10px_white]" />
                        <div className="w-px h-12 bg-gradient-to-t from-white/0 via-white/50 to-white/0" />
                    </motion.div>
                ))}
            </div>

            {/* HUD Overlays */}
            <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-6">
                {/* Top Bar */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white"
                    >
                        <X size={24} />
                    </button>

                    <div className="bg-teal-500 p-3 rounded-2xl shadow-xl shadow-teal-500/20 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Navigation size={18} className="animate-bounce" />
                        Live Navigation
                    </div>
                </div>

                {/* Bottom Bar / Mini Map Area */}
                <div className="flex items-end justify-between">
                    <div className="bg-black/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 w-48 pointer-events-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Target Dept</p>
                        </div>
                        <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight">
                            {deptId?.toUpperCase() || "CARDIOLOGY"}
                        </h3>
                        <div className="mt-2 text-[10px] font-bold text-teal-400 uppercase">
                            Room: 104 • Level 1
                        </div>
                    </div>

                    <div className="w-32 h-32 bg-black/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden relative pointer-events-auto">
                        {/* Mock Mini Map */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 border border-white/10 rounded-lg relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-t-2 border-teal-500/30 rounded-full"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_#2dd4bf]" />
                            </div>
                        </div>
                        <div className="absolute bottom-2 inset-x-0 text-center text-[8px] font-black text-white/40 uppercase">Floor Map</div>
                    </div>
                </div>
            </div>

            {/* AI HUD Scanlines */}
            <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
    );
};

export default MobileARView;
