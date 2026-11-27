"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  CloudRain,
  Database,
  Flag,
  Flame,
  Info,
  Landmark,
  Radio,
  RotateCcw,
  SlidersHorizontal,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { EVENT_SCENARIOS, SCENARIOS } from "@/data/scenarios";
import { getEventsCopy } from "@/i18n/events";
import { useBQ360 } from "@/context/BQ360Context";
import type { Lang, ScenarioMeta, SimulationState } from "@/types/bq360";

function ScenarioIcon({
  id,
  className,
}: {
  id: ScenarioMeta["id"];
  className?: string;
}) {
  switch (id) {
    case "normal":
      return (
        <CheckCircle2
          className={className}
          strokeWidth={2.25}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
    case "metropolitano_exit":
      return (
        <Users
          className={className}
          strokeWidth={2.25}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
    case "rain_arroyos":
      return (
        <CloudRain
          className={className}
          strokeWidth={2.25}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
    case "malecon_full":
      return (
        <Flame
          className={className}
          strokeWidth={2.25}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
    case "via40_parade":
    default:
      return (
        <Flag
          className={className}
          strokeWidth={2.25}
          absoluteStrokeWidth
          aria-hidden="true"
        />
      );
  }
}

const SEVERITY_CIRCLE: Record<ScenarioMeta["severity"], string> = {
  baja: "bg-bq-green text-white",
  media: "bg-bq-yellow text-bq-navy",
  alta: "bg-bq-red text-white",
};

function ScenarioTile({
  scenario,
  selected,
  onSelect,
  disabled,
  lang,
}: {
  scenario: ScenarioMeta;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
  lang: Lang;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-100 active:opacity-85 disabled:cursor-wait disabled:opacity-60 ${
        selected
          ? "border-bq-navy bg-bq-navy text-white"
          : "border-[var(--border-subtle)] bg-white text-bq-navy hover:bg-[var(--surface-muted)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`bq-icon-circle inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          selected ? "bg-bq-yellow text-bq-navy" : SEVERITY_CIRCLE[scenario.severity]
        }`}
      >
        <ScenarioIcon id={scenario.id} className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <strong className="block text-xs font-bold leading-snug">
          {scenario.label[lang]}
        </strong>
        <span
          className={`mt-0.5 block text-[0.6875rem] leading-snug ${
            selected ? "text-white/85" : "text-bq-text"
          }`}
        >
          {scenario.summary[lang]}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? "border-bq-yellow bg-bq-yellow text-bq-navy"
            : "border-[var(--border-subtle)] bg-white text-transparent"
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={2.5} absoluteStrokeWidth />
      </span>
    </button>
  );
}

function IntensityControl({
  crowdMultiplier,
  onCommit,
  disabled,
  lang,
}: {
  crowdMultiplier: number;
  onCommit: (percent: number) => void;
  disabled: boolean;
  lang: Lang;
}) {
  const copy = getEventsCopy(lang);
  const intensityFromState = Math.max(
    0,
    Math.min(100, Math.round((crowdMultiplier / 3) * 100))
  );
  const [draft, setDraft] = useState(intensityFromState);
  const [isDragging, setIsDragging] = useState(false);
  const lastCommitted = useRef<number | null>(null);
  const sliderId = useId();
  const current = isDragging ? draft : intensityFromState;

  const commit = () => {
    setIsDragging(false);
    if (draft !== intensityFromState && draft !== lastCommitted.current) {
      lastCommitted.current = draft;
      onCommit(draft);
    }
  };

  return (
    <div className="bq-surface-card rounded-xl p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <label
            htmlFor={sliderId}
            className="block text-xs font-bold text-bq-navy"
          >
            {copy.intensity}
          </label>
          <p className="mt-0.5 text-[0.6875rem] leading-snug text-bq-muted">
            {copy.intensityHelp}
          </p>
        </div>
        <span className="shrink-0 text-lg font-extrabold leading-none tabular-nums text-bq-navy">
          {current}
          <span className="ml-0.5 text-xs font-bold text-bq-muted">%</span>
        </span>
      </div>

      <input
        id={sliderId}
        className="bq-range mt-4 block w-full appearance-none"
        type="range"
        min="0"
        max="100"
        step="1"
        value={current}
        disabled={disabled}
        aria-valuetext={`${current}% ${copy.percent}`}
        onChange={(event) => {
          lastCommitted.current = null;
          setDraft(Number(event.target.value));
          setIsDragging(true);
        }}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        onPointerCancel={commit}
      />

      <div className="mt-2 flex items-center justify-between text-[0.6875rem] font-semibold text-bq-muted tabular-nums">
        <span>0%</span>
        <span className="font-bold text-bq-red">80% · {copy.high}</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default function SimulatorDrawer() {
  const {
    lang,
    simulation,
    syncEnabled,
    setSyncEnabled,
    updateSimulation,
    simulatorOpen,
    setSimulatorOpen,
  } = useBQ360();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const modeHeadingId = useId();
  const scenariosHeadingId = useId();

  const copy = getEventsCopy(lang);

  // Sincroniza apertura/cierre con <dialog> nativo en Top Layer (siempre sobre Leaflet)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (simulatorOpen && !dialog.open) {
      dialog.showModal();
      closeBtnRef.current?.focus();
    } else if (!simulatorOpen && dialog.open) {
      dialog.close();
    }
  }, [simulatorOpen]);

  // Fallback para Safari sin soporte nativo de <dialog closedby="any">
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
    if (simulatorOpen) {
      setSimulatorOpen(false);
    }
  };

  const applyPatch = async (patch: Partial<SimulationState>) => {
    setSaving(true);
    setMessage("");
    try {
      await updateSimulation(patch);
      setMessage(copy.scenarioApplied);
    } catch {
      setMessage(copy.scenarioFailed);
    } finally {
      setSaving(false);
    }
  };

  const selectScenario = (scenario: ScenarioMeta) => {
    void applyPatch({
      scenarioId: scenario.id,
      crowdMultiplier: scenario.crowdMultiplier,
      weatherOverride: scenario.weatherOverride,
    });
  };

  const changeIntensity = (percent: number) => {
    void applyPatch({
      crowdMultiplier: Number(((percent / 100) * 3).toFixed(2)),
    });
  };

  return (
    /* Concentric radius (better-ui): 24px outer (rounded-t-[24px]) with 12px padding (p-3) + 12px cards (rounded-xl) */
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleClose}
      {...({ closedby: "any" } as Record<string, string>)}
      className="bq-overlay-surface m-auto mb-0 max-h-[88dvh] w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-t-[24px] bg-white p-0 text-bq-text open:flex open:flex-col sm:mb-auto sm:rounded-[24px] backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-bq-navy-deep/65 backdrop:backdrop-blur-[2px]"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] bg-white px-4 py-3.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden="true"
            className="bq-icon-circle mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bq-yellow text-bq-navy"
          >
            <SlidersHorizontal
              className="h-4 w-4"
              strokeWidth={2.25}
              absoluteStrokeWidth
            />
          </span>
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-bq-green">
              {copy.simulated}
            </p>
            <h1
              id={titleId}
              className="mt-0.5 text-base font-extrabold leading-tight tracking-tight text-bq-navy"
            >
              {copy.simulatorTitle}
            </h1>
            <p className="mt-0.5 text-xs leading-snug text-bq-text">
              {copy.simulatorIntro}
            </p>
          </div>
        </div>

        <form method="dialog">
          <button
            ref={closeBtnRef}
            type="submit"
            value="close"
            autoFocus
            aria-label={copy.close}
            className="bq-touch-target inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-white text-bq-navy transition-colors duration-100 hover:bg-[var(--surface-muted)] active:opacity-80"
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

      <div className="flex flex-col gap-4 p-3">
        {/* Control En Vivo (Sync Supabase) vs. Modo Local */}
        <section
          aria-label={copy.liveSync}
          className="bq-surface-card rounded-xl p-3.5"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-bq-navy">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${
                syncEnabled ? "bg-bq-green" : "bg-bq-muted"
              }`}
            />
            <span>{syncEnabled ? copy.syncOn : copy.syncOff}</span>
          </div>

          <div
            role="group"
            aria-label={copy.liveSync}
            className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-xl bg-[var(--surface-muted)] p-1"
          >
            <button
              type="button"
              aria-pressed={syncEnabled}
              onClick={() => setSyncEnabled(true)}
              className={`bq-touch-target inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors duration-100 ${
                syncEnabled
                  ? "bg-bq-green text-white shadow-xs"
                  : "text-bq-navy hover:bg-white/70"
              }`}
            >
              <Radio
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={2.25}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              <span>{copy.liveSync}</span>
            </button>

            <button
              type="button"
              aria-pressed={!syncEnabled}
              onClick={() => setSyncEnabled(false)}
              className={`bq-touch-target inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors duration-100 ${
                !syncEnabled
                  ? "bg-bq-navy text-white shadow-xs"
                  : "text-bq-navy hover:bg-white/70"
              }`}
            >
              <Database
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={2.25}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              <span>{copy.localMode}</span>
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-bq-muted">
            {syncEnabled ? copy.syncDescription : copy.localDescription}
          </p>
        </section>

        {/* Horizonte de ciudad: Mundial 2034 vs. Legado */}
        <section aria-labelledby={modeHeadingId}>
          <h2
            id={modeHeadingId}
            className="px-1 text-[0.6875rem] font-bold uppercase tracking-wider text-bq-navy"
          >
            {copy.modeTitle}
          </h2>
          <div
            role="group"
            aria-label={copy.modeTitle}
            className="mt-2 grid grid-cols-2 gap-2"
          >
            <button
              type="button"
              aria-pressed={simulation.mode === "mundial_2034"}
              disabled={saving}
              onClick={() => void applyPatch({ mode: "mundial_2034" })}
              className={`bq-touch-target inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border pe-3.5 ps-3 py-2 text-xs font-bold transition-colors duration-100 active:opacity-85 disabled:opacity-60 ${
                simulation.mode === "mundial_2034"
                  ? "border-bq-navy bg-bq-navy text-white"
                  : "border-[var(--border-subtle)] bg-white text-bq-navy hover:bg-[var(--surface-muted)]"
              }`}
            >
              <Trophy
                className="h-4 w-4 shrink-0"
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              <span>{copy.world}</span>
            </button>

            <button
              type="button"
              aria-pressed={simulation.mode === "legado"}
              disabled={saving}
              onClick={() => void applyPatch({ mode: "legado" })}
              className={`bq-touch-target inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border pe-3.5 ps-3 py-2 text-xs font-bold transition-colors duration-100 active:opacity-85 disabled:opacity-60 ${
                simulation.mode === "legado"
                  ? "border-bq-green bg-bq-green text-white"
                  : "border-[var(--border-subtle)] bg-white text-bq-navy hover:bg-[var(--surface-muted)]"
              }`}
            >
              <Landmark
                className="h-4 w-4 shrink-0"
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              <span>{copy.legacy}</span>
            </button>
          </div>
        </section>

        {/* Escenarios de 1 clic */}
        <section aria-labelledby={scenariosHeadingId}>
          <h2
            id={scenariosHeadingId}
            className="px-1 text-[0.6875rem] font-bold uppercase tracking-wider text-bq-navy"
          >
            {copy.chooseScenario}
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {EVENT_SCENARIOS.map((scenario) => (
              <ScenarioTile
                key={scenario.id}
                scenario={scenario}
                lang={lang}
                selected={simulation.scenarioId === scenario.id}
                onSelect={() => selectScenario(scenario)}
                disabled={saving}
              />
            ))}
          </div>
        </section>

        {/* Slider de intensidad 0–100% */}
        <IntensityControl
          crowdMultiplier={simulation.crowdMultiplier}
          onCommit={changeIntensity}
          disabled={saving}
          lang={lang}
        />

        {/* Aviso y estado */}
        <div className="flex items-start gap-2 rounded-xl bg-[var(--surface-muted)] px-3 py-2.5 text-[0.6875rem] leading-relaxed text-bq-muted">
          <Info
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bq-navy"
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <span>{copy.simulationLabel}</span>
        </div>

        {message && (
          <p role="status" className="px-1 text-xs font-bold text-bq-green">
            {message}
          </p>
        )}

        <button
          type="button"
          disabled={saving}
          onClick={() => selectScenario(SCENARIOS.normal)}
          className="bq-touch-target inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-white pe-4 ps-3.5 py-2 text-xs font-bold text-bq-navy transition-colors duration-100 hover:bg-[var(--surface-muted)] active:opacity-85 disabled:opacity-60"
        >
          <RotateCcw
            className="h-3.5 w-3.5 shrink-0"
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <span>{copy.reset}</span>
        </button>
      </div>
    </dialog>
  );
}
