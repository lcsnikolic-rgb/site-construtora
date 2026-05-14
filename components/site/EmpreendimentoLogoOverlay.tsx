"use client";

import Image from "next/image";
import { TransitionEvent, useCallback, useEffect, useRef, useState } from "react";
import { publicPath } from "@/lib/paths";

type EmpreendimentoLogoOverlayProps = {
  logoPath: string;
  durationSeconds: number;
};

type LoadState = "loading" | "ready" | "failed";

function normalizeDurationSeconds(value: number) {
  return Math.min(60, Math.max(1, Math.trunc(value || 3)));
}

export function EmpreendimentoLogoOverlay({
  logoPath,
  durationSeconds,
}: EmpreendimentoLogoOverlayProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const isVector = logoPath.toLowerCase().endsWith(".svg");
  const resolvedLogoPath = publicPath(logoPath);
  const hasHiddenRef = useRef(false);
  const hasResolvedLogo = Boolean(resolvedLogoPath);

  const hideOverlay = useCallback(() => {
    if (hasHiddenRef.current) return;
    hasHiddenRef.current = true;
    setIsHidden(true);
  }, []);

  useEffect(() => {
    if (!resolvedLogoPath) {
      hideOverlay();
      return;
    }

    let isActive = true;
    const image = new window.Image();
    image.decoding = "async";

    if ("fetchPriority" in image) {
      image.fetchPriority = "high";
    }

    const loadWatchdogTimer = window.setTimeout(() => {
      if (!isActive) return;
      setLoadState("failed");
      hideOverlay();
    }, 4000);

    image.onload = () => {
      if (!isActive) return;
      window.clearTimeout(loadWatchdogTimer);

      if (isVector || (image.naturalWidth > 0 && image.naturalHeight > 0)) {
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
  }, [hideOverlay, isVector, resolvedLogoPath]);

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

  if (!hasResolvedLogo || isHidden) return null;

  return (
    <div
      className={[
        "empreendimento-logo-overlay",
        loadState === "ready" ? "is-ready" : "is-loading",
        isLeaving ? "is-leaving" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
      onTransitionEnd={handleTransitionEnd}
    >
      {loadState === "loading" ? (
        <Image
          src={resolvedLogoPath}
          alt=""
          width={1}
          height={1}
          className="empreendimento-logo-overlay-probe"
          loading="eager"
          unoptimized
          onError={hideOverlay}
        />
      ) : null}
      {loadState === "ready" ? (
        <Image
          src={resolvedLogoPath}
          alt=""
          fill
          sizes="100vw"
          className="empreendimento-logo-overlay-backdrop"
          loading="eager"
          unoptimized
          onError={hideOverlay}
        />
      ) : null}
      <div className="empreendimento-logo-overlay-veil" />
      {loadState === "ready" ? (
        <Image
          src={resolvedLogoPath}
          alt=""
          fill
          sizes="100vw"
          className={`empreendimento-logo-overlay-image ${isVector ? "is-vector" : "is-raster"}`}
          loading="eager"
          unoptimized
          onError={hideOverlay}
        />
      ) : null}
    </div>
  );
}
