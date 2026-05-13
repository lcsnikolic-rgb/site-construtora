"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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

export function HeroCarousel({ title, subtitle, slides, intervalSeconds }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const autoplayTimerRef = useRef<number | null>(null);
  const isDev = process.env.NODE_ENV !== "production";
  const autoplayIntervalMs = normalizeIntervalSeconds(intervalSeconds) * 1000;

  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimerRef.current !== null) {
      window.clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setShouldReduceMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMotionPreference);
      return () => mediaQuery.removeEventListener("change", updateMotionPreference);
    }

    mediaQuery.addListener(updateMotionPreference);
    return () => mediaQuery.removeListener(updateMotionPreference);
  }, []);

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

    if (slides.length <= 1 || shouldReduceMotion) {
      if (isDev) {
        console.debug("[HeroCarousel] autoplay desativado", {
          slides: slides.length,
          reducedMotion: shouldReduceMotion,
        });
      }
      return;
    }

    autoplayTimerRef.current = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, autoplayIntervalMs);

    if (isDev) {
      console.debug("[HeroCarousel] timer de autoplay iniciado", { autoplayIntervalMs });
    }

    return clearAutoplayTimer;
  }, [autoplayIntervalMs, clearAutoplayTimer, isDev, shouldReduceMotion, slides.length]);

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
    <section className="hero">
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
              priority={index === 0}
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
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
