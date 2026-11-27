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
      return <AlertTriangle className={className} aria-hidden="true" />;
    case "media":
      return <BellRing className={className} aria-hidden="true" />;
    case "baja":
    default:
      return <Info className={className} aria-hidden="true" />;
  }
}

const SEVERITY_STYLES: Record<
  Severity,
  { card: string; badge: string; unreadBorder: string }
> = {
  alta: {
    card: "border-[#DC2626]/30 bg-red-50/70",
    badge: "bg-[#DC2626] text-white",
    unreadBorder: "border-l-4 border-l-[#DC2626]",
  },
  media: {
    card: "border-amber-300 bg-amber-50/70",
    badge: "bg-[#FACC15] text-[#0B2545]",
    unreadBorder: "border-l-4 border-l-[#D97706]",
  },
  baja: {
    card: "border-slate-200 bg-slate-50",
    badge: "bg-[#0B2545] text-white",
    unreadBorder: "border-l-4 border-l-[#0B2545]",
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
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleClose}
      {...({ closedby: "any" } as Record<string, string>)}
      className="m-auto mb-0 max-h-[85dvh] w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-t-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl open:flex open:flex-col sm:mb-auto sm:rounded-2xl backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-slate-950/60 backdrop:backdrop-blur-[2px]"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[#0B2545]">
            <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
            <h1 id={titleId} className="text-base font-bold leading-tight">
              {t("shell.notifications.title")}
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#DC2626] px-2 py-0.5 text-[0.6875rem] font-bold leading-none text-white">
                {unreadCount} {t("shell.notifications.unreadSuffix")}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="bq-touch-target mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-[#0B2545] transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545]"
            >
              <CheckCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
            className="bq-touch-target inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="flex-1 p-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
            <span
              aria-hidden="true"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-200/80 text-slate-600"
            >
              <BellOff className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-bold text-slate-900">
              {t("shell.notifications.empty")}
            </p>
            <p className="mt-1 text-xs text-slate-600">
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
                  className={`rounded-xl border p-3 transition-colors ${
                    item.read
                      ? "border-slate-200 bg-white"
                      : `${style.card} ${style.unreadBorder}`
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

                    <div className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-slate-600">
                      {!item.read && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#0B2545] px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none text-white">
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-[#FACC15]"
                          />
                          <span>{t("shell.notifications.unreadSingle")}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <time dateTime={item.timestamp}>{formattedTime}</time>
                      </span>
                    </div>
                  </div>

                  <h2 className="mt-2 text-sm font-bold leading-snug text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">
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
