"use client";

import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AnimationType =
  | "fade-up"
  | "fade-left"
  | "fade-right"
  | "scale"
  | "stagger";

const CLASS_MAP: Record<AnimationType, string> = {
  "fade-up": "se-reveal",
  "fade-left": "se-reveal-left",
  "fade-right": "se-reveal-right",
  scale: "se-reveal-scale",
  stagger: "se-reveal-stagger",
};

interface Props {
  children: ReactNode;
  type?: AnimationType;
  className?: string;
  delay?: number;
  threshold?: number;
}

export default function AnimateOnScroll({
  children,
  type = "fade-up",
  className,
  delay = 0,
  threshold = 0.08,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const addVisible = () => el.classList.add("in-view");
          if (delay) {
            setTimeout(addVisible, delay);
          } else {
            addVisible();
          }
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "-40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div ref={ref} className={cn(CLASS_MAP[type], className)}>
      {children}
    </div>
  );
}
