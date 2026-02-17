import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  isListening: boolean;
  onToggle: () => void;
  lang: "en" | "ta";
}

export default function VoiceButton({ isListening, onToggle, lang }: VoiceButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {isListening && (
        <>
          <motion.div
            className="absolute w-14 h-14 rounded-full bg-voice-pulse"
            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-14 h-14 rounded-full bg-voice-pulse"
            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}
      <button
        onClick={onToggle}
        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? "bg-voice-active text-foreground glow-primary scale-110"
            : "bg-secondary text-muted-foreground hover:bg-kiosk-surface-hover hover:text-foreground"
        }`}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        title={lang === "ta" ? (isListening ? "நிறுத்து" : "பேசுங்கள்") : (isListening ? "Stop" : "Speak")}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
    </div>
  );
}
