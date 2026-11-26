'use client';

import './outreach.css';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  advanceClock as engineAdvanceClock,
  answerLocalAiQuestion,
  applyMarketUpdate,
  applyPhysicalAck,
  createInitialOutreachState,
  resetScenario as engineResetScenario,
  setPolicy as engineSetPolicy,
  switchScenario as engineSwitchScenario,
  togglePreventivePause,
} from './engine.mjs';
import type {
  ClockAdvancePayload,
  CommandResult,
  LocalAiResponse,
  MarketUpdatePayload,
  OutreachExternalAdapter,
  OutreachState,
  PhysicalAckPayload,
  PolicyChangePayload,
  PreventivePausePayload,
  PublicProfileId,
  ScenarioId,
} from './types';

const STORAGE_KEY = 'bq360:outreach:v1';

function isValidOutreachState(candidate: unknown): candidate is OutreachState {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const s = candidate as Partial<OutreachState>;
  const validScenario =
    s.scenarioId === 'metro-exit-v1' || s.scenarioId === 'metro-entry-v1';
  const validPolicy =
    s.policy === 'shortest' ||
    s.policy === 'balanced' ||
    s.policy === 'intervention';

  return (
    validScenario &&
    validPolicy &&
    typeof s.currentTick === 'number' &&
    typeof s.noticeVersion === 'number' &&
    Array.isArray(s.resources) &&
    Array.isArray(s.routes) &&
    Array.isArray(s.merchants) &&
    Array.isArray(s.nodes) &&
    Array.isArray(s.ackHistory) &&
    Array.isArray(s.jobs) &&
    Array.isArray(s.auditLog) &&
    Boolean(s.allocation && typeof s.allocation.totalDemand === 'number') &&
    Boolean(
      s.notices &&
        s.notices.turista &&
        s.notices.ciudadano &&
        s.notices.movilidad_reducida &&
        s.notices.prensa
    )
  );
}

export interface OutreachContextValue {
  state: OutreachState;
  activeProfile: PublicProfileId;
  setActiveProfile: (profile: PublicProfileId) => void;
  announcement: string;
  setAnnouncement: (message: string) => void;
  isHydrated: boolean;
  updateMarket: (payload: MarketUpdatePayload) => CommandResult;
  ackNode: (payload: PhysicalAckPayload) => CommandResult;
  togglePause: (payload: PreventivePausePayload) => CommandResult;
  advanceClock: (payload?: ClockAdvancePayload) => CommandResult;
  changePolicy: (payload: PolicyChangePayload) => CommandResult;
  changeScenario: (scenarioId: ScenarioId) => CommandResult;
  resetScenario: (scenarioId?: ScenarioId) => CommandResult;
  askLocalAi: (query: string) => LocalAiResponse;
}

const OutreachContext = createContext<OutreachContextValue | null>(null);

export interface OutreachProviderProps {
  children: React.ReactNode;
  initialScenarioId?: ScenarioId;
  externalAdapter?: OutreachExternalAdapter;
}

export function OutreachProvider({
  children,
  initialScenarioId = 'metro-exit-v1',
  externalAdapter,
}: OutreachProviderProps) {
  // Deterministic SSR-safe initial state (no localStorage or Date.now() on render)
  const [internalState, setInternalState] = useState<OutreachState>(() =>
    createInitialOutreachState(initialScenarioId)
  );
  const [activeProfile, setActiveProfile] =
    useState<PublicProfileId>('ciudadano');
  const [announcement, setAnnouncement] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const effectiveState = externalAdapter?.externalState ?? internalState;
  const stateRef = useRef<OutreachState>(effectiveState);
  stateRef.current = effectiveState;

  // Hydrate persisted state only inside useEffect
  useEffect(() => {
    if (externalAdapter?.externalState) {
      setIsHydrated(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isValidOutreachState(parsed)) {
          setInternalState(parsed);
          stateRef.current = parsed;
        }
      }
    } catch {
      // Ignore storage errors (private browsing / restricted storage)
    } finally {
      setIsHydrated(true);
    }
  }, [externalAdapter?.externalState]);

  // Persist internal state updates after hydration
  useEffect(() => {
    if (!isHydrated || externalAdapter?.externalState) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(internalState));
    } catch {
      // Ignore quota/storage errors
    }
  }, [internalState, isHydrated, externalAdapter?.externalState]);

  const commitResult = useCallback(
    (result: CommandResult, successMessage: string): CommandResult => {
      if (result.ok) {
        stateRef.current = result.state;
        setInternalState(result.state);
        setAnnouncement(successMessage);
      } else if (result.error) {
        setAnnouncement(result.error);
      }
      return result;
    },
    []
  );

  const updateMarket = useCallback(
    (payload: MarketUpdatePayload): CommandResult => {
      const result = applyMarketUpdate(stateRef.current, payload);
      const externalRes = externalAdapter?.onMarketUpdate?.(payload);
      if (externalRes && typeof externalRes === 'object' && 'state' in externalRes) {
        return commitResult(
          externalRes,
          externalRes.state.lastRecalculationReason
        );
      }
      return commitResult(
        result,
        result.ok
          ? `Comercio actualizado. Aviso v${result.state.noticeVersion}: ${result.state.lastRecalculationReason}`
          : result.error || 'No se pudo actualizar el comercio.'
      );
    },
    [commitResult, externalAdapter]
  );

  const ackNode = useCallback(
    (payload: PhysicalAckPayload): CommandResult => {
      const result = applyPhysicalAck(stateRef.current, payload);
      const externalRes = externalAdapter?.onPhysicalAck?.(payload);
      if (externalRes && typeof externalRes === 'object' && 'state' in externalRes) {
        return commitResult(
          externalRes,
          `Acuse físico registrado en ${payload.nodeId}.`
        );
      }
      return commitResult(
        result,
        result.ok
          ? `Acuse físico confirmado en ${payload.nodeId} por ${payload.volunteerName}.`
          : result.error || 'No se pudo registrar el acuse físico.'
      );
    },
    [commitResult, externalAdapter]
  );

  const togglePause = useCallback(
    (payload: PreventivePausePayload): CommandResult => {
      const result = togglePreventivePause(stateRef.current, payload);
      const externalRes = externalAdapter?.onTogglePause?.(payload);
      if (externalRes && typeof externalRes === 'object' && 'state' in externalRes) {
        return commitResult(
          externalRes,
          externalRes.state.lastRecalculationReason
        );
      }
      return commitResult(
        result,
        result.ok
          ? `Estado de corredor actualizado (aviso v${result.state.noticeVersion}).`
          : result.error || 'No se pudo actualizar la pausa.'
      );
    },
    [commitResult, externalAdapter]
  );

  const advanceClock = useCallback(
    (payload?: ClockAdvancePayload): CommandResult => {
      const result = engineAdvanceClock(stateRef.current, payload);
      const externalRes = externalAdapter?.onAdvanceClock?.(payload);
      if (externalRes && typeof externalRes === 'object' && 'state' in externalRes) {
        return commitResult(
          externalRes,
          `Reloj en tick ${externalRes.state.currentTick}.`
        );
      }
      return commitResult(
        result,
        result.ok
          ? `Reloj avanzado a tick ${result.state.currentTick}.`
          : result.error || 'No se pudo avanzar el reloj.'
      );
    },
    [commitResult, externalAdapter]
  );

  const changePolicy = useCallback(
    (payload: PolicyChangePayload): CommandResult => {
      const result = engineSetPolicy(stateRef.current, payload);
      const externalRes = externalAdapter?.onSetPolicy?.(payload);
      if (externalRes && typeof externalRes === 'object' && 'state' in externalRes) {
        return commitResult(
          externalRes,
          `Política cambiada a ${externalRes.state.policy}.`
        );
      }
      return commitResult(
        result,
        result.ok
          ? `Política aplicada: ${result.state.policy}. Asignados ${result.state.allocation.assignedTotal} de ${result.state.allocation.totalDemand}.`
          : result.error || 'No se pudo cambiar la política.'
      );
    },
    [commitResult, externalAdapter]
  );

  const changeScenario = useCallback(
    (scenarioId: ScenarioId): CommandResult => {
      const nextState = engineSwitchScenario(scenarioId);
      const result: CommandResult = { ok: true, state: nextState };
      const externalRes = externalAdapter?.onSwitchScenario?.(scenarioId);
      if (externalRes && typeof externalRes === 'object' && 'state' in externalRes) {
        return commitResult(
          externalRes,
          `Escenario cambiado a ${externalRes.state.scenarioLabel}.`
        );
      }
      return commitResult(
        result,
        `Escenario cambiado a ${nextState.scenarioLabel}.`
      );
    },
    [commitResult, externalAdapter]
  );

  const resetScenario = useCallback(
    (scenarioId?: ScenarioId): CommandResult => {
      const targetScenario = scenarioId ?? stateRef.current.scenarioId;
      const nextState = engineResetScenario(targetScenario);
      const result: CommandResult = { ok: true, state: nextState };
      const externalRes = externalAdapter?.onResetScenario?.(targetScenario);
      if (externalRes && typeof externalRes === 'object' && 'state' in externalRes) {
        return commitResult(
          externalRes,
          `Escenario reiniciado a v1 (${externalRes.state.scenarioLabel}).`
        );
      }
      return commitResult(
        result,
        `Escenario reiniciado limpiamente a v1 (${nextState.scenarioLabel}).`
      );
    },
    [commitResult, externalAdapter]
  );

  const askLocalAi = useCallback(
    (query: string): LocalAiResponse =>
      answerLocalAiQuestion(stateRef.current, query),
    []
  );

  const value = useMemo<OutreachContextValue>(
    () => ({
      state: effectiveState,
      activeProfile,
      setActiveProfile,
      announcement,
      setAnnouncement,
      isHydrated,
      updateMarket,
      ackNode,
      togglePause,
      advanceClock,
      changePolicy,
      changeScenario,
      resetScenario,
      askLocalAi,
    }),
    [
      effectiveState,
      activeProfile,
      announcement,
      isHydrated,
      updateMarket,
      ackNode,
      togglePause,
      advanceClock,
      changePolicy,
      changeScenario,
      resetScenario,
      askLocalAi,
    ]
  );

  return (
    <OutreachContext.Provider value={value}>
      {children}
    </OutreachContext.Provider>
  );
}

export function useOutreach(): OutreachContextValue {
  const ctx = useContext(OutreachContext);
  if (!ctx) {
    throw new Error('useOutreach debe usarse dentro de un OutreachProvider.');
  }
  return ctx;
}

export function useOptionalOutreach(): OutreachContextValue | null {
  return useContext(OutreachContext);
}
