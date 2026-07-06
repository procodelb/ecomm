"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimateInView } from "@/hooks/use-animate-in-view";
import { Heading, Text, Caption } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { localize } from "./utils";
import { Plus } from "lucide-react";

type FaqItem = {
  _key?: string;
  question?: { en?: string; ar?: string };
  answer?: { en?: string; ar?: string };
};

type Props = {
  locale: string;
  title?: { en?: string; ar?: string };
  subtitle?: { en?: string; ar?: string };
  faqs?: FaqItem[];
};

const defaultFaqs: FaqItem[] = [
  { question: { en: "What countries do you ship to?" }, answer: { en: "We currently ship to UAE, Saudi Arabia, and Australia with premium white-glove delivery." } },
  { question: { en: "What is your return policy?" }, answer: { en: "We offer a 30-day satisfaction guarantee on all products. Custom configurations may have different terms." } },
  { question: { en: "Do you offer warranty on watercraft?" }, answer: { en: "Yes, all watercraft come with a 5-year extended warranty covering manufacturing defects." } },
  { question: { en: "How does white-glove delivery work?" }, answer: { en: "Our team delivers, unpacks, assembles, and configures your product. We also provide a full orientation." } },
  { question: { en: "Can I customize my order?" }, answer: { en: "Absolutely. Use our 3D configurator to customize colors, materials, and add-ons before purchase." } },
];

export function FaqSection({ locale, title, subtitle, faqs = defaultFaqs }: Props) {
  const headingRef = useAnimateInView<HTMLDivElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  return (
    <SectionWrapper className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-[0.02]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-gold blur-[200px]" />
      </div>
      <div ref={headingRef} className="text-center mb-14">
        <Caption className="mb-3 text-gold tracking-[0.15em] uppercase">
          {localize(locale, subtitle) || "Got Questions?"}
        </Caption>
        <Heading as="h2">
          {localize(locale, title) || "Frequently Asked Questions"}
        </Heading>
      </div>
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={faq._key || i}
              className={`rounded-2xl border transition-all duration-300 cursor-pointer ${
                isOpen ? "border-primary/20 bg-primary/[0.02]" : "border-border bg-white/[0.01] hover:border-white/10"
              }`}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <div className="flex items-center justify-between p-5 sm:p-6">
                <Text className="font-medium text-[15px] pr-4">
                  {localize(locale, faq.question)}
                </Text>
                <motion.div
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 text-primary" />
                </motion.div>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <Text size="sm" muted className="px-5 sm:px-6 pb-5 sm:pb-6 leading-relaxed">
                      {localize(locale, faq.answer)}
                    </Text>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
