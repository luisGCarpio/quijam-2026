"use client";

// Archivo exclusivo de Dev 5 — Stub inicial Fase 0
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
    <section className="flex flex-col gap-4 p-4" aria-label={t("assistance.stub.title")}>
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[#0B2545]">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h2 className="text-base font-bold">{t("assistance.stub.title")}</h2>
        </div>
        <p className="mt-1 text-xs text-slate-600">{t("assistance.stub.subtitle")}</p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-xs font-medium text-slate-500">
          {t("assistance.stub.currency")}
        </p>
        <p className="mt-1 text-sm font-bold text-[#0B2545]">{currency}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Accessibility className="h-4 w-4 text-[#0B2545]" aria-hidden="true" />
          <span>{t("assistance.stub.inclusion")}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {PREF_ITEMS.map(({ key, labelKey }) => {
            const active = accessibility[key];
            return (
              <button
                key={key}
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => updateAccessibility({ [key]: !active })}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                  active
                    ? "border-[#0B2545] bg-[#0B2545] text-white"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
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
