"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Heading, Text } from "@/components/ui/typography";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface ProductFaqProps {
  items: FaqItem[];
  title?: string;
  className?: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 1–3 business days within the UAE and 2–5 business days for regional Australia. Express shipping is available at checkout for faster delivery.",
  },
  {
    question: "Is this product covered by a warranty?",
    answer:
      "Yes, every product comes with a standard 1-year warranty covering manufacturing defects. Extended warranty options are available at checkout.",
  },
  {
    question: "Can I return this item if I change my mind?",
    answer:
      "Absolutely. We offer a 30-day return policy from the date of delivery. Items must be unused and in original packaging. See our Returns tab for full details.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "We currently ship within the UAE and Australia. For international shipping inquiries, please contact our support team.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and bank transfers for orders over a certain threshold.",
  },
];

export function ProductFaq({ items, title, className }: ProductFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = items.length > 0 ? items : DEFAULT_FAQS;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <Heading as="h3" gradient="primary">
          {title ?? "Frequently Asked Questions"}
        </Heading>
        <Text muted>Everything you need to know</Text>
      </div>

      <div className="max-w-3xl mx-auto space-y-2.5">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={cn(
                "rounded-2xl border transition-all duration-300 overflow-hidden",
                isOpen
                  ? "border-primary/20 bg-primary-10"
                  : "border-border bg-card hover:border-primary/15",
              )}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left"
              >
                <span
                  className={cn(
                    "font-heading text-sm sm:text-base font-medium leading-snug transition-colors duration-300",
                    isOpen ? "text-primary" : "text-foreground",
                  )}
                >
                  {faq.question}
                </span>
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-300",
                    isOpen
                      ? "bg-primary border-primary text-dark rotate-45"
                      : "bg-transparent border-border text-muted-foreground",
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                </div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                      <Text size="sm" muted className="leading-relaxed">
                        {faq.answer}
                      </Text>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
