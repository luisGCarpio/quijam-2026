"use client";

// Archivo exclusivo de Dev 3 — Stub inicial Fase 0 (Simulador funcional para pruebas E2E de Dev 1)
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
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleClose}
      {...({ closedby: "any" } as Record<string, string>)}
      className="m-auto mb-0 w-full max-w-[440px] max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl open:flex open:flex-col sm:mb-auto sm:rounded-2xl backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-slate-950/60 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#0B2545]">
            <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
            <h1 id={titleId} className="text-base font-bold leading-tight">
              {t("simulator.title")}
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-600">{t("simulator.subtitle")}</p>
        </div>

        <form method="dialog">
          <button
            ref={closeBtnRef}
            type="submit"
            value="close"
            autoFocus
            aria-label={t("simulator.close")}
            className="bq-touch-target inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio
                className={`h-4 w-4 ${syncEnabled ? "text-[#15803D]" : "text-slate-500"}`}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-slate-900">
                {syncEnabled ? t("simulator.sync") : t("simulator.local")}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={syncEnabled}
              onClick={() => setSyncEnabled(!syncEnabled)}
              className={`bq-touch-target relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                syncEnabled ? "bg-[#15803D]" : "bg-slate-300"
              }`}
            >
              <span className="sr-only">
                {syncEnabled ? t("simulator.sync") : t("simulator.local")}
              </span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  syncEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-600">
            {syncEnabled ? t("simulator.syncHint") : t("simulator.localHint")}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? "border-[#0B2545] bg-[#0B2545] text-white"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {t(`shell.mode.${mode}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                  className={`flex flex-col rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-[#0B2545] bg-[#0B2545] text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs font-bold">{scenario.label[lang]}</span>
                  <span
                    className={`mt-0.5 text-[0.6875rem] ${
                      active ? "text-slate-200" : "text-slate-600"
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
