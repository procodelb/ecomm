import Link from "next/link";
import { Button, Heading, Text, Caption } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { localize } from "./utils";
import { ArrowRight } from "lucide-react";

type CtaSectionProps = {
  locale: string;
  title?: { en?: string; ar?: string };
  description?: { en?: string; ar?: string };
  buttonText?: { en?: string; ar?: string };
  buttonLink?: string;
  buttonVariant?: "primary" | "gold" | "outline";
  backgroundImage?: string;
};

const btnVariantMap: Record<string, "primary" | "gold" | "outline"> = {
  primary: "primary", gold: "gold", outline: "outline",
};

export function CtaSection({ locale, title, description, buttonText, buttonLink = "/contact", buttonVariant = "gold", backgroundImage }: CtaSectionProps) {
  return (
    <SectionWrapper className="text-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.04)_0%,transparent_70%)]" />
        {backgroundImage && (
          <>
            <img src={backgroundImage} alt="" loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-dark/60" />
          </>
        )}
      </div>
      <Caption className="mb-2 text-primary tracking-[0.15em]">
        Get in Touch
      </Caption>
      <Heading as="h2" className="mb-4">
        {localize(locale, title) || "Experience Luxury Firsthand"}
      </Heading>
      <Text size="lg" muted className="max-w-xl mx-auto mb-8">
        {localize(locale, description) || "Visit our showroom in Dubai or schedule a virtual consultation."}
      </Text>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href={buttonLink}>
          <Button variant={btnVariantMap[buttonVariant] || "gold"} size="lg" className="gap-2">
            {localize(locale, buttonText) || "Book Consultation"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
