"use client";

import {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type RevealSectionProps = {
  as?: "section" | "article" | "div";
  className?: string;
  children: ReactNode;
  id?: string;
  delayMs?: number;
};

export function RevealSection({
  as = "section",
  className = "",
  children,
  id,
  delayMs = 0,
}: RevealSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [canAnimate, setCanAnimate] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      const frame = window.requestAnimationFrame(() => {
        setCanAnimate(false);
        setIsVisible(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    let observer: IntersectionObserver | null = null;
    const enableTimer = window.setTimeout(() => {
      setCanAnimate(true);
      setIsVisible(false);

      try {
        observer = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (entry?.isIntersecting) {
              setIsVisible(true);
              observer?.disconnect();
              observer = null;
            }
          },
          { threshold: 0.16 },
        );

        observer.observe(node);
      } catch {
        setIsVisible(true);
      }
    }, 0);

    return () => {
      window.clearTimeout(enableTimer);
      observer?.disconnect();
    };
  }, []);

  const style = useMemo(
    () =>
      ({
        "--reveal-delay": `${delayMs}ms`,
      }) as CSSProperties,
    [delayMs],
  );

  const Tag = as;

  return (
    <Tag
      id={id}
      ref={(element) => {
        ref.current = element;
      }}
      className={`reveal-block ${isVisible ? "is-visible" : ""} ${className}`.trim()}
      data-reveal-animate={canAnimate ? "true" : "false"}
      style={style}
    >
      {children}
    </Tag>
  );
}
