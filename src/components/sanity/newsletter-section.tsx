"use client";

import { useState } from "react";
import { useAnimateInView } from "@/hooks/use-animate-in-view";
import { Button, Heading, Text, Caption, Input } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { localize } from "./utils";
import { ArrowRight, Check } from "lucide-react";

type Props = {
  locale: string;
  title?: { en?: string; ar?: string };
  description?: { en?: string; ar?: string };
  placeholder?: { en?: string; ar?: string };
  buttonText?: { en?: string; ar?: string };
};

export function NewsletterSection({ locale, title, description, placeholder, buttonText }: Props) {
  const headingRef = useAnimateInView<HTMLDivElement>();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <SectionWrapper className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-dark to-gold/[0.03]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-gold/[0.03] blur-[120px]" />
      </div>

      <div ref={headingRef} className="text-center max-w-2xl mx-auto">
        <Caption className="mb-3 text-primary tracking-[0.15em] uppercase">
          Stay Connected
        </Caption>
        <Heading as="h2" className="mb-4">
          {localize(locale, title) || "Enter the Inner Circle"}
        </Heading>
        <Text size="base" muted className="mb-10 leading-relaxed">
          {localize(locale, description) ||
            "Private access to limited drops, collection premieres, and invitation-only experiences."}
        </Text>

        {subscribed ? (
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border border-primary/20 bg-primary-10">
            <Check className="h-5 w-5 text-primary" />
            <Text className="text-primary font-medium">
              Welcome to the inner circle. Check your inbox for a special welcome.
            </Text>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder={localize(locale, placeholder) || "your@email.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" variant="primary" size="lg" className="gap-2">
              {localize(locale, buttonText) || "Subscribe"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </SectionWrapper>
  );
}
