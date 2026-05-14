"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { publicPath } from "@/lib/paths";

type HeroSlide = {
  id: string;
  empreendimentoName: string;
  empreendimentoSlug: string;
  imagePath: string;
};

type HeroCarouselProps = {
  title: string;
  subtitle: string;
  slides: HeroSlide[];
  intervalSeconds: number;
};

function normalizeIntervalSeconds(value: number) {
  return Math.min(60, Math.max(1, Math.trunc(value || 5)));
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToHydration(onStoreChange: () => void) {
  const timer = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(timer);
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function subscribeToReducedMotion(onStoreChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(reducedMotionQuery);

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onStoreChange);
    return () => mediaQuery.removeEventListener("change", onStoreChange);
  }

  mediaQuery.addListener(onStoreChange);
  return () => mediaQuery.removeListener(onStoreChange);
}

export function HeroCarousel({ title, subtitle, slides, intervalSeconds }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const shouldReduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
  const autoplayTimerRef = useRef<number | null>(null);
  const isDev = process.env.NODE_ENV !== "production";
  const autoplayIntervalMs = normalizeIntervalSeconds(intervalSeconds) * 1000;

  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimerRef.current !== null) {
      window.clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const selectSlide = useCallback((index: number) => {
    setActiveIndex(Math.max(0, index));
  }, []);

  useEffect(() => {
    if (isDev && hasHydrated) {
      console.debug("[HeroCarousel] hidratado", {
        slides: slides.length,
        autoplayIntervalMs,
      });
    }
  }, [autoplayIntervalMs, hasHydrated, isDev, slides.length]);

  useEffect(() => {
    if (isDev) {
      console.debug("[HeroCarousel] prefers-reduced-motion", shouldReduceMotion);
    }
  }, [isDev, shouldReduceMotion]);

  useEffect(() => {
    if (isDev) {
      console.debug("[HeroCarousel] slides recebidos:", slides.length);
    }
  }, [isDev, slides.length]);

  useEffect(() => {
    if (isDev) {
      console.debug("[HeroCarousel] indice atual:", activeIndex);
    }
  }, [activeIndex, isDev]);

  useEffect(() => {
    clearAutoplayTimer();

    if (!hasHydrated || slides.length <= 1 || shouldReduceMotion) {
      if (isDev) {
        console.debug("[HeroCarousel] autoplay desativado", {
          hydrated: hasHydrated,
          slides: slides.length,
          reducedMotion: shouldReduceMotion,
        });
      }
      return;
    }

    autoplayTimerRef.current = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, autoplayIntervalMs);

    if (isDev) {
      console.debug("[HeroCarousel] timer de autoplay iniciado", { autoplayIntervalMs });
    }

    return clearAutoplayTimer;
  }, [
    activeIndex,
    autoplayIntervalMs,
    clearAutoplayTimer,
    hasHydrated,
    isDev,
    shouldReduceMotion,
    slides.length,
  ]);

  if (slides.length === 0) {
    return (
      <section className="hero hero-empty">
        <div className="container hero-layout">
          <div className="hero-content">
            <p className="hero-brand-label">Construtora Forma Espaco</p>
            <h1 className="hero-project-title">{title}</h1>
            <p className="hero-project-subtitle">{subtitle}</p>
          </div>
        </div>
      </section>
    );
  }

  const safeActiveIndex = slides[activeIndex] ? activeIndex : 0;
  const activeSlide = slides[safeActiveIndex];

  return (
    <section
      className="hero"
      data-carousel-autoplay={hasHydrated && slides.length > 1 && !shouldReduceMotion ? "on" : "off"}
      data-carousel-hydrated={hasHydrated ? "true" : "false"}
    >
      <div className="hero-image-wrap" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-image-layer ${index === safeActiveIndex ? "is-active" : ""}`}
          >
            <Image
              src={publicPath(slide.imagePath)}
              alt=""
              fill
              sizes="100vw"
              preload={index === 0}
              className="hero-image"
            />
          </div>
        ))}
        <div className="hero-overlay" />
      </div>

      <div className="container hero-layout">
        <div className="hero-content">
          <p className="hero-brand-label">Construtora Forma Espaco</p>
          <h1 className="hero-project-title">
            <Link href={`/empreendimentos/${activeSlide.empreendimentoSlug}`}>
              {activeSlide.empreendimentoName}
            </Link>
          </h1>
          <p className="hero-project-subtitle">{subtitle || title}</p>
        </div>

        {slides.length > 1 ? (
          <div className="hero-controls">
            <div className="hero-dots" role="tablist" aria-label="Galeria de capa">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.id}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={index === safeActiveIndex}
                  aria-label={`Imagem ${index + 1}`}
                  className={index === safeActiveIndex ? "is-active" : ""}
                  onClick={() => selectSlide(index)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
