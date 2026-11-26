import './outreach.css';

export {
  OutreachProvider,
  useOutreach,
  useOptionalOutreach,
  type OutreachContextValue,
  type OutreachProviderProps,
} from './store';

export { MerchantPanel, type MerchantPanelProps } from './MerchantPanel';
export { PublicNoticeCard, type PublicNoticeCardProps } from './PublicNoticeCard';
export {
  BqNodeSheet,
  buildDeterministicQrMatrix,
  type BqNodeSheetProps,
} from './BqNodeSheet';
export { LocalAssistant, type LocalAssistantProps } from './LocalAssistant';

export {
  recalculateState,
  createInitialOutreachState,
  applyMarketUpdate,
  applyPhysicalAck,
  togglePreventivePause,
  advanceClock,
  setPolicy,
  switchScenario,
  resetScenario,
  answerLocalAiQuestion,
} from './engine.mjs';

export {
  PROFILE_LABELS,
  ILLUSTRATIVE_JOBS,
  SCENARIO_CONFIGS,
  createScenarioSeed,
  formatTickTimestamp,
} from './data.mjs';

export type {
  ProfileLabelMeta,
  ScenarioDemandConfig,
  ScenarioConfig,
  ScenarioSeed,
  ScenarioId,
  PolicyId,
  PublicProfileId,
  EngineProfileId,
  MerchantStatus,
  MerchantCategory,
  Merchant,
  CorridorResource,
  RouteServices,
  RouteOption,
  AllocationSummary,
  PublicNotice,
  VolunteerRole,
  PhysicalAckRecord,
  BqNodeStation,
  JobOpportunity,
  OutreachCommandType,
  OutreachAuditEntry,
  LocalAiResponse,
  OutreachState,
  CommandResult,
  MarketUpdatePayload,
  PhysicalAckPayload,
  PreventivePausePayload,
  ClockAdvancePayload,
  PolicyChangePayload,
  OutreachExternalAdapter,
} from './types';
