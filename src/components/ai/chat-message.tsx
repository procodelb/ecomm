"use client";

import type { ChatMessage } from "@/lib/ai/types";

type Props = { message: ChatMessage };

export function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[#00C2FF] text-black rounded-br-lg"
            : "bg-white/5 text-white/90 rounded-bl-lg"
        }`}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {message.content}
        <p className={`mt-1 text-[10px] ${isUser ? "text-black/50" : "text-white/30"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
