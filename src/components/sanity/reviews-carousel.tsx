"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimateInView } from "@/hooks/use-animate-in-view";
import { Heading, Text, Caption } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { localize } from "./utils";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

type Review = {
  _key?: string;
  quote?: { en?: string; ar?: string };
  authorName?: { en?: string; ar?: string };
  authorTitle?: { en?: string; ar?: string };
  rating?: number;
  avatar?: string;
};

type Props = {
  locale: string;
  title?: { en?: string; ar?: string };
  subtitle?: { en?: string; ar?: string };
  reviews?: Review[];
};

const defaultReviews: Review[] = [
  { quote: { en: "Absolutely stunning quality. The Phantom Horizon exceeded every expectation — the craftsmanship is unparalleled." }, authorName: { en: "Alexander K." }, authorTitle: { en: "Dubai Marina" }, rating: 5 },
  { quote: { en: "White-glove delivery was incredible. They set everything up and walked us through every feature. Truly premium service." }, authorName: { en: "Sarah M." }, authorTitle: { en: "Palm Jumeirah" }, rating: 5 },
  { quote: { en: "Best investment we've made for our water sports rental business. The durability and performance are outstanding." }, authorName: { en: "James W." }, authorTitle: { en: "Abu Dhabi" }, rating: 5 },
  { quote: { en: "The 3D configurator let us customize everything before purchase. What arrived was even better than the render." }, authorName: { en: "Layla R." }, authorTitle: { en: "Sydney Harbour" }, rating: 5 },
  { quote: { en: "Customer support is extraordinary. Had a minor question on a Sunday and got a response within 10 minutes." }, authorName: { en: "Omar H." }, authorTitle: { en: "Jeddah" }, rating: 5 },
];

export function ReviewsCarousel({ locale, title, subtitle, reviews = defaultReviews }: Props) {
  const headingRef = useAnimateInView<HTMLDivElement>();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  if (reviews.length === 0) return null;

  const next = () => { setDirection(1); setCurrent((c) => (c + 1) % reviews.length); };
  const prev = () => { setDirection(-1); setCurrent((c) => (c - 1 + reviews.length) % reviews.length); };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  };

  const review = reviews[current];

  return (
    <SectionWrapper className="relative overflow-hidden text-center">
      <div className="absolute inset-0 -z-10 opacity-[0.02]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary blur-[200px]" />
      </div>
      <div ref={headingRef}>
        <Caption className="mb-3 text-gold tracking-[0.15em] uppercase">
          {localize(locale, subtitle) || "Customer Voices"}
        </Caption>
        <Heading as="h2" className="mb-16">
          {localize(locale, title) || "What Our Clients Say"}
        </Heading>
      </div>

      <div className="max-w-3xl mx-auto relative min-h-[280px] flex items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute w-full px-4"
          >
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary-10 border border-primary/20 flex items-center justify-center">
                <Quote className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: review.rating || 5 }, (_, i) => (
                <Star key={i} className="h-5 w-5 text-gold fill-gold" />
              ))}
            </div>
            <Text size="lg" className="mb-8 leading-relaxed max-w-2xl mx-auto text-foreground/80 italic">
              &ldquo;{localize(locale, review.quote)}&rdquo;
            </Text>
            <div>
              <Text className="font-semibold text-primary">
                {localize(locale, review.authorName)}
              </Text>
              {review.authorTitle && (
                <Caption className="text-muted-foreground">
                  {localize(locale, review.authorTitle)}
                </Caption>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:border-primary/30 hover:bg-primary/[0.04] hover:text-primary transition-all text-muted-foreground"
          aria-label="Previous review"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-primary" : "w-2 bg-white/10 hover:bg-white/25"
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:border-primary/30 hover:bg-primary/[0.04] hover:text-primary transition-all text-muted-foreground"
          aria-label="Next review"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </SectionWrapper>
  );
}
