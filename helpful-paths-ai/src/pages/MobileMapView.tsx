import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, Navigation, ChevronUp, ChevronDown, Info,
    AlertCircle, Compass, Zap, ArrowLeft
} from "lucide-react";
import { Department, HospitalDataset, floors } from "@/data/hospitalData";

// ─── Landmark definitions per floor ────────────────────────────────────────
const LANDMARKS: Record<number, { id: string; label: string; labelTA: string; x: number; y: number; icon: string }[]> = {
    0: [
        { id: "entrance", label: "Main Entrance", labelTA: "முக்கிய நுழைவு", x: 50, y: 90, icon: "🚪" },
        { id: "reception", label: "Reception", labelTA: "வரவேற்பு", x: 50, y: 30, icon: "🏥" },
        { id: "pharmacy", label: "Pharmacy", labelTA: "மருந்தகம்", x: 78, y: 65, icon: "💊" },
        { id: "billing", label: "Billing", labelTA: "கட்டணம்", x: 62, y: 28, icon: "💳" },
        { id: "lab", label: "Lab", labelTA: "ஆய்வகம்", x: 82, y: 38, icon: "🔬" },
        { id: "elevator", label: "Elevator", labelTA: "லிப்ட்", x: 50, y: 18, icon: "🛗" },
    ],
    1: [
        { id: "elevator1", label: "Elevator", labelTA: "லிப்ட்", x: 50, y: 18, icon: "🛗" },
        { id: "cardiology", label: "Cardiology OPD", labelTA: "இதயம்", x: 58, y: 32, icon: "❤️" },
        { id: "ortho", label: "Orthopaedics", labelTA: "எலும்பு", x: 28, y: 48, icon: "🦴" },
        { id: "neurology", label: "Neurology", labelTA: "நரம்பு", x: 82, y: 58, icon: "🧠" },
        { id: "corridor1", label: "Corridor", labelTA: "நடைபாதை", x: 50, y: 50, icon: "⬛" },
    ],
    2: [
        { id: "elevator2", label: "Elevator", labelTA: "லிப்ட்", x: 50, y: 18, icon: "🛗" },
        { id: "icu", label: "ICU", labelTA: "தீவிர சிகிச்சை", x: 22, y: 38, icon: "🚨" },
        { id: "ot", label: "Operation Theatre", labelTA: "அறுவை அரங்கம்", x: 32, y: 55, icon: "🏨" },
        { id: "pediatrics", label: "Paediatrics", labelTA: "குழந்தை நலம்", x: 80, y: 52, icon: "👶" },
        { id: "gynecology", label: "Maternity", labelTA: "மகப்பேறு", x: 58, y: 62, icon: "🤱" },
        { id: "nicu", label: "NICU", labelTA: "புதுப்பிறந்த ICU", x: 82, y: 72, icon: "🍼" },
    ],
    3: [
        { id: "elevator3", label: "Elevator", labelTA: "லிப்ட்", x: 50, y: 18, icon: "🛗" },
        { id: "eye", label: "Eye Clinic", labelTA: "கண்", x: 65, y: 48, icon: "👁️" },
        { id: "dental", label: "Dental", labelTA: "பல்", x: 68, y: 65, icon: "🦷" },
        { id: "physio", label: "Physiotherapy", labelTA: "இயன்முறை", x: 25, y: 68, icon: "🏃" },
        { id: "admin", label: "Admin", labelTA: "நிர்வாகம்", x: 28, y: 22, icon: "🏛️" },
        { id: "oncology", label: "Oncology", labelTA: "புற்றுநோய்", x: 37, y: 48, icon: "🎗️" },
    ],
};

const blockPositions: Record<string, { x: number; y: number; w: number; h: number }> = {
    "0-A": { x: 10, y: 15, w: 35, h: 70 },
    "0-B": { x: 55, y: 15, w: 35, h: 70 },
    "1-A": { x: 5, y: 15, w: 28, h: 70 },
    "1-B": { x: 37, y: 15, w: 28, h: 70 },
    "1-C": { x: 69, y: 15, w: 26, h: 70 },
    "2-A": { x: 5, y: 15, w: 28, h: 70 },
    "2-B": { x: 37, y: 15, w: 28, h: 70 },
    "2-C": { x: 69, y: 15, w: 26, h: 70 },
    "3-A": { x: 10, y: 15, w: 35, h: 70 },
    "3-B": { x: 55, y: 15, w: 35, h: 70 },
};

// Build a path via waypoints (elevator if needed)
function buildPath(dept: Department, viewFloor: number): string {
    const startX = 50;
    const startY = dept.floor === 0 ? 90 : 18; // entrance or elevator

    const mid1X = startX;
    const mid1Y = Math.min(startY, dept.y) - 5 > 15 ? Math.min(startY, dept.y) - 5 : 50;

    return `M ${startX} ${startY} L ${startX} ${dept.y + 5} L ${dept.x} ${dept.y + 5} L ${dept.x} ${dept.y + 2}`;
}

// Steps generation
function buildSteps(dept: Department, lang: "en" | "ta") {
    const steps_en = dept.floor === 0
        ? [
            `Enter through the 🚪 Main Entrance`,
            `Walk straight to Reception (Block ${dept.block})`,
            `Follow signs for "${dept.name}"`,
            `Arrive at Room ${dept.room} — ${dept.name}`,
        ]
        : [
            `Enter through the 🚪 Main Entrance`,
            `Go to the 🛗 Elevator (Centre Corridor)`,
            `Take elevator to Floor ${dept.floor}`,
            `Turn towards Block ${dept.block} (${dept.side})`,
            `Arrive at Room ${dept.room} — ${dept.name}`,
        ];

    const steps_ta = dept.floor === 0
        ? [
            `🚪 முக்கிய நுழைவு வழியாக உள்ளே செல்லுங்கள்`,
            `வரவேற்பு நோக்கி நேராக செல்லுங்கள் (பிளாக் ${dept.block})`,
            `"${dept.nameTA}" பலகையைப் பின்பற்றுங்கள்`,
            `அறை ${dept.room} — ${dept.nameTA} வந்துவிட்டீர்கள்`,
        ]
        : [
            `🚪 முக்கிய நுழைவு வழியாக உள்ளே செல்லுங்கள்`,
            `🛗 லிப்ட் நோக்கி (நடுவழி) செல்லுங்கள்`,
            `தளம் ${dept.floor}க்கு லிப்ட் எடுங்கள்`,
            `பிளாக் ${dept.block} (${dept.sideTA}) பக்கம் திரும்புங்கள்`,
            `அறை ${dept.room} — ${dept.nameTA} வந்துவிட்டீர்கள்`,
        ];

    return lang === "ta" ? steps_ta : steps_en;
}

export default function MobileMapView() {
    const [searchParams] = useSearchParams();
    const deptId = searchParams.get("deptId");
    const roomParam = searchParams.get("room");
    const langParam = (searchParams.get("lang") as "en" | "ta") || "en";

    const [lang, setLang] = useState<"en" | "ta">(langParam);
    const [dept, setDept] = useState<Department | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [viewFloor, setViewFloor] = useState(0);
    const [activeStep, setActiveStep] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [pathDrawn, setPathDrawn] = useState(false);
    const [arrived, setArrived] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [userPos, setUserPos] = useState<{ x: number; y: number } | null>(null);
    const [orientation, setOrientation] = useState(0);
    const lastAccelRef = useRef(0);
    const stepCountRef = useRef(0);

    // Resolve department
    useEffect(() => {
        const all = HospitalDataset.departments;
        let found: Department | undefined;

        if (deptId) {
            found = all.find((d) => d.id === deptId);
        }
        if (!found && roomParam) {
            found = all.find((d) => d.room.toLowerCase() === roomParam.toLowerCase());
        }

        if (found) {
            setDept(found);
            setViewFloor(found.floor === 0 ? 0 : 0); // always start at ground
            // Initialize user at Entrance if on ground floor, else at Elevator
            setUserPos(found.floor === 0 ? { x: 50, y: 90 } : { x: 50, y: 18 });
        } else {
            setNotFound(true);
        }
    }, [deptId, roomParam]);

    // IPS Tracking Logic (Point 3)
    useEffect(() => {
        if (!isTracking) return;

        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.alpha !== null) {
                // Adjust for hospital map orientation if needed (0 is North)
                setOrientation(e.alpha);
            }
        };

        const handleMotion = (e: DeviceMotionEvent) => {
            const accel = e.accelerationIncludingGravity;
            if (!accel) return;

            // Basic step detection using vertical acceleration change
            const totalAccel = Math.sqrt(
                (accel.x || 0) ** 2 + (accel.y || 0) ** 2 + (accel.z || 0) ** 2
            );
            
            const delta = Math.abs(totalAccel - lastAccelRef.current);
            if (delta > 2.5) { // Sensitivity threshold
                stepCountRef.current++;
                lastAccelRef.current = totalAccel;
                
                // Move user dot based on orientation
                // Map coordinates: 0 is North, userPos x/y are percentage
                // We'll simulate a small movement (0.5%) per step
                setUserPos(prev => {
                    if (!prev) return null;
                    const rad = (orientation * Math.PI) / 180;
                    // Note: Browser alpha 0 is North, but map layout might differ.
                    // This is a simplified PDR implementation.
                    const moveX = Math.sin(rad) * 0.8; 
                    const moveY = -Math.cos(rad) * 0.8;
                    
                    return {
                        x: Math.max(5, Math.min(95, prev.x + moveX)),
                        y: Math.max(5, Math.min(95, prev.y + moveY))
                    };
                });
            }
            lastAccelRef.current = totalAccel;
        };

        window.addEventListener("deviceorientation", handleOrientation);
        window.addEventListener("devicemotion", handleMotion);
        
        return () => {
            window.removeEventListener("deviceorientation", handleOrientation);
            window.removeEventListener("devicemotion", handleMotion);
        };
    }, [isTracking, orientation]);

    const toggleTracking = async () => {
        if (isTracking) {
            setIsTracking(false);
            return;
        }

        // Request permissions for iOS 13+
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permission = await (DeviceOrientationEvent as any).requestPermission();
                if (permission === 'granted') {
                    setIsTracking(true);
                }
            } catch (err) {
                console.error("Permission denied for sensors", err);
            }
        } else {
            setIsTracking(true);
        }
    };

    // Auto-advance steps
    useEffect(() => {
        if (!dept) return;
        const steps = buildSteps(dept, lang);
        if (activeStep >= steps.length - 1) {
            setArrived(true);
            return;
        }
        const t = setTimeout(() => setActiveStep((s) => s + 1), 4000);
        return () => clearTimeout(t);
    }, [dept, activeStep, lang]);

    // Show map path after small delay
    useEffect(() => {
        const t = setTimeout(() => setPathDrawn(true), 1200);
        return () => clearTimeout(t);
    }, [dept]);

    const floorInfo = floors.find((f) => f.floor === viewFloor);
    const landmarks = LANDMARKS[viewFloor] || [];
    const onDeptFloor = dept && dept.floor === viewFloor;
    const steps = dept ? buildSteps(dept, lang) : [];
    const pathD = dept && onDeptFloor ? buildPath(dept, viewFloor) : null;

    // ─── NOT FOUND ────────────────────────────────────────────────────────────
    if (notFound) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center gap-4">
                <AlertCircle size={48} className="text-red-400" />
                <h1 className="text-white text-2xl font-bold">Location Not Found</h1>
                <p className="text-gray-400">The QR code destination could not be resolved.</p>
                <p className="text-gray-500 text-sm">Please scan a valid ward or department QR code.</p>
            </div>
        );
    }

    // ─── LOADING ──────────────────────────────────────────────────────────────
    if (!dept) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-14 h-14 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
                />
                <p className="text-white font-semibold">Loading Navigation...</p>
                <p className="text-gray-500 text-xs">Loading • ஏற்றுகிறது</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col overflow-hidden font-sans">

            {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
            <div className="bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    H+
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-white font-bold text-sm leading-tight truncate">
                        {lang === "ta" ? "மருத்துவமனை வழிகாட்டி" : "Hospital Navigator"}
                    </h1>
                    <p className="text-indigo-400 text-[10px] font-semibold truncate">QR Navigation • QR வழிசெலுத்தல்</p>
                </div>
                {/* Language toggle */}
                <button
                    onClick={() => setLang(l => l === "en" ? "ta" : "en")}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold border border-white/10"
                >
                    {lang === "en" ? "த" : "EN"}
                </button>
            </div>

            {/* ── DESTINATION BANNER ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 px-4 py-3 flex items-center gap-3"
            >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">
                        {lang === "ta" ? "இலக்கு" : "Destination"}
                    </p>
                    <h2 className="text-white font-black text-base leading-tight truncate">
                        {lang === "ta" ? dept.nameTA : dept.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] text-white font-bold">
                            Room {dept.room}
                        </span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] text-white font-bold">
                            {dept.floor === 0 ? (lang === "ta" ? "தரை தளம்" : "Ground Floor") : `Floor ${dept.floor}`}
                        </span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] text-white font-bold">
                            Block {dept.block}
                        </span>
                    </div>
                </div>
                <button onClick={() => setShowInfo(!showInfo)} className="text-white/70">
                    <Info size={20} />
                </button>
            </motion.div>

            {/* ── ARRIVED BANNER ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {arrived && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="bg-green-600 px-4 py-2 flex items-center gap-2"
                    >
                        <Zap size={16} className="text-white" />
                        <p className="text-white font-bold text-sm">
                            {lang === "ta" ? "🎉 இலக்கை அடைந்துவிட்டீர்கள்!" : "🎉 You have arrived at your destination!"}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── FLOOR SELECTOR ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                    <Compass size={14} className="text-indigo-400" />
                    <span className="text-gray-400 text-xs font-medium">
                        {floorInfo?.label} • {floorInfo?.labelTA}
                    </span>
                    {onDeptFloor && (
                        <span className="ml-1 text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full font-bold">
                            {lang === "ta" ? "இலக்கு தளம்" : "Dest. Floor"}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleTracking}
                        className={`mr-2 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold transition-all ${
                            isTracking ? "bg-red-500 text-white animate-pulse" : "bg-indigo-600/30 text-indigo-400 border border-indigo-500/20"
                        }`}
                    >
                        <Zap size={14} />
                        {isTracking ? (lang === "ta" ? "நேரடி கண்காணிப்பு" : "LIVE IPS") : (lang === "ta" ? "IPS இயக்கவும்" : "ENABLE IPS")}
                    </button>
                    {floors.map(f => (
                        <button
                            key={f.floor}
                            onClick={() => setViewFloor(f.floor)}
                            className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${viewFloor === f.floor
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40"
                                    : "bg-white/10 text-gray-400"
                                } ${dept.floor === f.floor ? "ring-1 ring-yellow-400 ring-offset-1 ring-offset-gray-900" : ""}`}
                        >
                            {f.floor === 0 ? "G" : f.floor}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── MAP ─────────────────────────────────────────────────────────────── */}
            <div className="flex-1 relative overflow-hidden bg-gray-950" style={{ minHeight: "300px" }}>
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">

                    {/* Floor background */}
                    <rect x="2" y="10" width="96" height="80" rx="2" fill="#1e2433" stroke="#2d3748" strokeWidth="0.5" />

                    {/* Corridor */}
                    <rect x="2" y="45" width="96" height="10" fill="#374151" opacity="0.4" />
                    <text x="50" y="51" textAnchor="middle" fill="#6b7280" fontSize="2.5" opacity="0.8">
                        {lang === "ta" ? "நடைபாதை" : "CORRIDOR"}
                    </text>

                    {/* Blocks */}
                    {floorInfo?.blocks.map(block => {
                        const key = `${viewFloor}-${block}`;
                        const pos = blockPositions[key];
                        if (!pos) return null;
                        return (
                            <g key={block}>
                                <rect
                                    x={pos.x} y={pos.y} width={pos.w} height={pos.h}
                                    rx="2" fill="#1f2d44" stroke="#3b4a6b" strokeWidth="0.4" opacity="0.7"
                                />
                                <text x={pos.x + pos.w / 2} y={pos.y + 5} textAnchor="middle" fill="#4b6a9c" fontSize="3" fontWeight="700">
                                    Block {block}
                                </text>
                            </g>
                        );
                    })}

                    {/* Elevator */}
                    <rect x="46" y="12" width="8" height="6" rx="1" fill="#1f2d44" stroke="#6366f1" strokeWidth="0.4" />
                    <text x="50" y="16" textAnchor="middle" fill="#a5b4fc" fontSize="2.2" fontWeight="bold">🛗</text>

                    {/* Entrance (Ground floor) */}
                    {viewFloor === 0 && (
                        <g>
                            <rect x="40" y="87" width="20" height="5" rx="1" fill="#6366f1" opacity="0.15" />
                            <text x="50" y="91" textAnchor="middle" fill="#818cf8" fontSize="2.2" fontWeight="700">
                                {lang === "ta" ? "நுழைவு 🚪" : "ENTRANCE 🚪"}
                            </text>
                        </g>
                    )}

                    {/* ── LANDMARKS ─────────────────────────────────────────────────── */}
                    {landmarks
                        .filter(lm => !(onDeptFloor && lm.x === dept.x && lm.y === dept.y))
                        .map(lm => (
                            <g key={lm.id}>
                                <circle cx={lm.x} cy={lm.y} r="2.5" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="0.3" opacity="0.8" />
                                <text x={lm.x} y={lm.y + 0.8} textAnchor="middle" fontSize="2.2" dominantBaseline="middle">{lm.icon}</text>
                                <text x={lm.x} y={lm.y + 5} textAnchor="middle" fill="#60a5fa" fontSize="1.8" dominantBaseline="middle" fontWeight="600">
                                    {lang === "ta" ? lm.labelTA : lm.label}
                                </text>
                            </g>
                        ))}

                    {/* ── YOU ARE HERE (IPS Dot) ─────────────────────── */}
                    {userPos && (
                        <g transform={`rotate(${orientation}, ${userPos.x}, ${userPos.y})`}>
                            {/* Halo */}
                            <motion.circle 
                                cx={userPos.x} cy={userPos.y} r="3.5" 
                                fill="#6366f1" opacity="0.15"
                                animate={{ r: [3.5, 6, 3.5], opacity: [0.15, 0.05, 0.15] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            {/* Directional Indicator */}
                            <path 
                                d={`M ${userPos.x} ${userPos.y - 4} L ${userPos.x - 2.5} ${userPos.y + 1} L ${userPos.x + 2.5} ${userPos.y + 1} Z`} 
                                fill="#6366f1" 
                                stroke="white" 
                                strokeWidth="0.3"
                            />
                            {/* Main Dot */}
                            <circle cx={userPos.x} cy={userPos.y} r="1.8" fill="#6366f1" stroke="white" strokeWidth="0.4" />
                        </g>
                    )}

                    {!userPos && viewFloor === 0 ? (
                        <g>
                            <motion.circle cx={50} cy={90} r="3" fill="#6366f1" opacity="0.2"
                                animate={{ r: [3, 5, 3], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <circle cx={50} cy={90} r="1.8" fill="#6366f1" stroke="white" strokeWidth="0.4" />
                            <text x={50} y={85} textAnchor="middle" fill="#a5b4fc" fontSize="1.8" fontWeight="bold">
                                {lang === "ta" ? "நீங்கள் இங்கே" : "YOU ARE HERE"}
                            </text>
                        </g>
                    ) : !userPos && viewFloor < (dept?.floor ?? 0) ? (
                        <g>
                            <motion.circle cx={50} cy={18} r="3" fill="#6366f1" opacity="0.2"
                                animate={{ r: [3, 5, 3], opacity: [0.3, 0.1, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <circle cx={50} cy={18} r="1.8" fill="#6366f1" stroke="white" strokeWidth="0.4" />
                            <text x={50} y={23} textAnchor="middle" fill="#a5b4fc" fontSize="1.8" fontWeight="bold">
                                {lang === "ta" ? "நீங்கள் இங்கே" : "YOU ARE HERE"}
                            </text>
                        </g>
                    ) : null}

                    {/* ── ROUTE PATH (same floor as dept) ───────────────────────────── */}
                    {onDeptFloor && pathD && pathDrawn && (
                        <>
                            {/* Shadow/glow path */}
                            <motion.path
                                d={pathD}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={0.2}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2.5, ease: "easeInOut" }}
                            />
                            {/* Main dashed path */}
                            <motion.path
                                d={pathD}
                                fill="none"
                                stroke="#818cf8"
                                strokeWidth="0.8"
                                strokeDasharray="3 1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2.5, ease: "easeInOut" }}
                            />
                            {/* Moving traveller dot */}
                            <motion.circle
                                r="1.5"
                                fill="#e879f9"
                                stroke="white"
                                strokeWidth="0.3"
                                animate={{ offsetDistance: ["0%", "100%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2.5 }}
                                style={{ offsetPath: `path('${pathD}')` }}
                            />
                        </>
                    )}

                    {/* ── DESTINATION MARKER ────────────────────────────────────────── */}
                    {onDeptFloor && (
                        <g>
                            {/* Pulsing glow */}
                            <motion.circle
                                cx={dept.x} cy={dept.y} r="5"
                                fill="#6366f1" opacity="0.15"
                                animate={{ r: [5, 9, 5], opacity: [0.2, 0.05, 0.2] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <circle cx={dept.x} cy={dept.y} r="3" fill="#6366f1" opacity="0.4" />
                            <circle cx={dept.x} cy={dept.y} r="2" fill="#818cf8" />
                            <circle cx={dept.x} cy={dept.y} r="0.8" fill="white" />

                            {/* Label bubble */}
                            <motion.g initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                <rect
                                    x={dept.x - 18} y={dept.y - 13}
                                    width="36" height="8" rx="1.5"
                                    fill="#6366f1"
                                />
                                <text x={dept.x} y={dept.y - 9.5} textAnchor="middle" fill="white" fontSize="2" fontWeight="700">
                                    {dept.name}
                                </text>
                                <text x={dept.x} y={dept.y - 7} textAnchor="middle" fill="white" fontSize="1.7" opacity="0.85">
                                    {dept.nameTA}
                                </text>
                            </motion.g>
                            <text x={dept.x} y={dept.y + 5.5} textAnchor="middle" fill="#a5b4fc" fontSize="1.8" fontWeight="700">
                                Room {dept.room}
                            </text>
                        </g>
                    )}

                    {/* ── CROSS-FLOOR indicator ─────────────────────────────────────── */}
                    {!onDeptFloor && dept && (
                        <g>
                            <rect x="25" y="38" width="50" height="24" rx="2" fill="#1f2d44" stroke="#6366f1" strokeWidth="0.5" opacity="0.9" />
                            <text x="50" y="46" textAnchor="middle" fill="#a5b4fc" fontSize="3" fontWeight="900">🛗</text>
                            <text x="50" y="53" textAnchor="middle" fill="white" fontSize="2.5" fontWeight="700">
                                {lang === "ta" ? `தளம் ${dept.floor}க்கு செல்லுங்கள்` : `Go to Floor ${dept.floor}`}
                            </text>
                            <text x="50" y="57.5" textAnchor="middle" fill="#818cf8" fontSize="2">
                                {lang === "ta" ? `இலக்கு: ${dept.nameTA}` : `Dest: ${dept.name}`}
                            </text>
                        </g>
                    )}
                </svg>

                {/* Map legend pill */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-gray-900/90 border border-white/10 rounded-full px-3 py-1.5">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] text-gray-400">{lang === "ta" ? "நீங்கள்" : "You"}</span>
                    </div>
                    <div className="w-px h-3 bg-white/20" />
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-0.5 bg-purple-400" style={{ borderRadius: 1, background: "repeating-linear-gradient(90deg,#818cf8 0,#818cf8 4px,transparent 4px,transparent 7px)" }} />
                        <span className="text-[10px] text-gray-400">{lang === "ta" ? "வழி" : "Route"}</span>
                    </div>
                    <div className="w-px h-3 bg-white/20" />
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                        <span className="text-[10px] text-gray-400">{lang === "ta" ? "இலக்கு" : "Dest"}</span>
                    </div>
                </div>
            </div>

            {/* ── STEP-BY-STEP NAVIGATION ─────────────────────────────────────────── */}
            <div className="bg-gray-900 border-t border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                    <Navigation size={14} className="text-indigo-400" />
                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        {lang === "ta" ? "படி-படி வழிகாட்டல்" : "Step-by-Step Directions"}
                    </span>
                    <div className="flex-1" />
                    <span className="text-gray-500 text-[10px]">
                        {activeStep + 1}/{steps.length}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Steps */}
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: i <= activeStep ? 1 : 0.35, x: 0 }}
                            className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${i === activeStep
                                    ? "bg-indigo-600/20 border border-indigo-500/30"
                                    : i < activeStep
                                        ? "opacity-60"
                                        : ""
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black ${i < activeStep
                                    ? "bg-green-500 text-white"
                                    : i === activeStep
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white/10 text-gray-500"
                                }`}>
                                {i < activeStep ? "✓" : i + 1}
                            </div>
                            <p className={`text-sm leading-snug ${i === activeStep ? "text-white font-semibold" : "text-gray-400"}`}>
                                {step}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
            <div className="bg-gray-950 px-4 py-2 flex items-center justify-between border-t border-white/5">
                <p className="text-[10px] text-gray-600">© City General Hospital • நகர பொது மருத்துவமனை</p>
                <p className="text-[10px] text-gray-600">📞 108 · Emergency</p>
            </div>

            {/* ── INFO MODAL ─────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-end"
                        onClick={() => setShowInfo(false)}
                    >
                        <motion.div
                            initial={{ y: 200 }}
                            animate={{ y: 0 }}
                            exit={{ y: 200 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full bg-gray-900 border-t border-white/10 rounded-t-3xl p-6 space-y-3"
                        >
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                            <h3 className="text-white font-black text-xl">{dept.name}</h3>
                            <p className="text-purple-400 font-bold">{dept.nameTA}</p>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {[
                                    { label: "Room / அறை", value: dept.room },
                                    { label: "Floor / தளம்", value: dept.floor === 0 ? "Ground" : `Floor ${dept.floor}` },
                                    { label: "Block / பிளாக்", value: `Block ${dept.block}` },
                                    { label: "Side / பக்கம்", value: dept.side },
                                    { label: "Type / வகை", value: dept.category },
                                    { label: "Wait / காத்திருப்பு", value: `${dept.waitTime ?? 0} min` },
                                ].map(item => (
                                    <div key={item.label} className="bg-white/5 rounded-xl p-3">
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{item.label}</p>
                                        <p className="text-white font-bold mt-1">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowInfo(false)}
                                className="w-full mt-4 bg-indigo-600 text-white font-black py-3 rounded-xl"
                            >
                                {lang === "ta" ? "மூடுக" : "Close"}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
