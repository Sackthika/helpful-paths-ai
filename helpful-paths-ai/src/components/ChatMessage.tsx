import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "bot";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isBot = role === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isBot ? "justify-start" : "justify-end"} mb-3`}
    >
      <div
        className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 text-base shadow-sm leading-relaxed whitespace-pre-line ${isBot
          ? "bg-[#F5F5F5] text-black border border-[#EEEEEE] rounded-bl-sm"
          : "bg-[#E91E63] text-white rounded-br-sm font-bold shadow-md shadow-pink-200/50"
          }`}
      >
        {isBot ? (
          <div className="prose prose-base max-w-none text-black/90 [&_p]:my-1.5 [&_li]:my-1 [&_strong]:text-black [&_strong]:font-black">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <span>{content}</span>
        )}
      </div>
    </motion.div>
  );
}
