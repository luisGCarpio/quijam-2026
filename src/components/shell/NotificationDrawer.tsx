"use client";

import { useEffect, useId, useRef } from "react";
import {
  AlertTriangle,
  Bell,
  BellOff,
  BellRing,
  CheckCheck,
  Clock,
  Info,
  X,
} from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import type { Lang, Severity } from "@/types/bq360";

const LOCALE_MAP: Record<Lang, string> = {
  es: "es-CO",
  en: "en-US",
  pt: "pt-BR",
  fr: "fr-FR",
};

function formatNotificationTime(timestamp: string, lang: Lang): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  try {
    return new Intl.DateTimeFormat(LOCALE_MAP[lang], {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return timestamp;
  }
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

/* Regla de contraste oficial DESIGN.md §3:
   blanco sobre #10284B/#268C44/#D9323B; #10284B sobre #FFFFFF/#F3C922/#6AB4E2 */
const SEVERITY_STYLES: Record<
  Severity,
  { badge: string; unreadAccent: string; dot: string }
> = {
  alta: {
    badge: "bg-bq-red text-white",
    unreadAccent: "border-l-4 border-l-bq-red",
    dot: "bg-bq-red",
  },
  media: {
    badge: "bg-bq-yellow text-bq-navy",
    unreadAccent: "border-l-4 border-l-bq-yellow",
    dot: "bg-bq-yellow",
  },
  baja: {
    badge: "bg-bq-sky text-bq-navy",
    unreadAccent: "border-l-4 border-l-bq-navy",
    dot: "bg-bq-sky",
  },
};

export function NotificationDrawer() {
  const {
    notifications,
    markAllNotificationsRead,
    isNotificationDrawerOpen,
    setNotificationDrawerOpen,
    lang,
    t,
  } = useBQ360();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const unreadCount = notifications.reduce(
    (acc, item) => (item.read ? acc : acc + 1),
    0
  );

  // Sincroniza el estado abierto/cerrado con showModal() / close() nativos
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isNotificationDrawerOpen && !dialog.open) {
      dialog.showModal();
      closeBtnRef.current?.focus();
    } else if (!isNotificationDrawerOpen && dialog.open) {
      dialog.close();
    }
  }, [isNotificationDrawerOpen]);

  // Fallback para navegadores sin soporte nativo de <dialog closedby="any"> (ej. Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (
      typeof HTMLDialogElement === "undefined" ||
      "closedBy" in HTMLDialogElement.prototype
    ) {
      return;
    }

    const isOutside = (event: PointerEvent): boolean => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };

    let pressedOutside = false;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target !== dialog ||
        (event.pointerType === "mouse" && event.button !== 0)
      ) {
        pressedOutside = false;
        return;
      }
      pressedOutside = isOutside(event);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (pressedOutside && isOutside(event)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener("pointerdown", handlePointerDown);
    dialog.addEventListener("pointerup", handlePointerUp);

    return () => {
      dialog.removeEventListener("pointerdown", handlePointerDown);
      dialog.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handleClose = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.returnValue = "";
    }
    if (isNotificationDrawerOpen) {
      setNotificationDrawerOpen(false);
    }
  };

  return (
    /* Concentric radius (better-ui): 24px outer (rounded-t-[24px]) with 12px padding (p-3) + 12px inner cards (rounded-xl) */
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleClose}
      {...({ closedby: "any" } as Record<string, string>)}
      className="bq-overlay-surface m-auto mb-0 max-h-[85dvh] w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-t-[24px] bg-white p-0 text-bq-text open:flex open:flex-col sm:mb-auto sm:rounded-[24px] backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-bq-navy-deep/65 backdrop:backdrop-blur-[2px]"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] bg-white px-4 py-3.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Ícono en círculo sólido QUIJAM (DESIGN.md §3) */}
            <span
              aria-hidden="true"
              className="bq-icon-circle inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bq-navy text-white"
            >
              <Bell
                className="h-4 w-4"
                strokeWidth={2}
                absoluteStrokeWidth
              />
            </span>
            <h1
              id={titleId}
              className="text-base font-extrabold leading-tight tracking-tight text-bq-navy"
            >
              {t("shell.notifications.title")}
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-bq-red px-2 py-0.5 text-[0.6875rem] font-bold leading-none text-white">
                {unreadCount} {t("shell.notifications.unreadSuffix")}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="bq-touch-target mt-2.5 inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] pe-3 ps-2.5 py-1 text-xs font-semibold text-bq-navy transition-colors duration-100 hover:bg-slate-100 active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bq-navy"
            >
              <CheckCheck
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              <span>{t("shell.notifications.markAllRead")}</span>
            </button>
          )}
        </div>

        <form method="dialog">
          <button
            ref={closeBtnRef}
            type="submit"
            value="close"
            autoFocus
            aria-label={t("shell.notifications.close")}
            className="bq-touch-target inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-white text-bq-navy transition-colors duration-100 hover:bg-[var(--surface-muted)] active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bq-navy"
          >
            <X
              className="h-4 w-4"
              strokeWidth={2}
              absoluteStrokeWidth
              aria-hidden="true"
            />
          </button>
        </form>
      </div>

      <div className="flex-1 p-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-10 text-center">
            <span
              aria-hidden="true"
              className="bq-icon-circle inline-flex h-11 w-11 items-center justify-center rounded-full bg-bq-sky text-bq-navy"
            >
              <BellOff
                className="h-5 w-5"
                strokeWidth={2}
                absoluteStrokeWidth
              />
            </span>
            <p className="mt-3 text-sm font-bold text-bq-navy">
              {t("shell.notifications.empty")}
            </p>
            <p className="mt-1 max-w-[26ch] text-xs leading-relaxed text-bq-muted">
              {t("shell.notifications.emptyHint")}
            </p>
          </div>
        ) : (
          <ul role="list" className="flex flex-col gap-2.5">
            {notifications.map((item) => {
              const style = SEVERITY_STYLES[item.severity];
              const severityLabel = t(
                `shell.notifications.severity.${item.severity}`
              );
              const formattedTime = formatNotificationTime(
                item.timestamp,
                lang
              );

              return (
                <li
                  key={item.id}
                  className={`bq-surface-card rounded-xl p-3.5 ${
                    item.read ? "opacity-85" : style.unreadAccent
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold leading-none ${style.badge}`}
                    >
                      <SeverityIcon
                        severity={item.severity}
                        className="h-3 w-3 shrink-0"
                      />
                      <span>{severityLabel}</span>
                    </span>

                    <div className="flex items-center gap-2 text-[0.6875rem] font-medium text-bq-muted">
                      {!item.read && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-bq-navy px-2 py-0.5 text-[0.6875rem] font-bold leading-none text-white">
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-bq-yellow"
                          />
                          <span>{t("shell.notifications.unreadSingle")}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock
                          className="h-3 w-3 shrink-0"
                          strokeWidth={1.75}
                          absoluteStrokeWidth
                          aria-hidden="true"
                        />
                        <time dateTime={item.timestamp}>{formattedTime}</time>
                      </span>
                    </div>
                  </div>

                  <h2 className="mt-2 text-sm font-bold leading-snug text-bq-navy">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-bq-text">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </dialog>
  );
}

export default NotificationDrawer;
