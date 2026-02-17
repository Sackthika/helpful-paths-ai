import { motion } from "framer-motion";
import { Heart, Brain, Baby, Eye, Siren, FlaskConical, Pill, Stethoscope } from "lucide-react";

interface QuickButtonsProps {
  onSelect: (query: string) => void;
  lang: "en" | "ta";
}

const quickItems = [
  { icon: Siren, labelEN: "Emergency", labelTA: "அவசரம்", query: "emergency" },
  { icon: Heart, labelEN: "Cardiology", labelTA: "இதயம்", query: "cardiology" },
  { icon: Brain, labelEN: "Neurology", labelTA: "நரம்பு", query: "neurology" },
  { icon: Baby, labelEN: "Pediatrics", labelTA: "குழந்தை", query: "pediatrics" },
  { icon: Eye, labelEN: "Eye", labelTA: "கண்", query: "ophthalmology" },
  { icon: FlaskConical, labelEN: "Lab", labelTA: "ஆய்வகம்", query: "laboratory" },
  { icon: Pill, labelEN: "Pharmacy", labelTA: "மருந்து", query: "pharmacy" },
  { icon: Stethoscope, labelEN: "ICU", labelTA: "ICU", query: "icu" },
];

export default function QuickButtons({ onSelect, lang }: QuickButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {quickItems.map((item, i) => (
        <motion.button
          key={item.query}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(item.query)}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary hover:bg-kiosk-surface-hover transition-colors group active:scale-95"
        >
          <item.icon size={28} className="text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
            {lang === "ta" ? item.labelTA : item.labelEN}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
