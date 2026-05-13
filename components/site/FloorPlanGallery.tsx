"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { publicPath } from "@/lib/paths";

type FloorPlanImage = {
  id: string;
  src: string;
  alt: string;
  caption?: string | null;
};

type FloorPlanGalleryProps = {
  empreendimentoName: string;
  images: FloorPlanImage[];
};

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M8 4H4v4M16 4h4v4M20 16v4h-4M8 20H4v-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function normalizeIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

export function FloorPlanGallery({ empreendimentoName, images }: FloorPlanGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const total = images.length;
  const hasControls = total > 1;

  useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
        return;
      }

      if (event.key === "ArrowLeft" && hasControls) {
        setActiveIndex((current) => normalizeIndex(current - 1, total));
        return;
      }

      if (event.key === "ArrowRight" && hasControls) {
        setActiveIndex((current) => normalizeIndex(current + 1, total));
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hasControls, isFullscreen, total]);

  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  const safeActiveIndex = normalizeIndex(activeIndex, total);
  const activeImage = images[safeActiveIndex];
  const caption = useMemo(() => {
    if (!activeImage) return "";
    return activeImage.caption?.trim() || activeImage.alt;
  }, [activeImage]);

  if (total === 0 || !activeImage) {
    return null;
  }

  return (
    <>
      <div className="premium-floor-shell">
        <div className="premium-floor-stage">
          <button
            type="button"
            className="premium-gallery-fullscreen-trigger premium-floor-fullscreen-trigger"
            onClick={() => setIsFullscreen(true)}
            aria-label="Abrir imagem em tela cheia"
          >
            <ExpandIcon />
          </button>

          {hasControls ? (
            <button
              type="button"
              className="premium-gallery-nav prev"
              onClick={() => setActiveIndex((current) => normalizeIndex(current - 1, total))}
              aria-label="Planta anterior"
            >
              {"<"}
            </button>
          ) : null}

          <div className="premium-floor-open" aria-hidden="true">
            <Image
              src={publicPath(activeImage.src)}
              alt={activeImage.alt}
              fill
              sizes="(max-width: 760px) 100vw, 88vw"
              className="premium-floor-image"
              priority={safeActiveIndex === 0}
            />
          </div>

          {hasControls ? (
            <button
              type="button"
              className="premium-gallery-nav next"
              onClick={() => setActiveIndex((current) => normalizeIndex(current + 1, total))}
              aria-label="Proxima planta"
            >
              {">"}
            </button>
          ) : null}

          <div className="premium-gallery-meta premium-floor-meta">
            <p>{caption}</p>
            {hasControls ? (
              <span>
                {safeActiveIndex + 1}/{total}
              </span>
            ) : null}
          </div>
        </div>

        {hasControls ? (
          <div className="premium-floor-thumbs" role="tablist" aria-label="Miniaturas das plantas">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={safeActiveIndex === index}
                className={`premium-floor-thumb ${safeActiveIndex === index ? "is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                <Image
                  src={publicPath(image.src)}
                  alt={image.alt}
                  width={240}
                  height={160}
                  sizes="(max-width: 760px) 132px, 220px"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isFullscreen ? (
        <div
          className="premium-gallery-fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label={`Visualizacao de plantas de ${empreendimentoName}`}
          onClick={() => setIsFullscreen(false)}
        >
          <div className="premium-gallery-lightbox" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="premium-gallery-close"
              onClick={() => setIsFullscreen(false)}
              aria-label="Fechar tela cheia"
            >
              <span aria-hidden="true">X</span>
            </button>

            <div className="premium-gallery-fullscreen-media premium-floor-fullscreen-media">
              {hasControls ? (
                <button
                  type="button"
                  className="premium-gallery-nav prev"
                  onClick={() => setActiveIndex((current) => normalizeIndex(current - 1, total))}
                  aria-label="Planta anterior"
                >
                  {"<"}
                </button>
              ) : null}

              <Image
                src={publicPath(activeImage.src)}
                alt={activeImage.alt}
                width={2200}
                height={1600}
                sizes="(max-width: 760px) 94vw, 90vw"
                priority
                className="premium-gallery-fullscreen-image premium-floor-image"
              />

              {hasControls ? (
                <button
                  type="button"
                  className="premium-gallery-nav next"
                  onClick={() => setActiveIndex((current) => normalizeIndex(current + 1, total))}
                  aria-label="Proxima planta"
                >
                  {">"}
                </button>
              ) : null}
            </div>

            <div className="premium-gallery-meta fullscreen">
              <p>{caption}</p>
              {hasControls ? (
                <span>
                  {safeActiveIndex + 1}/{total}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
