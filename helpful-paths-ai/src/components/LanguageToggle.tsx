import { motion } from "framer-motion";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  lang: "en" | "ta";
  onToggle: () => void;
}

export default function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-kiosk-surface-hover transition-colors text-sm font-medium"
    >
      <Globe size={16} />
      <motion.span
        key={lang}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-w-[48px] text-center"
      >
        {lang === "en" ? "English" : "தமிழ்"}
      </motion.span>
    </button>
  );
}
