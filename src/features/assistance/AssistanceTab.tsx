"use client";

import { useState } from "react";
import { Accessibility, ArrowDown, ArrowLeftRight, ArrowRight, Contrast, MapPin, Navigation, Phone, ShieldCheck, Type, Volume2, Wallet, Cross } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import { ASSISTANCE_POIS } from "@/data/assistance-pois";
import { CURRENCY_RATES, REFERENCE_PRICES } from "@/data/currency-rates";
import { assistanceTexts } from "@/i18n/assistance";
import { formatCop } from "@/lib/currency";
import { findNearestPoi, haversineKm } from "@/lib/geo";
import { isSpeechSupported } from "@/lib/speech";
import type { AccessibilityPrefs, Currency, Lang, LatLng, Poi } from "@/types/bq360";

type Props = {
  lang: Lang;
  userLocation: LatLng;
  locationLabel: string;
  currency: Currency;
  accessibility: AccessibilityPrefs;
  navigateToRoute: (destination: LatLng & { label: string }) => void;
  updateAccessibility: (patch: Partial<AccessibilityPrefs>) => void;
  testVoice: () => void;
};

const CONTROLS = [
  { key: "accessibleRoute", description: "accessibleDesc", Icon: Navigation },
  { key: "highContrast", description: "contrastDesc", Icon: Contrast },
  { key: "largeText", description: "textDesc", Icon: Type },
  { key: "voiceAlerts", description: "voiceDesc", Icon: Volume2 },
] as const;

const actionClass = "bq-touch-target flex w-full items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-left text-bq-text shadow-sm transition-shadow hover:shadow-md focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-bq-yellow";

export function AssistanceContent({
  lang, userLocation, locationLabel, currency, accessibility,
  navigateToRoute, updateAccessibility, testVoice,
}: Props) {
  const text = assistanceTexts[lang];
  const [amount, setAmount] = useState("1");
  const [foreign, setForeign] = useState<Exclude<Currency, "COP">>("USD");
  const [inverted, setInverted] = useState(false);
  const [error, setError] = useState("");
  const activeCurrency = currency === "COP" ? foreign : currency;
  const normalizedAmount = amount.trim().replace(",", ".");
  const value = Number(normalizedAmount);
  const converted = inverted
    ? value * CURRENCY_RATES[activeCurrency].rateFromCop
    : value / CURRENCY_RATES[activeCurrency].rateFromCop;
  const valid = /^\d+(?:\.\d+)?$/.test(normalizedAmount) && Number.isFinite(converted);
  const format = (number: number, unit: Currency) =>
    new Intl.NumberFormat(CURRENCY_RATES[unit].locale, {
      style: "currency",
      currency: unit,
      maximumFractionDigits: unit === "COP" ? 0 : 2,
    }).format(number);

  function go(poi: Poi) {
    navigateToRoute({ ...poi.coords, label: poi.name[lang] });
  }

  function goToNearest(layer: "salud" | "seguridad") {
    const result = findNearestPoi(userLocation, ASSISTANCE_POIS.filter((item) => item.layer === layer));
    if (result) {
      setError("");
      go(result.poi);
    } else {
      setError(text.empty);
    }
  }

  return (
    <section className="mx-auto max-w-[440px] space-y-6 bg-white px-4 pb-12 pt-6 text-bq-text" aria-label={text.title}>
      <header className="flex items-center gap-3">
        <span className="bq-icon-circle flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bq-sky text-bq-navy"><ShieldCheck size={23} aria-hidden="true" /></span>
        <div>
          <h2 className="text-[1.75rem] font-bold leading-tight text-bq-navy">{text.title}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-bq-muted"><MapPin size={15} aria-hidden="true" />{text.near} {locationLabel}</p>
        </div>
      </header>

      <section className="space-y-2" aria-label={text.title}>
        <button type="button" className={actionClass} onClick={() => goToNearest("salud")}>
          <span className="bq-icon-circle flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bq-green text-white"><Cross size={21} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1"><span className="block font-bold text-bq-navy">{text.health}</span><span className="mt-0.5 block text-sm font-normal text-bq-muted">{text.healthHint}</span></span>
          <ArrowRight className="shrink-0 text-bq-navy" size={19} aria-hidden="true" />
        </button>
        <button type="button" className={actionClass} onClick={() => goToNearest("seguridad")}>
          <span className="bq-icon-circle flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bq-sky text-bq-navy"><ShieldCheck size={21} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1"><span className="block font-bold text-bq-navy">{text.security}</span><span className="mt-0.5 block text-sm font-normal text-bq-muted">{text.securityHint}</span></span>
          <ArrowRight className="shrink-0 text-bq-navy" size={19} aria-hidden="true" />
        </button>
        <a className="flex min-h-12 items-center gap-3 rounded-2xl border border-bq-red/30 bg-bq-red/10 px-4 py-3 text-sm font-bold text-bq-text" href="tel:123"><Phone className="shrink-0 text-bq-red" size={19} aria-hidden="true" /><span className="flex-1">{text.emergency}</span><ArrowRight className="shrink-0" size={17} aria-hidden="true" /></a>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <details className="bq-surface-card rounded-2xl p-4">
          <summary className="cursor-pointer font-semibold text-bq-navy">{text.directory}</summary>
          <p className="mt-3 text-sm">{text.directoryNote}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <a className="underline" href="https://barranquilla.gov.co/salud/pasos-y-caminos?showall=1">{text.healthGroup}</a>
            <a className="underline" href="https://barranquilla.gov.co/seguridad/cai-y-estaciones-de-policia">{text.securityGroup}</a>
          </div>
          {(["salud", "seguridad"] as const).map((layer) => {
            const points = ASSISTANCE_POIS.filter((poi) => poi.layer === layer)
              .sort((a, b) => haversineKm(userLocation, a.coords) - haversineKm(userLocation, b.coords));
            return (
              <div key={layer}>
                <h3 className="mt-5 font-bold">{layer === "salud" ? text.healthGroup : text.securityGroup}</h3>
                {points.length === 0 && <p>{text.empty}</p>}
                {points.map((poi) => (
                  <div key={poi.id} className="border-b border-slate-200 py-3">
                    <p className="font-semibold">{poi.name[lang]}</p>
                    <p className="text-sm">{poi.address} · {haversineKm(userLocation, poi.coords).toFixed(1)} {text.km}</p>
                    <div className="mt-2 flex gap-4">
                      <button type="button" className="underline" onClick={() => go(poi)}>{text.directions}</button>
                      {poi.phone && <a className="underline" href={`tel:${poi.phone}`}>{text.call}</a>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </details>
      </section>

      <nav className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2" aria-label={text.title}>
        <a className="bq-surface-card flex min-h-14 items-center gap-2 rounded-2xl p-3 text-sm font-bold text-bq-navy" href="#assistance-currency"><Wallet size={19} aria-hidden="true" /><span className="flex-1">{text.converter}</span><ArrowDown size={16} aria-hidden="true" /></a>
        <a className="bq-surface-card flex min-h-14 items-center gap-2 rounded-2xl p-3 text-sm font-bold text-bq-navy" href="#assistance-inclusion"><Accessibility size={19} aria-hidden="true" /><span className="flex-1">{text.inclusion}</span><ArrowDown size={16} aria-hidden="true" /></a>
      </nav>

      <section id="assistance-currency" tabIndex={-1} className="bq-surface-card scroll-mt-4 space-y-4 rounded-2xl p-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-bq-navy"><Wallet size={21} aria-hidden="true" />{text.converter}</h2>
        <label className="block font-semibold">
          {text.currency}
          <select className="ml-3 rounded-lg border p-2" value={activeCurrency} onChange={(event) => setForeign(event.target.value as Exclude<Currency, "COP">)} disabled={currency !== "COP"}>
            {(["USD", "EUR", "BRL"] as const).map((unit) => <option key={unit}>{unit}</option>)}
          </select>
        </label>
        <label className="block font-semibold">
          {text.amount} {inverted ? "COP" : activeCurrency}
          <input className="mt-2 block w-full rounded-lg border p-3" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2 font-semibold text-bq-navy" onClick={() => setInverted(!inverted)}><ArrowLeftRight size={17} aria-hidden="true" />{text.invert}</button>
        <div aria-live="polite" className="rounded-xl bg-bq-yellow p-4 text-xl font-bold text-bq-navy">
          {valid
            ? format(converted, inverted ? activeCurrency : "COP")
            : amount.trim() ? text.invalid : text.enter}
        </div>
        <p className="text-sm">{text.disclaimer}</p>
        <h3 className="font-bold">{text.references}</h3>
        <div>
          {REFERENCE_PRICES.map(({ key, priceCop }) => (
            <div key={key} className="flex justify-between gap-4 border-b border-slate-200 py-2">
              <span>{text[key]}</span><span>{formatCop(priceCop, currency)}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="assistance-inclusion" tabIndex={-1} className="bq-surface-card scroll-mt-4 rounded-2xl p-4">
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-bq-navy"><Accessibility size={21} aria-hidden="true" />{text.inclusion}</h2>
        {CONTROLS.map(({ key, description, Icon }) => (
          <label key={key} className="flex items-center gap-3 border-b border-slate-200 py-4">
            <span className="bq-icon-circle flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-bq-navy"><Icon size={20} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold">{text[key]}</span><span className="block text-sm text-bq-muted">{text[description]}</span></span>
            <span className="relative inline-flex shrink-0 items-center">
              <input type="checkbox" role="switch" className="peer sr-only" checked={accessibility[key]} onChange={(event) => updateAccessibility({ [key]: event.target.checked })} />
              <span aria-hidden="true" className="h-7 w-12 rounded-full border-2 border-bq-muted bg-[var(--surface-muted)] transition-colors peer-checked:border-bq-yellow peer-checked:bg-bq-navy peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bq-yellow" />
              <span aria-hidden="true" className="pointer-events-none absolute left-1 h-5 w-5 rounded-full bg-bq-muted transition-transform peer-checked:translate-x-5 peer-checked:bg-white" />
            </span>
          </label>
        ))}
        <button type="button" className="mt-4 rounded-lg border px-4 py-3 font-semibold" onClick={testVoice}>{text.testVoice}</button>
      </section>
    </section>
  );
}

export default function AssistanceTab() {
  const { lang, userLocation, currency, accessibility, navigateToRoute, updateAccessibility, pushNotification } = useBQ360();
  const text = assistanceTexts[lang];
  const isDefaultLocation = Math.abs(userLocation.lat - 10.9878) < 0.0005 && Math.abs(userLocation.lng + 74.7889) < 0.0005;

  return (
    <AssistanceContent
      lang={lang}
      userLocation={userLocation}
      locationLabel={isDefaultLocation ? "Plaza de la Paz" : text.location}
      currency={currency}
      accessibility={accessibility}
      navigateToRoute={navigateToRoute}
      updateAccessibility={updateAccessibility}
      testVoice={() => pushNotification({
        title: text.testTitle,
        body: accessibility.voiceAlerts && !isSpeechSupported() ? text.unavailable : text.testBody,
        severity: "baja",
      })}
    />
  );
}
