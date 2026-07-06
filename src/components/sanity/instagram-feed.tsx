"use client";

import { useAnimateInView } from "@/hooks/use-animate-in-view";
import { Heading, Text, Caption } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { localize } from "./utils";
import { Heart, Camera } from "lucide-react";

type Post = {
  _key?: string;
  image?: string;
  likes?: number;
  caption?: { en?: string; ar?: string };
  url?: string;
};

type Props = {
  locale: string;
  title?: { en?: string; ar?: string };
  subtitle?: { en?: string; ar?: string };
  posts?: Post[];
};

const defaultPosts: Post[] = Array.from({ length: 6 }, (_, i) => ({
  image: undefined,
  likes: Math.floor(Math.random() * 5000 + 500),
  caption: { en: "Living the dream on the water" },
}));

export function InstagramFeed({ locale, title, subtitle, posts = defaultPosts }: Props) {
  const headingRef = useAnimateInView<HTMLDivElement>();

  if (posts.length === 0) return null;

  return (
    <SectionWrapper className="relative overflow-hidden">
      <div ref={headingRef} className="text-center mb-12">
        <div className="w-12 h-12 rounded-2xl bg-primary-10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <Camera className="h-5 w-5 text-primary" />
        </div>
        <Caption className="mb-2 text-muted-foreground tracking-[0.15em] uppercase">
          {localize(locale, subtitle) || "@ecomm_luxury"}
        </Caption>
        <Heading as="h2">
          {localize(locale, title) || "Follow the Journey"}
        </Heading>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 max-w-6xl mx-auto">
        {posts.map((post, i) => (
          <a
            key={post._key || i}
            href={post.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-xl bg-card border border-border"
          >
            {post.image ? (
              <img
                src={post.image}
                alt="Instagram post"
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary-10 via-dark to-gold-10 group-hover:scale-105 transition-transform duration-700" />
            )}
            <div className="absolute inset-0 bg-dark/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <div className="text-center">
                <Heart className="h-5 w-5 text-white mx-auto mb-1" />
                <Text size="xs" className="text-white/90 font-medium">
                  {post.likes?.toLocaleString()}
                </Text>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="text-center mt-10">
        <a
          href="https://instagram.com/ecomm_luxury"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
        >
          <Camera className="h-4 w-4" />
          Follow @ecomm_luxury
        </a>
      </div>
    </SectionWrapper>
  );
}
