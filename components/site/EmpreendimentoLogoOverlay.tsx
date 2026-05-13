"use client";

import Image from "next/image";
import { TransitionEvent, useCallback, useEffect, useRef, useState } from "react";
import { publicPath } from "@/lib/paths";

type EmpreendimentoLogoOverlayProps = {
  logoPath: string;
  alt: string;
  durationSeconds: number;
};

type LoadState = "loading" | "ready" | "failed";

function normalizeDurationSeconds(value: number) {
  return Math.min(60, Math.max(1, Math.trunc(value || 3)));
}

export function EmpreendimentoLogoOverlay({
  logoPath,
  alt,
  durationSeconds,
}: EmpreendimentoLogoOverlayProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const isVector = logoPath.toLowerCase().endsWith(".svg");
  const resolvedLogoPath = publicPath(logoPath);
  const hasHiddenRef = useRef(false);

  const hideOverlay = useCallback(() => {
    if (hasHiddenRef.current) return;
    hasHiddenRef.current = true;
    setIsHidden(true);
  }, []);

  useEffect(() => {
    if (!resolvedLogoPath) {
      return;
    }

    let isActive = true;
    const image = new window.Image();
    const loadWatchdogTimer = window.setTimeout(() => {
      if (!isActive) return;
      setLoadState("failed");
      hideOverlay();
    }, 4500);

    image.onload = () => {
      if (!isActive) return;
      window.clearTimeout(loadWatchdogTimer);

      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        setLoadState("ready");
        return;
      }

      setLoadState("failed");
      hideOverlay();
    };

    image.onerror = () => {
      if (!isActive) return;
      window.clearTimeout(loadWatchdogTimer);
      setLoadState("failed");
      hideOverlay();
    };

    image.src = resolvedLogoPath;

    return () => {
      isActive = false;
      window.clearTimeout(loadWatchdogTimer);
      image.onload = null;
      image.onerror = null;
    };
  }, [hideOverlay, resolvedLogoPath]);

  useEffect(() => {
    if (loadState !== "ready" || isHidden) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shouldReduceMotion = media.matches;

    const displayDuration = shouldReduceMotion
      ? 300
      : normalizeDurationSeconds(durationSeconds) * 1000;
    const fadeDuration = shouldReduceMotion ? 140 : 740;

    const leaveTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, displayDuration);

    const hideTimer = window.setTimeout(() => {
      hideOverlay();
    }, displayDuration + fadeDuration);

    const watchdogTimer = window.setTimeout(() => {
      hideOverlay();
    }, displayDuration + fadeDuration + 1800);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(watchdogTimer);
    };
  }, [durationSeconds, hideOverlay, isHidden, loadState]);

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.propertyName === "opacity" && isLeaving) {
      hideOverlay();
    }
  }

  if (isHidden || loadState !== "ready") return null;

  return (
    <div
      className={`empreendimento-logo-overlay ${isLeaving ? "is-leaving" : ""}`}
      aria-hidden="true"
      onTransitionEnd={handleTransitionEnd}
    >
      <Image
        src={resolvedLogoPath}
        alt=""
        fill
        sizes="100vw"
        className="empreendimento-logo-overlay-backdrop"
        loading="eager"
        unoptimized={isVector}
        onError={hideOverlay}
      />
      <div className="empreendimento-logo-overlay-veil" />
      <Image
        src={resolvedLogoPath}
        alt={alt}
        fill
        sizes="100vw"
        className={`empreendimento-logo-overlay-image ${isVector ? "is-vector" : "is-raster"}`}
        preload
        unoptimized={isVector}
        onError={hideOverlay}
      />
    </div>
  );
}
