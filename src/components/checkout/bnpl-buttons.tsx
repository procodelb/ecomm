"use client";

import { cn } from "@/lib/utils/cn";
import { ChevronRight } from "lucide-react";

interface BNPLButtonsProps {
  locale: string;
  subtotal: number;
  className?: string;
}

export function BNPLButtons({ locale, subtotal, className }: BNPLButtonsProps) {
  const isUAE = locale === "en-AE" || locale === "ar-AE";
  const isAU = locale === "en-AU";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-[0.5625rem] text-muted-foreground/50 uppercase tracking-wider font-medium">
            Or pay with BNPL
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {isUAE && (
          <>
            <BNPLButton
              name="Tabby"
              description={`4 interest-free payments of ${formatBNPL(subtotal / 4)}`}
              logo="T"
              bgClass="bg-primary-10 hover:bg-primary-20 border-primary/20"
              logoBg="bg-primary-10"
              logoColor="text-primary"
              onClick={() => window.open("https://tabby.ai", "_blank")}
            />
            <BNPLButton
              name="Tamara"
              description={`3 interest-free payments of ${formatBNPL(subtotal / 3)}`}
              logo="T"
              bgClass="bg-gold-10 hover:bg-gold-20 border-gold/20"
              logoBg="bg-gold-10"
              logoColor="text-gold"
              onClick={() => window.open("https://tamara.co", "_blank")}
            />
          </>
        )}
        {isAU && (
          <BNPLButton
            name="AfterPay"
            description={`4 interest-free payments of ${formatBNPL(subtotal / 4)}`}
            logo="AP"
            bgClass="bg-primary-10 hover:bg-primary-20 border-primary/20"
            logoBg="bg-primary-10"
            logoColor="text-primary"
            onClick={() => window.open("https://afterpay.com", "_blank")}
          />
        )}
      </div>

      <p className="text-[0.5625rem] text-muted-foreground/40 text-center leading-relaxed px-4">
        {isUAE
          ? "Pay in interest-free installments. Subject to eligibility. Terms & conditions apply."
          : "Late fees may apply. Always budget responsibly."}
      </p>
    </div>
  );
}

interface BNPLButtonProps {
  name: string;
  description: string;
  logo: string;
  bgClass: string;
  logoBg: string;
  logoColor: string;
  onClick: () => void;
}

function BNPLButton({
  name,
  description,
  logo,
  bgClass,
  logoBg,
  logoColor,
  onClick,
}: BNPLButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all duration-300",
        bgClass,
      )}
    >
      <div className={cn("flex items-center justify-center w-9 h-9 rounded-lg font-heading text-sm font-bold shrink-0", logoBg, logoColor)}>
        {logo}
      </div>
      <div className="text-left flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-[0.625rem] text-muted-foreground/70 truncate">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
    </button>
  );
}

function formatBNPL(amount: number) {
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
