"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertTriangle, BellRing, Info, X } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import type { NotificationItem, Severity } from "@/types/bq360";

const AUTO_DISMISS_MS = 6000;
const MIN_RESUME_MS = 1500;

function hasNativePopoverSupport(): boolean {
  return (
    typeof HTMLElement !== "undefined" &&
    Object.hasOwn(HTMLElement.prototype, "popover")
  );
}

function SeverityIcon({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  switch (severity) {
    case "alta":
      return (
        <AlertTriangle
          className={className}
          strokeWidth={2.25}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
    case "media":
      return (
        <BellRing
          className={className}
          strokeWidth={2.25}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
    case "baja":
    default:
      return (
        <Info
          className={className}
          strokeWidth={2.25}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
  }
}

/* Regla de contraste oficial DESIGN.md §3 */
const TOAST_SEVERITY_STYLES: Record<
  Severity,
  { accent: string; badge: string }
> = {
  alta: {
    accent: "border-l-4 border-l-bq-red",
    badge: "bg-bq-red text-white",
  },
  media: {
    accent: "border-l-4 border-l-bq-yellow",
    badge: "bg-bq-yellow text-bq-navy",
  },
  baja: {
    accent: "border-l-4 border-l-bq-navy",
    badge: "bg-bq-navy text-white",
  },
};

interface ToastCardProps {
  toast: NotificationItem;
  severityLabel: string;
  dismissLabel: string;
  pausedExternally: boolean;
  onAutoDismiss: (id: string) => void;
  onManualDismiss: (id: string) => void;
  registerDismissRef: (id: string, node: HTMLButtonElement | null) => void;
}

function ToastCard({
  toast,
  severityLabel,
  dismissLabel,
  pausedExternally,
  onAutoDismiss,
  onManualDismiss,
  registerDismissRef,
}: ToastCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const remainingMsRef = useRef<number>(AUTO_DISMISS_MS);
  const startedAtRef = useRef<number>(0);

  const isPaused = isHovered || isFocused || pausedExternally;
  const shouldAutoDismiss = toast.severity !== "alta";

  useEffect(() => {
    if (!shouldAutoDismiss || isPaused) {
      return;
    }

    const delay = Math.max(remainingMsRef.current, MIN_RESUME_MS);
    startedAtRef.current = Date.now();

    const timerId = window.setTimeout(() => {
      onAutoDismiss(toast.id);
    }, delay);

    return () => {
      window.clearTimeout(timerId);
      const elapsed = Date.now() - startedAtRef.current;
      remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
    };
  }, [shouldAutoDismiss, isPaused, onAutoDismiss, toast.id]);

  const styles = TOAST_SEVERITY_STYLES[toast.severity];

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
      className={`bq-overlay-surface pointer-events-auto w-full rounded-xl bg-white p-3 text-bq-text transition-opacity duration-150 motion-reduce:transition-none ${styles.accent}`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-extrabold leading-none ${styles.badge}`}
          >
            <SeverityIcon
              severity={toast.severity}
              className="h-3 w-3 shrink-0"
            />
            <span>{severityLabel}</span>
          </span>
          <p className="mt-1.5 text-xs font-bold leading-snug text-bq-navy">
            {toast.title}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-bq-text">
            {toast.body}
          </p>
        </div>

        <button
          ref={(node) => registerDismissRef(toast.id, node)}
          type="button"
          aria-label={dismissLabel}
          onClick={() => onManualDismiss(toast.id)}
          className="bq-touch-target inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-white text-bq-navy transition-colors duration-100 hover:bg-[var(--surface-muted)] active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bq-navy"
        >
          <X
            className="h-4 w-4"
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
}

export function ToastBanner() {
  const { activeToasts, dismissToast, isAnyModalOpen, t } = useBQ360();

  const stackId = useId();
  const popoverRef = useRef<HTMLDivElement>(null);
  const announcedIdsRef = useRef<Set<string>>(new Set());
  const pendingQueueRef = useRef<Array<{ id: string; message: string }>>([]);
  const dismissButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const priorFocusRef = useRef<HTMLElement | null>(null);

  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // Suprimir toasts visibles mientras haya un diálogo modal abierto
  const visibleToasts = useMemo(
    () => (isAnyModalOpen ? [] : activeToasts),
    [isAnyModalOpen, activeToasts]
  );
  const hasVisibleToasts = visibleToasts.length > 0;

  // Controla el Top Layer mediante popover="manual" con detección de soporte y fallback CSS
  useEffect(() => {
    const el = popoverRef.current;
    if (!el) {
      return;
    }

    el.dataset.open = hasVisibleToasts ? "true" : "false";

    if (!hasNativePopoverSupport()) {
      el.classList.toggle(":popover-open", hasVisibleToasts);
      return;
    }

    const popoverEl = el as HTMLDivElement & {
      showPopover?: () => void;
      hidePopover?: () => void;
    };

    try {
      const isOpen = el.matches(":popover-open");
      if (hasVisibleToasts && !isOpen) {
        popoverEl.showPopover?.();
      } else if (!hasVisibleToasts && isOpen) {
        popoverEl.hidePopover?.();
      }
    } catch {
      el.classList.toggle(":popover-open", hasVisibleToasts);
    }
  }, [hasVisibleToasts, visibleToasts.length]);

  // Anuncia solo el texto visible de toasts nuevos usando ariaNotify() o cola secuencial aria-live
  useEffect(() => {
    if (isAnyModalOpen) {
      return;
    }

    if (activeToasts.length === 0) {
      pendingQueueRef.current = [];
      const clearTimerId = window.setTimeout(() => {
        setLiveAnnouncement("");
      }, 0);
      return () => {
        window.clearTimeout(clearTimerId);
      };
    }

    const unannounced = activeToasts.filter(
      (toast) => !announcedIdsRef.current.has(toast.id)
    );
    if (unannounced.length === 0) {
      return;
    }

    const docWithAriaNotify = document as Document & {
      ariaNotify?: (
        announcement: string,
        options?: { priority?: "normal" | "high" }
      ) => void;
    };

    if (typeof docWithAriaNotify.ariaNotify === "function") {
      for (const toast of unannounced) {
        const severityLabel = t(`shell.notifications.severity.${toast.severity}`);
        const message = `${severityLabel}: ${toast.title}. ${toast.body}`;
        docWithAriaNotify.ariaNotify(message, {
          priority: toast.severity === "alta" ? "high" : "normal",
        });
        announcedIdsRef.current.add(toast.id);
      }
      return;
    }

    pendingQueueRef.current = unannounced.map((toast) => {
      const severityLabel = t(`shell.notifications.severity.${toast.severity}`);
      return {
        id: toast.id,
        message: `${severityLabel}: ${toast.title}. ${toast.body}`,
      };
    });

    let cancelled = false;
    let stepTimerId: number | undefined;
    let commitTimerId: number | undefined;

    const drainNext = (initialDelayMs: number) => {
      if (cancelled) return;
      const nextItem = pendingQueueRef.current[0];
      if (!nextItem) return;

      stepTimerId = window.setTimeout(() => {
        if (cancelled) return;
        setLiveAnnouncement("");
        commitTimerId = window.setTimeout(() => {
          if (cancelled) return;
          const committed = pendingQueueRef.current.shift();
          if (!committed) return;
          announcedIdsRef.current.add(committed.id);
          setLiveAnnouncement(committed.message);
          if (pendingQueueRef.current.length > 0) {
            drainNext(150);
          }
        }, 50);
      }, initialDelayMs);
    };

    drainNext(0);

    return () => {
      cancelled = true;
      if (stepTimerId !== undefined) {
        window.clearTimeout(stepTimerId);
      }
      if (commitTimerId !== undefined) {
        window.clearTimeout(commitTimerId);
      }
    };
  }, [activeToasts, isAnyModalOpen, t]);

  const registerDismissRef = useCallback(
    (id: string, node: HTMLButtonElement | null) => {
      if (node) {
        dismissButtonRefs.current.set(id, node);
      } else {
        dismissButtonRefs.current.delete(id);
      }
    },
    []
  );

  const handleAutoDismiss = useCallback(
    (id: string) => {
      dismissToast(id);
    },
    [dismissToast]
  );

  // Gestión de foco al descartar manualmente un toast enfocado
  const handleManualDismiss = useCallback(
    (id: string) => {
      const currentIndex = visibleToasts.findIndex((item) => item.id === id);
      const nextToast =
        visibleToasts[currentIndex + 1] ??
        visibleToasts[currentIndex - 1] ??
        null;

      dismissToast(id);

      window.requestAnimationFrame(() => {
        if (nextToast) {
          dismissButtonRefs.current.get(nextToast.id)?.focus();
        } else if (
          priorFocusRef.current &&
          priorFocusRef.current.isConnected
        ) {
          priorFocusRef.current.focus();
          priorFocusRef.current = null;
        }
      });
    },
    [dismissToast, visibleToasts]
  );

  return (
    <div
      role="region"
      aria-label={t("shell.notifications.region")}
      onFocusCapture={(event) => {
        const previous = event.relatedTarget;
        if (
          previous instanceof HTMLElement &&
          !event.currentTarget.contains(previous)
        ) {
          priorFocusRef.current = previous;
        }
      }}
    >
      {/* Fallback aria-live siempre montado con encabezado de contexto para lectores de pantalla */}
      <h2 className="visually-hidden">{t("shell.notifications.srHeading")}</h2>
      <div
        className="visually-hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveAnnouncement}
      </div>

      {/* Concentric outer 16px (rounded-2xl) = inner 12px (rounded-xl) + 4px padding (p-1) */}
      <div
        ref={popoverRef}
        id={stackId}
        popover="manual"
        data-open={hasVisibleToasts ? "true" : "false"}
        className="bq-toast pointer-events-none fixed bottom-[76px] left-0 right-0 top-auto z-40 mx-auto my-0 max-h-[60dvh] w-[min(calc(100vw-1.5rem),416px)] overflow-y-auto overscroll-contain rounded-2xl border-0 bg-transparent p-0 text-inherit shadow-none"
      >
        {hasVisibleToasts && (
          <div className="flex flex-col gap-2 p-1">
            {visibleToasts.map((toast) => (
              <ToastCard
                key={toast.id}
                toast={toast}
                severityLabel={t(
                  `shell.notifications.severity.${toast.severity}`
                )}
                dismissLabel={t("shell.notifications.dismissToast")}
                pausedExternally={isAnyModalOpen}
                onAutoDismiss={handleAutoDismiss}
                onManualDismiss={handleManualDismiss}
                registerDismissRef={registerDismissRef}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ToastBanner;
