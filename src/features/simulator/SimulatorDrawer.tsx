"use client";

// Archivo exclusivo de Dev 3 — Stub inicial Fase 0 (Simulador funcional alineado a DESIGN.md)
import { useEffect, useId, useRef } from "react";
import { Radio, SlidersHorizontal, X } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import { SCENARIOS } from "@/data/scenarios";
import type { AppMode, ScenarioId } from "@/types/bq360";

const SCENARIO_LIST: readonly ScenarioId[] = [
  "normal",
  "metropolitano_exit",
  "rain_arroyos",
  "malecon_full",
  "via40_parade",
];

const APP_MODES: readonly AppMode[] = ["mundial_2034", "legado"];

export default function SimulatorDrawer() {
  const {
    simulation,
    syncEnabled,
    setSyncEnabled,
    updateSimulation,
    simulatorOpen,
    setSimulatorOpen,
    lang,
    t,
  } = useBQ360();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

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
    if (simulatorOpen) {
      setSimulatorOpen(false);
    }
  };

  return (
    /* Concentric radius (better-ui): 24px outer (rounded-t-[24px]) with 12px padding (p-3) + 12px cards (rounded-xl) */
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleClose}
      {...({ closedby: "any" } as Record<string, string>)}
      className="bq-overlay-surface m-auto mb-0 max-h-[85dvh] w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-t-[24px] bg-white p-0 text-bq-text open:flex open:flex-col sm:mb-auto sm:rounded-[24px] backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-bq-navy-deep/65 backdrop:backdrop-blur-[2px]"
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
            <h1
              id={titleId}
              className="text-base font-extrabold leading-tight tracking-tight text-bq-navy"
            >
              {t("simulator.title")}
            </h1>
            <p className="mt-0.5 text-xs leading-snug text-bq-text">
              {t("simulator.subtitle")}
            </p>
          </div>
        </div>

        <form method="dialog">
          <button
            ref={closeBtnRef}
            type="submit"
            value="close"
            autoFocus
            aria-label={t("simulator.close")}
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
        <div className="bq-surface-card rounded-xl p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`bq-icon-circle inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  syncEnabled
                    ? "bg-bq-green text-white"
                    : "bg-[var(--surface-muted)] text-bq-muted"
                }`}
              >
                <Radio
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                  absoluteStrokeWidth
                />
              </span>
              <span className="text-sm font-bold text-bq-navy">
                {syncEnabled ? t("simulator.sync") : t("simulator.local")}
              </span>
            </div>

            {/* Píldora limpia con área táctil >=44px sin deformar el track */}
            <button
              type="button"
              role="switch"
              aria-checked={syncEnabled}
              onClick={() => setSyncEnabled(!syncEnabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent transition-colors duration-150 before:absolute before:-inset-2 before:content-[''] ${
                syncEnabled ? "bg-bq-green" : "bg-slate-300"
              }`}
            >
              <span className="sr-only">
                {syncEnabled ? t("simulator.sync") : t("simulator.local")}
              </span>
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 ${
                  syncEnabled ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-bq-text">
            {syncEnabled ? t("simulator.syncHint") : t("simulator.localHint")}
          </p>
        </div>

        <div>
          <p className="px-1 text-[0.6875rem] font-bold uppercase tracking-wider text-bq-navy">
            {t("simulator.modeLabel")}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {APP_MODES.map((mode) => {
              const active = simulation.mode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    void updateSimulation({ mode });
                  }}
                  className={`bq-touch-target min-h-10 rounded-xl border px-3 py-2 text-xs font-bold transition-colors duration-100 active:opacity-85 ${
                    active
                      ? "border-bq-navy bg-bq-navy text-white"
                      : "border-[var(--border-subtle)] bg-white text-bq-navy hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  {t(`shell.mode.${mode}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-1 text-[0.6875rem] font-bold uppercase tracking-wider text-bq-navy">
            {t("simulator.scenariosLabel")}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {SCENARIO_LIST.map((scenarioId) => {
              const scenario = SCENARIOS[scenarioId];
              const active = simulation.scenarioId === scenarioId;
              return (
                <button
                  key={scenarioId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    void updateSimulation({
                      scenarioId: scenario.id,
                      crowdMultiplier: scenario.crowdMultiplier,
                      weatherOverride: scenario.weatherOverride,
                    });
                  }}
                  className={`flex flex-col rounded-xl border px-3.5 py-2.5 text-left transition-colors duration-100 active:opacity-85 ${
                    active
                      ? "border-bq-navy bg-bq-navy text-white"
                      : "border-[var(--border-subtle)] bg-white text-bq-navy hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  <span className="text-xs font-bold">
                    {scenario.label[lang]}
                  </span>
                  <span
                    className={`mt-0.5 text-[0.6875rem] leading-snug ${
                      active ? "text-white/85" : "text-bq-text"
                    }`}
                  >
                    {scenario.summary[lang]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </dialog>
  );
}
