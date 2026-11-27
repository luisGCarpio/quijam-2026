"use client";

import { useRef, useState } from "react";
import { EVENT_SCENARIOS, SCENARIOS } from "@/data/scenarios";
import { getEventsCopy } from "@/i18n/events";
import { useBQ360 } from "@/context/BQ360Context";
import type { ScenarioMeta, SimulationState } from "@/types/bq360";
import styles from "./simulator.module.css";

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
  lang: "es" | "en" | "pt" | "fr";
}) {
  return (
    <button
      type="button"
      className={`${styles.scenarioTile}${selected ? ` ${styles.scenarioSelected}` : ""}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className={`${styles.scenarioMarker} ${styles[`marker${scenario.severity[0].toUpperCase()}${scenario.severity.slice(1)}`]}`} aria-hidden="true">
        {scenario.id === "normal" ? "✓" : scenario.id === "rain_arroyos" ? "☂" : scenario.id === "via40_parade" ? "✺" : "⚑"}
      </span>
      <span className={styles.scenarioText}>
        <strong>{scenario.label[lang]}</strong>
        <small>{scenario.summary[lang]}</small>
      </span>
      <span className={styles.scenarioRadio} aria-hidden="true">{selected ? "●" : "○"}</span>
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
  lang: "es" | "en" | "pt" | "fr";
}) {
  const intensityFromState = Math.max(0, Math.min(100, Math.round((crowdMultiplier / 3) * 100)));
  const [draft, setDraft] = useState(intensityFromState);
  const [isDragging, setIsDragging] = useState(false);
  const lastCommitted = useRef<number | null>(null);
  const current = isDragging ? draft : intensityFromState;

  const commit = () => {
    setIsDragging(false);
    if (draft !== intensityFromState && draft !== lastCommitted.current) {
      lastCommitted.current = draft;
      onCommit(draft);
    }
  };

  return (
    <div className={styles.intensitySection}>
      <div className={styles.intensityHeading}>
        <div><strong>{getEventsCopy(lang).intensity}</strong><p>{getEventsCopy(lang).intensityHelp}</p></div>
        <span className={styles.intensityValue}>{current}<small>%</small></span>
      </div>
      <input
        className={styles.range}
        type="range"
        min="0"
        max="100"
        step="1"
        value={current}
        disabled={disabled}
        aria-label={getEventsCopy(lang).intensity}
        aria-valuetext={`${current}% ${getEventsCopy(lang).percent}`}
        onChange={(event) => { lastCommitted.current = null; setDraft(Number(event.target.value)); setIsDragging(true); }}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        onPointerCancel={commit}
      />
      <div className={styles.rangeScale}><span>0%</span><span>80% · alerta</span><span>100%</span></div>
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
  const copy = getEventsCopy(lang);

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
    void applyPatch({ crowdMultiplier: Number(((percent / 100) * 3).toFixed(2)) });
  };

  if (!simulatorOpen) return null;

  return (
    <div className={styles.overlay}>
      <button className={styles.scrim} type="button" aria-label={copy.close} onClick={() => setSimulatorOpen(false)} />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="simulator-title"
        onKeyDown={(event) => { if (event.key === "Escape") setSimulatorOpen(false); }}
      >
        <div className={styles.handle} aria-hidden="true"><span /></div>
        <header className={styles.header}>
          <div className={styles.headerIcon} aria-hidden="true">◈</div>
          <div className={styles.headerCopy}>
            <span className={styles.kicker}>{copy.simulated}</span>
            <h2 id="simulator-title">{copy.simulatorTitle}</h2>
            <p>{copy.simulatorIntro}</p>
          </div>
          <button className={styles.closeButton} type="button" aria-label={copy.close} onClick={() => setSimulatorOpen(false)}>×</button>
        </header>

        <div className={styles.content}>
          <section className={styles.syncSection} aria-label={copy.liveSync}>
            <div className={styles.syncHeading}>
              <span className={`${styles.syncIndicator}${syncEnabled ? ` ${styles.syncIndicatorOn}` : ""}`} />
              <span>{syncEnabled ? copy.syncOn : copy.syncOff}</span>
            </div>
            <div className={styles.syncToggle} role="group" aria-label={copy.liveSync}>
              <button type="button" className={syncEnabled ? styles.syncActive : ""} aria-pressed={syncEnabled} onClick={() => setSyncEnabled(true)}>
                <span aria-hidden="true">◎</span>{copy.liveSync}
              </button>
              <button type="button" className={!syncEnabled ? styles.syncActive : ""} aria-pressed={!syncEnabled} onClick={() => setSyncEnabled(false)}>
                <span aria-hidden="true">◉</span>{copy.localMode}
              </button>
            </div>
            <p className={styles.syncDescription}>{syncEnabled ? copy.syncDescription : copy.localDescription}</p>
          </section>

          <section className={styles.modeSection} aria-labelledby="simulator-mode-title">
            <div className={styles.sectionHeading}><span className={styles.sectionIndex}>01</span><h3 id="simulator-mode-title">{copy.modeTitle}</h3></div>
            <div className={styles.modeSwitch} role="group" aria-label={copy.modeTitle}>
              <button type="button" className={simulation.mode === "mundial_2034" ? styles.modeActive : ""} aria-pressed={simulation.mode === "mundial_2034"} disabled={saving} onClick={() => void applyPatch({ mode: "mundial_2034" })}>
                <span aria-hidden="true">🏆</span>{copy.world}
              </button>
              <button type="button" className={simulation.mode === "legado" ? styles.modeActive : ""} aria-pressed={simulation.mode === "legado"} disabled={saving} onClick={() => void applyPatch({ mode: "legado" })}>
                <span aria-hidden="true">✺</span>{copy.legacy}
              </button>
            </div>
          </section>

          <section className={styles.scenariosSection} aria-labelledby="simulator-scenarios-title">
            <div className={styles.sectionHeading}><span className={styles.sectionIndex}>02</span><h3 id="simulator-scenarios-title">{copy.chooseScenario}</h3></div>
            <div className={styles.scenarioList}>
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

          <IntensityControl crowdMultiplier={simulation.crowdMultiplier} onCommit={changeIntensity} disabled={saving} lang={lang} />

          <div className={styles.simulationNotice}><span aria-hidden="true">i</span>{copy.simulationLabel}</div>
          {message && <p className={styles.statusMessage} role="status">{message}</p>}
          <button className={styles.resetButton} type="button" disabled={saving} onClick={() => selectScenario(SCENARIOS.normal)}>
            ↺ {copy.reset}
          </button>
        </div>
      </aside>
    </div>
  );
}
