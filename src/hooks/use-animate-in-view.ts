"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Options = {
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  trigger?: gsap.DOMTarget;
  scrollTrigger?: gsap.plugins.ScrollTriggerInstanceVars;
  delay?: number;
};

export function useAnimateInView<T extends HTMLElement>(options?: Options) {
  const ref = useRef<T>(null!);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        delay: options?.delay || 0,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
          ...options?.scrollTrigger,
        },
        ...options?.from,
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Animation should only run once on mount
  }, []);

  return ref;
}

export function useParallax<T extends HTMLElement>(speed = 0.15) {
  const ref = useRef<T>(null!);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: `${speed * 100}%`,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

export function useCounter<T extends HTMLElement>(end: number, duration = 2) {
  const ref = useRef<T>(null!);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: end,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
        },
        onUpdate: () => {
          el.textContent = Math.round(obj.val).toLocaleString();
        },
      });
    });

    return () => ctx.revert();
  }, [end, duration]);

  return ref;
}
