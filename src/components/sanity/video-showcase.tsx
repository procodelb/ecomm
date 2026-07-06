"use client";

import { useState } from "react";
import { useAnimateInView } from "@/hooks/use-animate-in-view";
import { Button, Heading, Text, Caption } from "@/components/ui";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { localize } from "./utils";
import { Play } from "lucide-react";

type Video = {
  _key?: string;
  url?: string;
  thumbnail?: string;
  title?: { en?: string; ar?: string };
  duration?: number;
};

type Props = {
  locale: string;
  title?: { en?: string; ar?: string };
  subtitle?: { en?: string; ar?: string };
  videos?: Video[];
};

const defaultVideos: Video[] = [
  { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: { en: "Phantom Horizon — Full Review" }, duration: 184 },
  { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: { en: "Aether Prime — On the Water" }, duration: 247 },
  { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: { en: "Luminis Arc — First Look" }, duration: 312 },
];

export function VideoShowcase({ locale, title, subtitle, videos = defaultVideos }: Props) {
  const headingRef = useAnimateInView<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };

  return (
    <SectionWrapper className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-primary-10 to-dark opacity-40" />
      </div>

      <div ref={headingRef} className="text-center mb-16">
        <Caption className="mb-3 text-primary tracking-[0.15em] uppercase">
          {localize(locale, subtitle) || "Moving Images"}
        </Caption>
        <Heading as="h2">
          {localize(locale, title) || "Witness the Performance"}
        </Heading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {videos.map((video, i) => {
          const videoId = video.url ? getYouTubeId(video.url) : null;
          const isActive = activeIndex === i;

          return (
            <div
              key={video._key || i}
              className="group relative aspect-video rounded-2xl overflow-hidden border border-border bg-card cursor-pointer"
              onClick={() => setActiveIndex(isActive ? null : i)}
            >
              {isActive && videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-dark/60 via-dark/30 to-dark/60 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-white/25 flex items-center justify-center group-hover:border-primary group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(0,194,255,0.2)] transition-all duration-500">
                      <Play className="w-6 h-6 text-white ml-0.5 fill-white" />
                    </div>
                  </div>
                  {video.duration && (
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-xs text-white/60 font-mono">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                </>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <Text size="sm" className="text-white group-hover:text-primary transition-colors duration-300">
                  {localize(locale, video.title)}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
