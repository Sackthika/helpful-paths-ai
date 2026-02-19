import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, X, Navigation, Info, User, Camera, Activity } from 'lucide-react';

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
    const [targetDept, setTargetDept] = useState<any>(null);
    const [distance, setDistance] = useState(45); // Mock meters

    useEffect(() => {
        if (deptId) {
            // Find dept from dataset
            import('@/data/hospitalData').then(({ HospitalDataset }) => {
                const dept = HospitalDataset.departments.find((d: any) => d.id === deptId);
                if (dept) setTargetDept(dept);
            });
        }
    }, [deptId]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDistance(prev => Math.max(2, prev - Math.random() * 2));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const arMarkers = [
        { id: 1, label: targetDept?.name || 'Target Ward', time: 'Arriving soon', top: '35%', left: '42%', icon: <MapPin size={14} />, primary: true },
        { id: 2, label: 'Pharmacy', time: '9:00 am - 9:00 pm', top: '15%', left: '85%', icon: <Info size={14} /> },
        { id: 3, label: 'Emergency', time: '24/7', top: '45%', left: '15%', icon: <Activity size={14} /> },
    ];

    // Rest of the code...
    return (
        <div className="fixed inset-0 bg-black overflow-hidden font-sans select-none">
            {/* ... previous camera background ... */}
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

            {/* GPS Tracking HUD */}
            <div className="absolute top-24 left-6 z-50">
                <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-1">GPS Tracking</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">{Math.round(distance)}</span>
                        <span className="text-xs font-bold text-white/60">meters</span>
                    </div>
                </div>
            </div>

            {/* Floating Navigation Arrows */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-12">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-1 h-32 bg-gradient-to-t from-teal-400 to-transparent" />
                        <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center shadow-[0_0_20px_#2dd4bf]">
                            <Navigation className="text-black rotate-45" size={24} fill="black" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ... HUD Bottom area ... */}
            <div className="absolute inset-x-0 bottom-10 z-40 px-6">
                <div className="flex items-end justify-between">
                    <div className="bg-black/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 w-56">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Destination</p>
                        </div>
                        <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight truncate">
                            {targetDept?.name || "SEARCHING..."}
                        </h3>
                        <p className="text-xs font-bold text-[#E91E63] mt-1">{targetDept?.nameTA}</p>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="bg-white/10 px-2 py-1 rounded-md text-[10px] text-white/70 font-bold uppercase">Room {targetDept?.room}</div>
                            <div className="bg-white/10 px-2 py-1 rounded-md text-[10px] text-white/70 font-bold uppercase">Level {targetDept?.floor}</div>
                        </div>
                    </div>

                    <div className="w-28 h-28 bg-black/40 backdrop-blur-md rounded-full border border-teal-500/30 overflow-hidden relative p-1 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
                        {/* Radar Simulation */}
                        <div className="absolute inset-0 bg-black" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-t-2 border-teal-500/40 rounded-full"
                            style={{ background: 'conic-gradient(from 0deg, rgba(45,212,191,0.1) 0%, transparent 10%)' }}
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
                        <motion.div
                            animate={{ scale: [1, 2, 1], opacity: [0.5, 0.1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border border-teal-500/10"
                        />
                    </div>
                </div>
            </div>


            {/* AI HUD Scanlines */}
            <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-8 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
            >
                <X size={24} />
            </button>

            {/* AR Markers */}
            <AnimatePresence>
                {arMarkers.map((marker) => (
                    <motion.div
                        key={marker.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute z-30 pointer-events-none shadow-2xl"
                        style={{ top: marker.top, left: marker.left }}
                    >
                        <div className={`flex flex-col items-center ${marker.primary ? 'scale-125' : 'opacity-60'}`}>
                            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2 mb-2">
                                <div className={`${marker.primary ? 'text-teal-400' : 'text-white/60'}`}>
                                    {marker.icon}
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-white/90 uppercase tracking-tighter leading-none">{marker.label}</p>
                                    <p className="text-[7px] font-bold text-white/50 leading-none mt-0.5">{marker.time}</p>
                                </div>
                            </div>
                            <div className={`w-1 h-8 bg-gradient-to-t from-white/20 to-transparent`} />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default MobileARView;
