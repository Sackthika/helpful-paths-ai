import { floors } from "@/data/hospitalData";
import { motion } from "framer-motion";

interface FloorSelectorProps {
  activeFloor: number;
  onSelect: (floor: number) => void;
  lang: "en" | "ta";
}

export default function FloorSelector({ activeFloor, onSelect, lang }: FloorSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {floors.map(f => (
        <button
          key={f.floor}
          onClick={() => onSelect(f.floor)}
          className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeFloor === f.floor
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          {activeFloor === f.floor && (
            <motion.div
              layoutId="activeFloor"
              className="absolute inset-0 bg-primary rounded-md"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">
            {f.floor === 0 ? (lang === "ta" ? "G" : "G") : `F${f.floor}`}
          </span>
        </button>
      ))}
    </div>
  );
}
