import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, Volume2 } from "lucide-react";
import FloorMap from "@/components/FloorMap";
import WardInfoCard from "@/components/WardInfoCard";
import ChatMessage from "@/components/ChatMessage";
import VoiceButton from "@/components/VoiceButton";
import LanguageToggle from "@/components/LanguageToggle";
import FloorSelector from "@/components/FloorSelector";
import QuickButtons from "@/components/QuickButtons";
import { findDepartment, getDirections, getBotGreeting, Department } from "@/data/hospitalData";

interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
}

export default function KioskPage() {
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeFloor, setActiveFloor] = useState(0);
  const [highlightDept, setHighlightDept] = useState<Department | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);

  // Send greeting on mount / language change
  useEffect(() => {
    setMessages([{ id: ++msgIdRef.current, role: "bot", content: getBotGreeting(lang) }]);
    setHighlightDept(null);
    setActiveFloor(0);
  }, [lang]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;

    const userMsg: Message = { id: ++msgIdRef.current, role: "user", content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Add a temporary "thinking" state or message if needed
    // For now, we'll just await the backend
    const dept = await findDepartment(query, lang);

    setTimeout(() => {
      if (dept) {
        const directions = getDirections(dept, lang);
        setHighlightDept(dept);
        setActiveFloor(dept.floor);
        setMessages(prev => [
          ...prev,
          { id: ++msgIdRef.current, role: "bot", content: directions },
        ]);
        // Voice output
        speakText(directions);
      } else {
        const notFound = lang === "ta"
          ? "❌ மன்னிக்கவும், அந்த பிரிவை கண்டுபிடிக்க முடியவில்லை.\n\nதயவுசெய்து மீண்டும் முயற்சிக்கவும் அல்லது கீழே உள்ள பொத்தான்களை பயன்படுத்தவும்."
          : "❌ Sorry, I couldn't find that department.\n\nPlease try again or use the quick buttons below.";
        setMessages(prev => [
          ...prev,
          { id: ++msgIdRef.current, role: "bot", content: notFound },
        ]);
      }
    }, 400);
  }, [lang]);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    // Clean text for speech
    const clean = text.replace(/[📍🏢➡️❌🏥]/g, "").replace(/\n/g, ". ");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = lang === "ta" ? "ta-IN" : "en-IN";
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const msg = lang === "ta" ? "குரல் உள்ளீடு இந்த உலாவியில் கிடைக்கவில்லை" : "Voice input not available in this browser";
      setMessages(prev => [...prev, { id: ++msgIdRef.current, role: "bot", content: msg }]);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ta" ? "ta-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleQuery(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery(input);
  };

  return (
    <div className="min-h-screen kiosk-gradient flex flex-col">
      {/* Header */}
      <header className="glass-surface px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xl glow-primary">
            H+
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
              {lang === "ta" ? "மருத்துவமனை வழிகாட்டி" : "Hospital Navigator"}
            </h1>
            <p className="text-sm font-medium text-primary/80">
              {lang === "ta" ? "AI மூத்த குடிமக்கள் உதவியாளர்" : "AI Senior Citizen Assistant"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-primary text-xs"
            >
              <Volume2 size={14} className="animate-pulse" />
              <span>{lang === "ta" ? "பேசுகிறது..." : "Speaking..."}</span>
            </motion.div>
          )}
          <LanguageToggle lang={lang} onToggle={() => setLang(l => l === "en" ? "ta" : "en")} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Map Panel */}
        <motion.div
          layout
          className="lg:w-1/2 glass-surface rounded-2xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              <span className="text-lg font-bold text-foreground">
                {lang === "ta" ? "தள வரைபடம்" : "Floor Map"}
              </span>
            </div>
            <FloorSelector activeFloor={activeFloor} onSelect={setActiveFloor} lang={lang} />
          </div>
          <div className="flex-1 min-h-[250px] lg:min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFloor}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <FloorMap activeFloor={activeFloor} highlightDept={highlightDept} lang={lang} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Ward Info Card */}
          <AnimatePresence mode="wait">
            {highlightDept && (
              <motion.div
                key={highlightDept.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <WardInfoCard dept={highlightDept} lang={lang} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Buttons */}
          <div>
            <p className="text-sm font-bold text-primary mb-3 px-1">
              {lang === "ta" ? "விரைவு தேடல்" : "Quick Search"}
            </p>
            <QuickButtons onSelect={handleQuery} lang={lang} />
          </div>
        </motion.div>

        {/* Chat Panel */}
        <div className="lg:w-1/2 glass-surface rounded-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium">
              {lang === "ta" ? "உரையாடல்" : "Chat Assistant"}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {messages.map(msg => (
              <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-border bg-muted/20">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <VoiceButton isListening={isListening} onToggle={toggleVoiceInput} lang={lang} />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={lang === "ta" ? "உங்கள் கேள்வியை தட்டச்சு செய்யவும்... (எ.கா. ICU எங்க இருக்கு?)" : "Type your question... (e.g. Where is ICU?)"}
                className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground rounded-2xl px-6 py-5 text-lg font-medium outline-none focus:ring-4 focus:ring-primary/30 transition-all border border-border"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                <Send size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-2 text-center text-xs text-muted-foreground">
        {lang === "ta" ? "தொடு திரை • குரல் உள்ளீடு • பல மொழி ஆதரவு" : "Touch Screen • Voice Input • Multi-language Support"}
      </footer>
    </div>
  );
}
