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
        className={`max-w-[85%] rounded-2xl px-5 py-4 text-base leading-relaxed whitespace-pre-line ${isBot
            ? "bg-chat-bot text-foreground rounded-bl-sm"
            : "bg-chat-user text-foreground rounded-br-sm"
          }`}
      >
        {isBot ? (
          <div className="prose prose-invert prose-base max-w-none [&_p]:my-1.5 [&_li]:my-1">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <span className="font-medium">{content}</span>
        )}
      </div>
    </motion.div>
  );
}
