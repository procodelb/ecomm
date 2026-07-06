"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage, SuggestedProduct, AiSettings } from "@/lib/ai/types";
import { AI_WELCOME_MESSAGES } from "@/lib/ai/config";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ProductSuggestions } from "./product-suggestions";

type Props = {
  locale: string;
  assistantType?: string;
  context?: Record<string, string>;
  settings?: AiSettings;
};

let messageIdCounter = 0;
function nextId() { return `msg_${++messageIdCounter}_${Date.now()}`; }

export function ChatWidget({ locale, assistantType = "general", context, settings }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const welcome = settings?.welcomeMessage?.[locale] || AI_WELCOME_MESSAGES[locale] || AI_WELCOME_MESSAGES["en-AE"];
    return [{ id: nextId(), role: "assistant", content: welcome, timestamp: Date.now() }];
  });
  const [loading, setLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[] | undefined>();
  const [handoffData, setHandoffData] = useState<{ subject: string; message: string } | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isEnabled = settings ? settings.enabled : true;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, suggestedProducts]);

  const handleSend = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { id: nextId(), role: "user", content: trimmed, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setSuggestedProducts(undefined);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-10),
          assistantType,
          locale,
          context,
        }),
      });

      const data = await res.json();

      const reply: ChatMessage = {
        id: nextId(),
        role: "assistant",
        content: data.reply || "Sorry, I couldn't process that.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);

      if (data.suggestedProducts) {
        setSuggestedProducts(data.suggestedProducts);
      }

      if (data.handoffData) {
        setHandoffData(data.handoffData);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: nextId(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#00C2FF] text-black shadow-lg shadow-[#00C2FF]/20 transition-all hover:scale-105 hover:shadow-[#00C2FF]/30 active:scale-95"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-white/10 bg-[#0B0B0B]/95 backdrop-blur-xl shadow-2xl"
            style={{ height: "min(600px, calc(100vh - 160px))" }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C2FF]/10 text-sm">🤖</div>
                <div>
                  <p className="text-sm font-medium text-white">AI Assistant</p>
                  <p className="text-[10px] text-white/40">{isEnabled ? "Online" : "Offline"}</p>
                </div>
              </div>
              {handoffData && (
                <a
                  href={`/${locale}/account/support?subject=${encodeURIComponent(handoffData.subject)}&message=${encodeURIComponent(handoffData.message)}`}
                  className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  Contact Support
                </a>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}
              {suggestedProducts && suggestedProducts.length > 0 && (
                <ProductSuggestions products={suggestedProducts} locale={locale} />
              )}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" style={{ animationDelay: "300ms" }} />
                  </div>
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 px-4 py-3">
              <ChatInput onSend={handleSend} disabled={loading || !isEnabled} locale={locale} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
