'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  Clock,
  Compass,
  PauseCircle,
  PlayCircle,
  QrCode,
  RotateCcw,
  Store,
  WifiOff,
} from 'lucide-react';
import {
  BqNodeSheet,
  LocalAssistant,
  MerchantPanel,
  OutreachProvider,
  PublicNoticeCard,
  useOutreach,
  type PolicyId,
  type ScenarioId,
} from '@/features/outreach';

type OutreachTabId = 'market' | 'notices' | 'nodes' | 'assistant';

interface TabDefinition {
  id: OutreachTabId;
  label: string;
}

const TABS: readonly TabDefinition[] = [
  { id: 'market', label: 'BQ Market' },
  { id: 'notices', label: 'Orientación Pública' },
  { id: 'nodes', label: 'BQ Nodes' },
  { id: 'assistant', label: 'BQ AI y BQ Jobs' },
];

const SCENARIO_OPTIONS: ReadonlyArray<{ id: ScenarioId; label: string }> = [
  { id: 'metro-exit-v1', label: 'Salida Metropolitano' },
  { id: 'metro-entry-v1', label: 'Llegada al Estadio' },
];

const POLICY_OPTIONS: ReadonlyArray<{ id: PolicyId; label: string }> = [
  { id: 'shortest', label: 'Ruta más corta' },
  { id: 'balanced', label: 'Balanceo BQ360' },
  { id: 'intervention', label: 'Intervención D (200 plazas)' },
];

function TabIcon({ tabId }: { tabId: OutreachTabId }) {
  switch (tabId) {
    case 'market':
      return <Store className="h-4 w-4 shrink-0" aria-hidden="true" />;
    case 'notices':
      return <Compass className="h-4 w-4 shrink-0" aria-hidden="true" />;
    case 'nodes':
      return <QrCode className="h-4 w-4 shrink-0" aria-hidden="true" />;
    case 'assistant':
      return <Bot className="h-4 w-4 shrink-0" aria-hidden="true" />;
  }
}

function OutreachWorkspace() {
  const {
    state,
    announcement,
    togglePause,
    advanceClock,
    changePolicy,
    changeScenario,
    resetScenario,
  } = useOutreach();

  const baseId = useId();
  const [activeTab, setActiveTab] = useState<OutreachTabId>('market');

  const tabRefs = useRef<Record<OutreachTabId, HTMLButtonElement | null>>({
    market: null,
    notices: null,
    nodes: null,
    assistant: null,
  });

  const panelRefs = useRef<Record<OutreachTabId, HTMLDivElement | null>>({
    market: null,
    notices: null,
    nodes: null,
    assistant: null,
  });

  const selectTab = useCallback((nextId: OutreachTabId, moveFocus = false) => {
    setActiveTab(nextId);
    const tabEl = tabRefs.current[nextId];
    if (tabEl) {
      if (moveFocus) {
        tabEl.focus();
      }
      tabEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, []);

  // Synchronize tab selection when browser Find-in-Page matches content in a hidden="until-found" panel
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    for (const tab of TABS) {
      const panelEl = panelRefs.current[tab.id];
      if (!panelEl) continue;

      const handleBeforeMatch = () => {
        setActiveTab(tab.id);
        tabRefs.current[tab.id]?.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        });
      };

      panelEl.addEventListener('beforematch', handleBeforeMatch);
      cleanups.push(() => {
        panelEl.removeEventListener('beforematch', handleBeforeMatch);
      });
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, []);

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let targetIndex: number | null = null;

    if (event.key === 'ArrowRight') {
      targetIndex = (index + 1) % TABS.length;
    } else if (event.key === 'ArrowLeft') {
      targetIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (event.key === 'Home') {
      targetIndex = 0;
    } else if (event.key === 'End') {
      targetIndex = TABS.length - 1;
    }

    if (targetIndex !== null) {
      event.preventDefault();
      selectTab(TABS[targetIndex].id, true);
    }
  };

  const openMerchantsCount = useMemo(
    () =>
      state.merchants.filter(
        (m) =>
          m.status === 'open' &&
          m.capacity > 0 &&
          m.capacity > m.occupied &&
          state.currentTick <= m.validUntilTick
      ).length,
    [state.merchants, state.currentTick]
  );

  const pendingNodesCount = useMemo(
    () =>
      state.nodes.filter((n) => n.status === 'pending_physical_withdrawal')
        .length,
    [state.nodes]
  );

  const destC = useMemo(
    () => state.resources.find((r) => r.id === 'dest-C') ?? null,
    [state.resources]
  );
  const isCPaused = destC?.status === 'preventive_pause';

  const handleToggleArroyoPause = () => {
    togglePause({
      resourceId: 'dest-C',
      paused: !isCPaused,
      reason: !isCPaused
        ? 'Pausa preventiva por arroyo activo en El Prado (simulación).'
        : 'Arroyo despejado tras verificación en terreno en El Prado.',
      actorRole: 'Operador BQ360',
    });
  };

  const accessibleCheckboxId = `${baseId}-d-accessible`;

  return (
    <div className="bq-outreach min-h-screen">
      {/* Compact Single-Row Sticky Header (68px white text enforced by globals.css) */}
      <header className="sticky top-0 z-50 no-print">
        <div className="container mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="bq-touch-target inline-flex shrink-0 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold no-underline hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Volver al inicio</span>
            </Link>
            <span
              aria-hidden="true"
              className="hidden h-5 w-px bg-white/30 sm:inline-block"
            />
            <p className="truncate text-sm font-extrabold tracking-tight sm:text-base">
              BQ360 · Economía y Nodos
            </p>
          </div>

          <button
            type="button"
            onClick={() => resetScenario()}
            className="bq-touch-target inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-3 text-sm font-bold hover:bg-white/20"
          >
            <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Reiniciar demo</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl space-y-5 px-4">
        {/* Title & Offline Simulation Notice */}
        <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Orientación, Comercio Local y BQ Nodes
            </h1>
            <p className="text-sm text-slate-700">
              {state.scenarioLabel} · {state.scenarioDescription}
            </p>
          </div>

          <span className="bq-badge bq-badge-info self-start sm:self-center">
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Simulación local 100 % offline — datos ficticios de Barranquilla
            </span>
          </span>
        </div>

        {/* Demo Day Control Strip */}
        <section
          aria-label="Controles de escenario, política y reloj de demostración"
          className="bq-card no-print space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            {/* Scenario Switcher */}
            <div className="space-y-1.5 lg:col-span-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Escenario operativo
              </p>
              <div
                role="group"
                aria-label="Selector de escenario"
                className="flex flex-wrap gap-2"
              >
                {SCENARIO_OPTIONS.map((option) => {
                  const selected = state.scenarioId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => changeScenario(option.id)}
                      className={
                        selected
                          ? 'bq-btn bq-btn-primary text-sm'
                          : 'bq-btn text-sm'
                      }
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Policy Selector */}
            <div className="space-y-1.5 lg:col-span-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Política de asignación
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="group"
                  aria-label="Selector de política"
                  className="flex flex-wrap gap-2"
                >
                  {POLICY_OPTIONS.map((option) => {
                    const selected = state.policy === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          changePolicy({
                            policy: option.id,
                            interventionAccessible: state.interventionAccessible,
                            actorRole: 'Operador BQ360',
                          })
                        }
                        className={
                          selected
                            ? 'bq-btn bq-btn-primary text-sm'
                            : 'bq-btn text-sm'
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                {state.policy === 'intervention' && (
                  <label
                    htmlFor={accessibleCheckboxId}
                    className="bq-touch-target inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900"
                  >
                    <input
                      id={accessibleCheckboxId}
                      type="checkbox"
                      checked={state.interventionAccessible}
                      onChange={(e) =>
                        changePolicy({
                          policy: 'intervention',
                          interventionAccessible: e.target.checked,
                          actorRole: 'Operador BQ360',
                        })
                      }
                      className="h-5 w-5 shrink-0 accent-[#123f78]"
                    />
                    <span>D accesible</span>
                  </label>
                )}
              </div>
            </div>

            {/* Quick Incident & Clock Controls */}
            <div className="space-y-1.5 lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Incidencias y reloj
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleToggleArroyoPause}
                  className={
                    isCPaused
                      ? 'bq-btn bq-btn-primary text-sm'
                      : 'bq-btn border-amber-700 bg-amber-50 text-amber-950 text-sm'
                  }
                >
                  {isCPaused ? (
                    <>
                      <PlayCircle
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Levantar pausa preventiva en C</span>
                    </>
                  ) : (
                    <>
                      <PauseCircle
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Simular pausa por arroyo en C</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => advanceClock({ actorRole: 'Operador BQ360' })}
                  className="bq-btn text-sm"
                >
                  <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Tick +1 (Tick {state.currentTick})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live KPI Pills */}
          <div
            aria-label="Indicadores operativos en tiempo real"
            className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3"
          >
            <span className="bq-badge bq-badge-info">
              Aviso v{state.noticeVersion}
            </span>
            <span className="bq-badge bq-badge-ok">
              Comercios abiertos ({openMerchantsCount}/{state.merchants.length})
            </span>
            <span
              className={
                pendingNodesCount > 0
                  ? 'bq-badge bq-badge-alert'
                  : 'bq-badge bq-badge-ok'
              }
            >
              Fichas BQ Node pendientes ({pendingNodesCount})
            </span>
            <span
              className={
                state.allocation.pendingAccess > 0
                  ? 'bq-badge bq-badge-warn'
                  : 'bq-badge bq-badge-info'
              }
            >
              Demanda ({state.allocation.assignedTotal}/
              {state.allocation.totalDemand} · {state.allocation.pendingTotal}{' '}
              pend.)
            </span>
          </div>
        </section>

        {/* Single-Row Accessible Tablist + Searchable Tabpanels */}
        <section aria-label="Módulos operativos de Economía, Nodos y Asistencia">
          <div
            role="tablist"
            aria-label="Módulos de Economía, Nodos y Asistencia"
            className="no-print"
          >
            {TABS.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const tabId = `${baseId}-tab-${tab.id}`;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  type="button"
                  role="tab"
                  id={tabId}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectTab(tab.id, false)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                >
                  <TabIcon tabId={tab.id} />
                  <span>{tab.label}</span>
                  {tab.id === 'nodes' && pendingNodesCount > 0 && (
                    <span className="bq-badge bq-badge-alert text-xs">
                      {pendingNodesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabId = `${baseId}-tab-${tab.id}`;
            return (
              <div
                key={tab.id}
                ref={(el) => {
                  panelRefs.current[tab.id] = el;
                }}
                role="tabpanel"
                aria-labelledby={tabId}
                className={tab.id !== 'nodes' ? 'no-print' : undefined}
                /* React 19 emits hidden="until-found" at runtime; cast bridges @types/react@^18 in package.json */
                hidden={
                  isActive ? undefined : ('until-found' as unknown as boolean)
                }
              >
                <div className="bq-tabpanel-inner">
                  {tab.id === 'market' && <MerchantPanel />}
                  {tab.id === 'notices' && <PublicNoticeCard />}
                  {tab.id === 'nodes' && <BqNodeSheet />}
                  {tab.id === 'assistant' && <LocalAssistant />}
                </div>
              </div>
            );
          })}
        </section>

        {/* Command Traceability Audit Log */}
        <section
          aria-label="Bitácora de trazabilidad de comandos"
          className="bq-card no-print"
        >
          <details>
            <summary className="bq-touch-target flex cursor-pointer flex-wrap items-center justify-between gap-2 text-sm font-bold text-slate-900">
              <span>
                Bitácora de trazabilidad de comandos ({state.auditLog.length})
              </span>
              <span className="bq-badge bq-badge-info">
                Último aviso v{state.noticeVersion} · Tick {state.currentTick}
              </span>
            </summary>

            <div className="mt-4 overflow-x-auto">
              {state.auditLog.length === 0 ? (
                <p className="text-sm text-slate-700">
                  Aún no se han ejecutado comandos en esta sesión; el escenario
                  se encuentra en estado inicial limpio v1.
                </p>
              ) : (
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="mb-2 text-left text-xs font-semibold text-slate-700">
                    Bitácora de trazabilidad de comandos BQ360
                  </caption>
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-800">
                      <th scope="col" className="px-3 py-2">
                        Comando
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Actor
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Detalle
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Fecha/Hora
                      </th>
                      <th scope="col" className="px-3 py-2">
                        Versión
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.auditLog.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-slate-200 align-top hover:bg-slate-50"
                      >
                        <td className="px-3 py-2 font-mono text-xs font-bold text-[#123f78]">
                          {entry.commandType}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {entry.actorRole}
                        </td>
                        <td className="px-3 py-2 text-slate-800">
                          {entry.summary}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-700">
                          {entry.timestamp}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs font-bold text-slate-900">
                          v{entry.versionAfter}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </details>
        </section>
      </main>

      {/* Centralized Polite Status Announcer */}
      <div role="status" aria-live="polite" className="bq-sr-only">
        {announcement}
      </div>
    </div>
  );
}

export default function OutreachPage() {
  return (
    <OutreachProvider>
      <OutreachWorkspace />
    </OutreachProvider>
  );
}
