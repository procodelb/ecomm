import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/seo/metadata";
import { ContactForm } from "@/components/about/contact-form";
import {
  ShieldCheck, Globe, Truck, Headphones, Star, BadgeCheck,
  Package, MapPin, CreditCard, Clock, Send, ChevronDown,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return seoMetadata({
    title: "About Us",
    description: "Learn about ECOMM Store — your trusted destination for premium water toys, jet boards, e-surfboards, and luxury water experiences across UAE, Dubai, and Australia.",
    keywords: ["about ecomm", "water toys store", "jet board UAE", "e-surfboard Australia", "luxury water toys"],
    locale,
    path: "/about",
  });
}

const features = [
  { icon: Star, title: "Premium Selection", desc: "Every product is handpicked for performance, design, and durability — only the best reach our catalog." },
  { icon: ShieldCheck, title: "Secure Shopping", desc: "Industry-leading encryption and PCI-compliant checkout ensure your transactions are always protected." },
  { icon: Truck, title: "International Delivery", desc: "We ship to UAE, Australia, and worldwide with insured, tracked logistics and white-glove options." },
  { icon: Headphones, title: "Responsive Support", desc: "Our dedicated team answers within 24 hours across email, WhatsApp, and phone — before and after your purchase." },
  { icon: Globe, title: "Trusted Suppliers", desc: "We partner directly with certified manufacturers, cutting out middlemen for authenticity and value." },
  { icon: BadgeCheck, title: "Quality Control", desc: "Every order passes through rigorous inspection before dispatch, backed by our satisfaction guarantee." },
];

const stats = [
  { label: "Premium Products", value: "Curated" },
  { label: "Supported Regions", value: "UAE & AU" },
  { label: "Customer Support", value: "24h Response" },
  { label: "Secure Transactions", value: "PCI DSS" },
];

const faqs = [
  { q: "How long does shipping take?", a: "UAE orders arrive within 1-3 business days. Australian orders take 3-7 business days. International shipping varies by destination." },
  { q: "Do you offer product warranties?", a: "Yes. All products include a manufacturer warranty. Extended warranty options are available at checkout." },
  { q: "What is your return policy?", a: "We offer a 30-day return policy for unused items in original packaging. Contact us for return authorization." },
  { q: "How can I track my order?", a: "Once shipped, you'll receive a tracking link via email. You can also track orders in your account dashboard." },
  { q: "Do you ship internationally?", a: "Yes. We ship worldwide with insured logistics. Shipping costs and delivery times vary by region." },
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 md:py-40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-gold/[0.03] blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.03)_0%,transparent_60%)]" />
        </div>

        <div className="container-luxury px-6 md:px-10 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-4 py-1.5 text-xs font-heading font-medium tracking-widest uppercase text-primary mb-6">
            <Star className="h-3 w-3" /> Premium Water Experiences
          </div>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            About <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">ECOMM</span> Store
          </h1>
          <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed mb-10">
            Your trusted destination for premium water toys, jet boards, e-surfboards,
            inflatable jet skis, and luxury water experiences — curated for thrill-seekers
            across UAE, Dubai, Australia, and beyond.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/${locale}/products`} className="inline-flex items-center justify-center h-12 px-7 rounded-xl bg-primary text-dark font-heading font-semibold tracking-wider text-sm transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_32px_rgba(0,212,255,0.16)]">
              Explore Products
            </Link>
            <a href="#contact" className="inline-flex items-center justify-center h-12 px-7 rounded-xl border border-white/10 bg-transparent font-heading font-medium tracking-wider text-sm text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:text-primary">
              <Send className="h-4 w-4 mr-2" /> Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Brand Story ───────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="container-luxury px-6 md:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="inline-block text-xs font-heading font-medium tracking-[0.2em] uppercase text-primary mb-4">Our Story</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">
                Redefining <span className="text-gold">Luxury</span> on the Water
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ECOMM Store was born from a passion for high-performance water sports and a
                commitment to delivering extraordinary experiences. We curate the world&apos;s finest
                jet boards, electric surfboards, inflatable watercraft, and premium accessories —
                selecting only products that meet our uncompromising standards.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Operating from Dubai and Sydney, we serve discerning customers across the UAE,
                Australia, and international markets. Whether you&apos;re riding the waves of Jumeirah
                Beach or exploring the Great Barrier Reef coast, our products transform every
                water moment into an adventure.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="h-4 w-4 text-primary" /> Dubai &amp; Sydney
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Globe className="h-4 w-4 text-primary" /> Worldwide Shipping
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Trusted &amp; Verified
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl border border-border bg-gradient-to-br from-white/[0.03] to-white/[0.01] overflow-hidden flex items-center justify-center">
                <div className="text-center px-8">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-heading text-lg font-bold text-foreground mb-1">Premium Curated Products</p>
                  <p className="text-sm text-muted-foreground/60">Hand-selected for quality &amp; performance</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-2xl border border-primary/10 bg-primary/[0.02] -z-10" />
              <div className="absolute -top-4 -left-4 h-20 w-20 rounded-xl border border-gold/10 bg-gold/[0.02] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 border-t border-border bg-white/[0.01]">
        <div className="container-luxury px-6 md:px-10 lg:px-16">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-heading font-medium tracking-[0.2em] uppercase text-primary mb-4">Why Choose Us</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Built for Performance &amp; Trust</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-white/[0.015] p-7 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.025] hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,212,255,0.04)]">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/[0.06] border border-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/[0.1] group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground/70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="container-luxury px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center rounded-2xl border border-border bg-white/[0.015] py-8 px-4 transition-all duration-300 hover:border-primary/20">
                <p className="font-heading text-2xl md:text-3xl font-bold text-primary mb-1">{s.value}</p>
                <p className="text-xs font-heading tracking-widest uppercase text-muted-foreground/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Section ───────────────────────────────────────────── */}
      <section id="contact" className="py-20 md:py-28 border-t border-border">
        <div className="container-luxury px-6 md:px-10 lg:px-16">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-heading font-medium tracking-[0.2em] uppercase text-primary mb-4">Get in Touch</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Contact Us</h2>
          </div>
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-border bg-white/[0.015] p-7">
                <h3 className="font-heading text-base font-bold text-foreground mb-5">Contact Information</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Send className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">Support Email</p>
                      <a href="mailto:admin@ecomm-store.com" className="text-muted-foreground/70 hover:text-primary transition-colors">admin@ecomm-store.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">Business Hours</p>
                      <p className="text-muted-foreground/70">Sunday – Thursday: 9:00 AM – 6:00 PM (GST)</p>
                      <p className="text-muted-foreground/70">Friday – Saturday: Closed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">Service Regions</p>
                      <p className="text-muted-foreground/70">UAE, Australia, International</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">Response Time</p>
                      <p className="text-muted-foreground/70">Within 1–2 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Preview ───────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 border-t border-border bg-white/[0.01]">
        <div className="container-luxury px-6 md:px-10 lg:px-16">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-heading font-medium tracking-[0.2em] uppercase text-primary mb-4">FAQ</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-border bg-white/[0.015] transition-all duration-300 hover:border-primary/20 [&_summary]:cursor-pointer">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 font-heading text-sm font-semibold text-foreground select-none list-none [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180 group-open:text-primary" />
                </summary>
                <div className="px-6 pb-5 text-sm text-muted-foreground/70 leading-relaxed border-t border-border/50 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
