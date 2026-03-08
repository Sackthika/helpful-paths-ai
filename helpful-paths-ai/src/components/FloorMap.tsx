import { motion } from "framer-motion";
import { Department, floors } from "@/data/hospitalData";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Navigation, Compass } from "lucide-react";

interface FloorMapProps {
  activeFloor: number;
  highlightDept?: Department | null;
  lang: "en" | "ta";
}

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

export default function FloorMap({ activeFloor, highlightDept, lang }: FloorMapProps) {
  const { latitude, longitude, error } = useGeolocation();
  const floorInfo = floors.find(f => f.floor === activeFloor);
  if (!floorInfo) return null;

  // Real GPS mapping logic (experimental)
  const hasGps = latitude && longitude;

  // Map lat/lng to 0-100 x/y coords
  const getGpsPos = () => {
    if (!latitude || !longitude) return { x: 50, y: activeFloor === 0 ? 92 : 15 };

    // Bounds for simulation/demo (adjust to real hospital bounds)
    const bounds = { n: 13.0827, s: 13.0820, w: 80.2700, e: 80.2710 };
    const px = ((longitude - bounds.w) / (bounds.e - bounds.w)) * 100;
    const py = 100 - ((latitude - bounds.s) / (bounds.n - bounds.s)) * 100;

    // Clamp to map area
    return {
      x: Math.max(5, Math.min(95, px)),
      y: Math.max(10, Math.min(90, py))
    };
  };

  const userPos = getGpsPos();

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {floorInfo.label} • {floorInfo.labelTA}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {hasGps ? (
            <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-bold text-green-600 uppercase">GPS Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-[9px] font-bold text-orange-600 uppercase italic">Simulation Mode</span>
            </div>
          )}
          {latitude && (
            <span className="text-[8px] text-muted-foreground font-mono">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      {/* Radar Overlay (Optional UI) */}
      <div className="absolute top-3 right-3 z-10">
        <div className="w-12 h-12 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden">
          <motion.div
            className="w-full h-full border-r-2 border-primary/40 origin-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <Compass size={14} className="absolute text-primary/40" />
        </div>
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Floor outline */}
        <rect x="2" y="10" width="96" height="80" rx="2" fill="hsl(var(--floor-ground))" stroke="hsl(var(--border))" strokeWidth="0.5" />

        {/* Corridor */}
        <rect x="2" y="45" width="96" height="10" fill="hsl(var(--muted))" opacity="0.3" />
        <text x="50" y="51" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="2.5" opacity="0.6">
          CORRIDOR / நடைபாதை
        </text>

        {/* Blocks */}
        {floorInfo.blocks.map(block => {
          const key = `${activeFloor}-${block}`;
          const pos = blockPositions[key];
          if (!pos) return null;
          return (
            <g key={block}>
              <rect
                x={pos.x} y={pos.y} width={pos.w} height={pos.h}
                rx="1.5"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                opacity="0.2"
              />
              <text x={pos.x + pos.w / 2} y={pos.y + 5} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="3" fontWeight="600">
                Block {block}
              </text>
            </g>
          );
        })}

        {/* Elevator / Stairs */}
        <rect x="46" y="12" width="8" height="6" rx="1" fill="hsl(var(--secondary))" stroke="hsl(var(--primary))" strokeWidth="0.3" />
        <text x="50" y="16" textAnchor="middle" fill="hsl(var(--primary))" fontSize="2">🛗</text>

        {/* Entrance (ground floor only) */}
        {activeFloor === 0 && (
          <g>
            <rect x="40" y="87" width="20" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.1" />
            <text x="50" y="90" textAnchor="middle" fill="hsl(var(--primary))" fontSize="2" fontWeight="600">
              ENTRANCE / நுழைவு
            </text>
          </g>
        )}

        {/* User Location (GPS) */}
        <g>
          <motion.circle
            cx={userPos.x} cy={userPos.y} r="3"
            fill="hsl(var(--primary))" opacity="0.2"
            animate={{ scale: [1, 2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <circle cx={userPos.x} cy={userPos.y} r="1.5" fill="hsl(var(--primary))" stroke="white" strokeWidth="0.4" />
          <motion.path
            d={`M ${userPos.x} ${userPos.y} L ${userPos.x - 2} ${userPos.y - 4} L ${userPos.x + 2} ${userPos.y - 4} Z`}
            fill="hsl(var(--primary))"
            animate={{ y: [-1, 1, -1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <text
            x={userPos.x} y={userPos.y + 6}
            textAnchor="middle"
            fill="hsl(var(--primary))"
            fontSize="1.8"
            fontWeight="bold"
            className="uppercase"
          >
            {lang === 'ta' ? 'நீங்கள் இங்கே' : 'YOU ARE HERE'}
          </text>
        </g>


        {/* Highlighted department & Path */}
        {highlightDept && highlightDept.floor === activeFloor && (
          <g>
            {/* Pulsing marker */}
            <motion.circle
              cx={highlightDept.x} cy={highlightDept.y} r="5"
              fill="hsl(var(--primary))" opacity="0.15"
              animate={{ r: [5, 8, 5], opacity: [0.15, 0.05, 0.15] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
              cx={highlightDept.x} cy={highlightDept.y} r="3"
              fill="hsl(var(--primary))" opacity="0.3"
              animate={{ r: [3, 5, 3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <circle cx={highlightDept.x} cy={highlightDept.y} r="2" fill="hsl(var(--primary))" />
            <circle cx={highlightDept.x} cy={highlightDept.y} r="0.8" fill="hsl(var(--primary-foreground))" />

            {/* Label */}
            <motion.g initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}>
              <rect
                x={highlightDept.x - 15} y={highlightDept.y - 10}
                width="30" height="6" rx="1"
                fill="hsl(var(--primary))"
              />
              <text
                x={highlightDept.x} y={highlightDept.y - 7.5}
                textAnchor="middle" fill="white"
                fontSize="2" fontWeight="600"
              >
                <tspan x={highlightDept.x} dy="0">{highlightDept.name}</tspan>
                <tspan x={highlightDept.x} dy="2.5">{highlightDept.nameTA}</tspan>
              </text>
              <text
                x={highlightDept.x} y={highlightDept.y - 3.5}
                textAnchor="middle" fill="black"
                fontSize="1.8" fontStyle="italic" opacity="0.8"
              >
                Room {highlightDept.room}
              </text>
            </motion.g>

            {/* Path from entrance/elevator */}
            {activeFloor === 0 ? (
              <>
                <motion.path
                  id="path-tracking"
                  d={`M 50 90 L 50 ${highlightDept.y + 5} L ${highlightDept.x} ${highlightDept.y + 5} L ${highlightDept.x} ${highlightDept.y + 2.5}`}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.8"
                  strokeDasharray="2 1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                {/* Moving Dot representing user GPS movement */}
                <motion.circle
                  r="1.2"
                  fill="#E91E63"
                  stroke="white"
                  strokeWidth="0.2"
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ offsetPath: `path('M 50 90 L 50 ${highlightDept.y + 5} L ${highlightDept.x} ${highlightDept.y + 5} L ${highlightDept.x} ${highlightDept.y + 2.5}')` }}
                />
              </>
            ) : (
              <>
                <motion.path
                  id="path-tracking"
                  d={`M 50 18 L 50 ${highlightDept.y + 5} L ${highlightDept.x} ${highlightDept.y + 5} L ${highlightDept.x} ${highlightDept.y + 2.5}`}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.8"
                  strokeDasharray="4 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                {/* Moving Dot representing user GPS movement */}
                <motion.circle
                  r="1.2"
                  fill="#E91E63"
                  stroke="white"
                  strokeWidth="0.2"
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ offsetPath: `path('M 50 18 L 50 ${highlightDept.y + 5} L ${highlightDept.x} ${highlightDept.y + 5} L ${highlightDept.x} ${highlightDept.y + 2.5}')` }}
                />
              </>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
