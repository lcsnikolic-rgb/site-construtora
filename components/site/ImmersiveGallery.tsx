"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { publicPath } from "@/lib/paths";

type ImmersiveGalleryImage = {
  id: string;
  src: string;
  alt: string;
  caption?: string | null;
};

type ImmersiveGalleryProps = {
  empreendimentoName: string;
  images: ImmersiveGalleryImage[];
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

export function ImmersiveGallery({ empreendimentoName, images }: ImmersiveGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  const total = images.length;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setShouldReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => normalizeIndex(current - 1, total));
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => normalizeIndex(current + 1, total));
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen, total]);

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
    return <p className="premium-empty-state">Galeria de {empreendimentoName} em atualizacao.</p>;
  }

  return (
    <>
      <div className="premium-gallery-shell">
        <div className={`premium-gallery-stage ${shouldReduceMotion ? "is-reduced-motion" : ""}`}>
          <button
            type="button"
            className="premium-gallery-fullscreen-trigger"
            onClick={() => setIsFullscreen(true)}
            aria-label="Abrir imagem em tela cheia"
          >
            <ExpandIcon />
          </button>

          <button
            type="button"
            className="premium-gallery-nav prev"
            onClick={() => setActiveIndex((current) => normalizeIndex(current - 1, total))}
            aria-label="Imagem anterior"
          >
            {"<"}
          </button>

          <div className="premium-gallery-open" aria-hidden="true">
            <Image
              src={publicPath(activeImage.src)}
              alt={activeImage.alt}
              fill
              sizes="(max-width: 760px) 100vw, 84vw"
              priority={activeIndex === 0}
              className="premium-gallery-image"
            />
          </div>

          <button
            type="button"
            className="premium-gallery-nav next"
            onClick={() => setActiveIndex((current) => normalizeIndex(current + 1, total))}
            aria-label="Proxima imagem"
          >
            {">"}
          </button>

          <div className="premium-gallery-meta">
            <p>{caption}</p>
            <span>
              {safeActiveIndex + 1}/{total}
            </span>
          </div>
        </div>

        {total > 1 ? (
          <div className="premium-gallery-thumbs" role="tablist" aria-label="Miniaturas da galeria">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={index === safeActiveIndex}
                className={`premium-gallery-thumb ${index === safeActiveIndex ? "is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                <Image src={publicPath(image.src)} alt={image.alt} width={160} height={96} sizes="160px" />
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
          aria-label={`Visualizacao de imagens de ${empreendimentoName}`}
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

            <div className="premium-gallery-fullscreen-media">
              {total > 1 ? (
                <button
                  type="button"
                  className="premium-gallery-nav prev"
                  onClick={() => setActiveIndex((current) => normalizeIndex(current - 1, total))}
                  aria-label="Imagem anterior"
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
                className="premium-gallery-fullscreen-image"
              />

              {total > 1 ? (
                <button
                  type="button"
                  className="premium-gallery-nav next"
                  onClick={() => setActiveIndex((current) => normalizeIndex(current + 1, total))}
                  aria-label="Proxima imagem"
                >
                  {">"}
                </button>
              ) : null}
            </div>

            <div className="premium-gallery-meta fullscreen">
              <p>{caption}</p>
              <span>
                {safeActiveIndex + 1}/{total}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
