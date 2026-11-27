"use client";

// Archivo exclusivo de Dev 5 — Stub inicial Fase 0 (alineado a DESIGN.md)
import { ShieldCheck, Accessibility } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import type { AccessibilityPrefs } from "@/types/bq360";

const PREF_ITEMS: ReadonlyArray<{
  key: keyof AccessibilityPrefs;
  labelKey: string;
}> = [
  { key: "accessibleRoute", labelKey: "assistance.stub.accessibleRoute" },
  { key: "highContrast", labelKey: "assistance.stub.highContrast" },
  { key: "largeText", labelKey: "assistance.stub.largeText" },
  { key: "voiceAlerts", labelKey: "assistance.stub.voiceAlerts" },
];

export default function AssistanceTab() {
  const { accessibility, updateAccessibility, currency, t } = useBQ360();

  return (
    <section
      className="flex flex-col gap-4 p-4"
      aria-label={t("assistance.stub.title")}
    >
      <header className="flex items-start gap-3 pb-1">
        <span
          aria-hidden="true"
          className="bq-icon-circle mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bq-sky text-bq-navy"
        >
          <ShieldCheck
            className="h-5 w-5"
            strokeWidth={2.25}
            absoluteStrokeWidth
          />
        </span>
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-navy">
            {t("shell.inclusion.label")}
          </p>
          <h2 className="mt-0.5 text-lg font-extrabold leading-tight tracking-tight text-bq-navy">
            {t("assistance.stub.title")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-bq-text">
            {t("assistance.stub.subtitle")}
          </p>
        </div>
      </header>

      <div className="bq-surface-card rounded-2xl p-3.5">
        <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-muted">
          {t("assistance.stub.currency")}
        </p>
        <p className="mt-1 text-base font-extrabold text-bq-navy">{currency}</p>
      </div>

      {/* Concentric radius (better-ui): 24px outer (rounded-[24px]) with 12px padding (p-3) + 12px buttons (rounded-xl) */}
      <div className="bq-surface-card rounded-[24px] p-3">
        <div className="flex items-center gap-2 px-1 pb-2.5 text-[0.6875rem] font-bold uppercase tracking-wider text-bq-navy">
          <span
            aria-hidden="true"
            className="bq-icon-circle inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bq-yellow text-bq-navy"
          >
            <Accessibility
              className="h-3.5 w-3.5"
              strokeWidth={2.25}
              absoluteStrokeWidth
            />
          </span>
          <span>{t("assistance.stub.inclusion")}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PREF_ITEMS.map(({ key, labelKey }) => {
            const active = accessibility[key];
            return (
              <button
                key={key}
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => updateAccessibility({ [key]: !active })}
                className={`bq-touch-target min-h-11 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-colors duration-100 active:opacity-85 ${
                  active
                    ? "border-bq-navy bg-bq-navy text-white"
                    : "border-[var(--border-subtle)] bg-[var(--surface-muted)] text-bq-navy hover:bg-slate-100"
                }`}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
