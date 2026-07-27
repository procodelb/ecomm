import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { sanityFetch } from "@/lib/sanity/fetch";
import { pageBySlugQuery } from "@/sanity/queries/pages";
import { Heading, Text, Caption } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { seoMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import { getLocalizedUrl } from "@/lib/seo/site-config";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await sanityFetch<{ title?: { en?: string; ar?: string }; seo?: Record<string, unknown> | null }>({
    query: `*[_type == "seoPage" && slug.current == $slug][0] { title, seo }`,
    params: { slug }, tags: [`page:${slug}`],
  });
  const lang = locale.startsWith("ar") ? "ar" : "en";
  const title = page?.title?.[lang as keyof typeof page.title] || page?.title?.en || slug;
  const seo = page?.seo || {};
  return seoMetadata({
    title: (seo.metaTitle as string) || title,
    description: (seo.metaDescription as string) || undefined,
    ogImage: (seo.ogImage as string) || undefined,
    noIndex: (seo.noIndex as boolean) || false, locale, path: `/${slug}`,
  });
}

export default async function CmsPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await sanityFetch<{
    _id: string; title?: { en?: string; ar?: string };
    sections: { _type: string; children?: { text: string }[]; content?: { children: { text: string }[] }[] }[];
  }>({
    query: pageBySlugQuery, params: { slug }, tags: [`page:${slug}`],
  });

  if (!page) notFound();

  const lang = locale.startsWith("ar") ? "ar" : "en";
  const title = page.title?.[lang as keyof typeof page.title] || page.title?.en || "";
  const segments = slug.split("-");
  const displayTitle = title || segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

  const breadcrumbData = breadcrumbSchema([
    { name: "Home", url: getLocalizedUrl(locale, "/") },
    { name: displayTitle, url: getLocalizedUrl(locale, `/${slug}`) },
  ]);

  const textBlocks = page.sections?.filter((s) => s._type === "block" || s._type === "blockContent") || [];

  return (
    <>
      <JsonLd data={breadcrumbData} id="breadcrumb-schema" />
      <SectionWrapper className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-16">
          <Caption className="text-primary tracking-[0.15em] uppercase mb-4 block">
            {slug.replace(/-/g, " ")}
          </Caption>
          <Heading as="h1" className="mb-12">
            {displayTitle}
          </Heading>

          {textBlocks.length > 0 ? (
            <div className="prose-luxury">
              {textBlocks.map((section: { _type: string; children?: { text: string }[]; content?: { children: { text: string }[] }[] }, i: number) => {
                const text = section.children?.map((c: { text: string }) => c.text).join("") ||
                  section.content?.map((c: { children: { text: string }[] }) => c.children?.map((cc: { text: string }) => cc.text).join("")).join("\n\n") || "";
                if (!text) return null;
                return <p key={i} className="mb-5 last:mb-0">{text}</p>;
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <Text muted className="mb-2">Content coming soon</Text>
              <Caption className="text-muted-foreground/40">We are preparing this page with detailed information.</Caption>
            </div>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
