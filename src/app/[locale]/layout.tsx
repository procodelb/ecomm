import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/lib/locale/routing";
import { Providers } from "@/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { seoMetadata } from "@/lib/seo/metadata";
import { AnalyticsProvider, ConsentBanner } from "@/components/analytics";
import { AiChatWidget } from "@/components/ai/ai-chat-widget-wrapper";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return seoMetadata({ title: undefined, description: undefined, locale, path: "/" });
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <AnalyticsProvider />
        <ConsentBanner />
        <AiChatWidget />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
