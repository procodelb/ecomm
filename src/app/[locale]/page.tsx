import { sanityFetch } from "@/lib/sanity/fetch";
import { homepageQuery } from "@/sanity/queries/pages";
import { SectionRenderer } from "@/components/sanity/section-renderer";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/json-ld";
import { organizationSchema, localBusinessSchema, faqSchema } from "@/lib/seo/schemas";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return seoMetadata({ title: undefined, description: undefined, locale, path: "/" });
}

const heroSection = {
  _type: "homepageHero",
  title: { en: "Where Power Meets<br/>Precision on Water" },
  subtitle: { en: "The Future of Luxury Watercraft" },
  ctaText: { en: "Explore Collection" },
  ctaLink: "/products",
  secondaryCtaText: { en: "Book Showroom" },
  secondaryCtaLink: "/contact",
  textAlign: "center" as const,
};

const threeDSection = {
  _type: "threeDShowcase",
  title: { en: "Explore in Three Dimensions" },
  subtitle: { en: "Immersive Product Experience" },
};

const collectionsSection = {
  _type: "featuredCollections",
  title: { en: "Curated for the Discerning" },
  subtitle: { en: "Exceptional Craftsmanship" },
  collections: [
    { title: { en: "Jet Skis" }, description: { en: "Next-generation watercraft engineered for adrenaline and elegance" }, link: "/products?category=jet-skis", gradient: "from-blue-900/40 via-cyan-900/20 to-transparent" },
    { title: { en: "Yachts & Boats" }, description: { en: "Luxury vessels where Italian design meets marine engineering" }, link: "/products?category=yachts", gradient: "from-gold/20 via-amber-900/10 to-transparent" },
    { title: { en: "E-Surfboards" }, description: { en: "Electric hydrofoil boards redefining aquatic freedom" }, link: "/products?category=water-sports", gradient: "from-primary/20 via-blue-900/10 to-transparent" },
    { title: { en: "Accessories" }, description: { en: "Precision-engineered gear for the complete experience" }, link: "/products?category=accessories", gradient: "from-purple-900/30 via-pink-900/10 to-transparent" },
  ],
};

const storytellingSection = {
  _type: "productStorytelling",
  title: { en: "The Art of Aquatic Engineering" },
  subtitle: { en: "Born from Innovation" },
  paragraph1: { en: "Every hull, every hydrofoil, every stitch of marine-grade upholstery begins with a singular question: how do we make the extraordinary feel effortless? At ECOMM, we don't just build watercraft — we craft experiences that dissolve the line between machine and instinct." },
  paragraph2: { en: "From the design studios of Milan to the testing waters of the Arabian Gulf, our team of engineers and artisans push beyond convention. Carbon-fiber monocoques, zero-emission electric propulsion, AI-assisted stability control — these aren't features. They're the foundation of a new standard." },
  stat1: { value: 12, label: "Years of Innovation" },
  stat2: { value: 3400, label: "Crafts Delivered" },
  stat3: { value: 47, label: "Design Awards" },
};

const benefitsSection = {
  _type: "benefitsSection",
  title: { en: "The ECOMM Standard" },
  subtitle: { en: "Uncompromising Excellence" },
  benefits: [
    { icon: "truck", title: { en: "Complimentary Shipping" }, description: { en: "White-glove delivery on every order within UAE" }, stat: 1000, statLabel: { en: "AED Free Shipping" }, suffix: "+" },
    { icon: "clock", title: { en: "48-Hour Delivery" }, description: { en: "Express setup and orientation by our certified team" }, stat: 48, statLabel: { en: "Hour Turnaround" }, suffix: "h" },
    { icon: "shield", title: { en: "Extended Warranty" }, description: { en: "5-year comprehensive coverage on all watercraft" }, stat: 5, statLabel: { en: "Year Protection" }, suffix: " Yrs" },
    { icon: "headphones", title: { en: "Concierge Support" }, description: { en: "24/7 priority assistance via call, chat, or in-person" }, stat: 247, statLabel: { en: "Concierge Access" }, suffix: "" },
  ],
};

const trustSection = {
  _type: "trustBadges",
  title: { en: "Trusted by the World's Best" },
  subtitle: { en: "In Partnership With" },
};

const videoSection = {
  _type: "videoShowcase",
  title: { en: "Witness the Performance" },
  subtitle: { en: "Moving Images" },
  videos: [
    { title: { en: "Phantom Horizon — Full Review" }, duration: 184 },
    { title: { en: "Aether Prime — On the Water" }, duration: 247 },
    { title: { en: "Luminis Arc — First Look" }, duration: 312 },
  ],
};

const reviewsSection = {
  _type: "reviewsCarousel",
  title: { en: "The Voice of Our Community" },
  subtitle: { en: "Testimonials" },
  reviews: [
    { quote: { en: "Absolutely stunning quality. The Phantom Horizon exceeded every expectation — the craftsmanship is unparalleled." }, authorName: { en: "Alexander K." }, authorTitle: { en: "Dubai Marina" }, rating: 5 },
    { quote: { en: "White-glove delivery was incredible. They set everything up and walked us through every feature. Truly premium service." }, authorName: { en: "Sarah M." }, authorTitle: { en: "Palm Jumeirah" }, rating: 5 },
    { quote: { en: "Best investment we've made for our water sports rental business. The durability and performance are outstanding." }, authorName: { en: "James W." }, authorTitle: { en: "Abu Dhabi" }, rating: 5 },
    { quote: { en: "The 3D configurator let us customize everything before purchase. What arrived was even better than the render." }, authorName: { en: "Layla R." }, authorTitle: { en: "Sydney Harbour" }, rating: 5 },
    { quote: { en: "Customer support is extraordinary. Had a minor question on a Sunday and got a response within 10 minutes." }, authorName: { en: "Omar H." }, authorTitle: { en: "Jeddah" }, rating: 5 },
  ],
};

const instagramSection = {
  _type: "instagramFeed",
  title: { en: "Follow the Journey" },
  subtitle: { en: "@ecomm_luxury" },
};

const faqSection = {
  _type: "faqSection",
  title: { en: "Answers at Your Fingertips" },
  subtitle: { en: "Questions?" },
  faqs: [
    { question: { en: "Which regions do you serve?" }, answer: { en: "We currently ship to UAE, Saudi Arabia, and Australia with premium white-glove delivery and installation." } },
    { question: { en: "What is your satisfaction guarantee?" }, answer: { en: "We offer a 30-day satisfaction guarantee on all products. Custom configurations and special orders may have different terms." } },
    { question: { en: "How comprehensive is the warranty?" }, answer: { en: "All watercraft come with a 5-year extended warranty covering all manufacturing defects, with optional upgrade to 10 years." } },
    { question: { en: "What does white-glove delivery include?" }, answer: { en: "Our certified technicians deliver, unpack, assemble, and fully configure your product. We also provide a comprehensive orientation session." } },
    { question: { en: "Can I personalize my order?" }, answer: { en: "Absolutely. Our 3D configurator lets you customize every detail — from colors and materials to performance upgrades and accessories." } },
  ],
};

const newsletterSection = {
  _type: "newsletterSection",
  title: { en: "Enter the Inner Circle" },
  description: { en: "Private access to limited drops, collection premieres, and invitation-only experiences." },
  placeholder: { en: "Your email address" },
  buttonText: { en: "Subscribe" },
};

const fallbackSections = [
  heroSection,
  threeDSection,
  collectionsSection,
  storytellingSection,
  benefitsSection,
  trustSection,
  videoSection,
  reviewsSection,
  instagramSection,
  faqSection,
  newsletterSection,
];

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const homepage = await sanityFetch<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sections: any[];
  }>({
    query: homepageQuery,
    params: { locale },
    tags: ["homepage"],
  });

  const sections = homepage?.sections?.length ? homepage.sections : fallbackSections;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faqData = (sections.find((s: any) => s._type === "faqSection") || faqSection).faqs?.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (f: any) => ({
      question: f.question?.en || "",
      answer: f.answer?.en || "",
    }),
  ) || [];

  return (
    <>
      <JsonLd data={organizationSchema()} id="organization-schema" />
      <JsonLd data={localBusinessSchema()} id="local-business-schema" />
      <JsonLd data={faqSchema(faqData)} id="faq-schema" />
      <SectionRenderer locale={locale} sections={sections} />
    </>
  );
}
