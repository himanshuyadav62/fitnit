"use client";

import Link from "next/link";
import { useEffect, type MouseEvent, type ReactNode } from "react";

const STORAGE_KEY = "fitnit:plan-scroll-position:v1";
const MAX_AGE_MS = 30 * 60 * 1000;

type ScrollSnapshot = {
  anchorId: string;
  anchorTop: number;
  scrollY: number;
  savedAt: number;
};

export function PlanScrollRestorer() {
  useEffect(() => {
    const rawSnapshot = window.sessionStorage.getItem(STORAGE_KEY);
    if (!rawSnapshot) return;

    try {
      const snapshot = JSON.parse(rawSnapshot) as ScrollSnapshot;
      if (!Number.isFinite(snapshot.scrollY) || Date.now() - snapshot.savedAt > MAX_AGE_MS) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      const restore = () => {
        const anchor = document.getElementById(snapshot.anchorId);
        const top = anchor
          ? window.scrollY + anchor.getBoundingClientRect().top - snapshot.anchorTop
          : snapshot.scrollY;
        window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
        window.sessionStorage.removeItem(STORAGE_KEY);
      };

      const frame = window.requestAnimationFrame(() => window.requestAnimationFrame(restore));
      const settleTimer = window.setTimeout(restore, 150);
      return () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(settleTimer);
      };
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return null;
}

export function PlanExerciseLink({ exerciseId, href, className, children }: {
  exerciseId: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  function rememberPosition(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchorId = `plan-exercise-${exerciseId}`;
    const anchor = document.getElementById(anchorId);
    const snapshot: ScrollSnapshot = {
      anchorId,
      anchorTop: anchor?.getBoundingClientRect().top ?? 0,
      scrollY: window.scrollY,
      savedAt: Date.now(),
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }

  return <Link href={href} className={className} onClick={rememberPosition}>{children}</Link>;
}
