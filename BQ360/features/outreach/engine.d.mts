import type {
  ClockAdvancePayload,
  CommandResult,
  LocalAiResponse,
  MarketUpdatePayload,
  OutreachState,
  PhysicalAckPayload,
  PolicyChangePayload,
  PreventivePausePayload,
  ScenarioId,
} from './types';

export declare function recalculateState(
  state: OutreachState,
  reason?: string
): OutreachState;

export declare function createInitialOutreachState(
  scenarioId?: ScenarioId
): OutreachState;

export declare function applyMarketUpdate(
  state: OutreachState,
  payload: MarketUpdatePayload
): CommandResult;

export declare function applyPhysicalAck(
  state: OutreachState,
  payload: PhysicalAckPayload
): CommandResult;

export declare function togglePreventivePause(
  state: OutreachState,
  payload: PreventivePausePayload
): CommandResult;

export declare function advanceClock(
  state: OutreachState,
  payload?: ClockAdvancePayload
): CommandResult;

export declare function setPolicy(
  state: OutreachState,
  payload: PolicyChangePayload
): CommandResult;

export declare function switchScenario(scenarioId: ScenarioId): OutreachState;

export declare function resetScenario(scenarioId?: ScenarioId): OutreachState;

export declare function answerLocalAiQuestion(
  state: OutreachState,
  query: string
): LocalAiResponse;
