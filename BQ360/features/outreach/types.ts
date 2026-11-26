export type ScenarioId = 'metro-exit-v1' | 'metro-entry-v1';

export type PolicyId = 'shortest' | 'balanced' | 'intervention';

export type PublicProfileId =
  | 'turista'
  | 'ciudadano'
  | 'movilidad_reducida'
  | 'prensa';

export type EngineProfileId = 'flex' | 'access' | 'press';

export type MerchantStatus = 'open' | 'closed' | 'expired';

export type MerchantCategory =
  | 'gastronomia'
  | 'artesania'
  | 'hidratacion'
  | 'servicios';

export interface Merchant {
  id: string;
  name: string;
  corridorId: string;
  routeIds: string[];
  zone: string;
  category: MerchantCategory;
  capacity: number;
  occupied: number;
  status: MerchantStatus;
  validUntilTick: number;
  accessible: boolean;
  freeOrientationNoPurchase: boolean;
  rotationPriority: number;
  services: string[];
  lastUpdatedAt: string;
}

export interface CorridorResource {
  id: string;
  name: string;
  kind: 'space' | 'passage' | 'service';
  capacity: number;
  assigned: number;
  status: 'active' | 'preventive_pause' | 'verified_closure';
  pauseReason?: string;
  accessible: boolean;
}

export interface RouteServices {
  hydration: string;
  health: string;
  culture: string;
  green: string;
}

export interface RouteOption {
  id: string;
  code: string;
  name: string;
  corridor: string;
  travelMinutes: number;
  accessible: boolean;
  sharedCrossingId?: string;
  destinationId: string;
  merchantIds: string[];
  services: RouteServices;
  status: 'active' | 'degraded' | 'paused' | 'closed';
  invalidationReason?: string;
  assignedTotal: number;
  assignedFlex: number;
  assignedAccess: number;
}

export interface AllocationSummary {
  totalDemand: number;
  flexDemand: number;
  accessDemand: number;
  assignedTotal: number;
  pendingTotal: number;
  pendingFlex: number;
  pendingAccess: number;
  pendingReason?: string;
  sharedCrossingUsed: number;
  sharedCrossingCapacity: number;
}

export interface PublicNotice {
  id: string;
  version: number;
  profileId: PublicProfileId;
  engineProfile: EngineProfileId;
  scenarioId: ScenarioId;
  routeId: string | null;
  routeName: string;
  status: 'active' | 'recalculated' | 'pending_specific_attention' | 'paused';
  headline: string;
  reason: string;
  servicesIncluded: string[];
  openMerchants: Merchant[];
  validUntilTick: number;
  issuedAt: string;
  supersededByVersion?: number;
}

export type VolunteerRole =
  | 'Voluntario de campo'
  | 'Enlace comunitario'
  | 'Coordinador de nodo';

export interface PhysicalAckRecord {
  id: string;
  commandId: string;
  nodeId: string;
  removedVersion: number;
  postedVersion: number;
  volunteerName: string;
  volunteerRole: VolunteerRole;
  timestamp: string;
  note?: string;
}

export interface BqNodeStation {
  id: string;
  name: string;
  zone: string;
  linkedRouteIds: string[];
  digitalVersion: number;
  physicalVersion: number;
  status: 'current' | 'pending_physical_withdrawal';
  invalidatedAt?: string;
  invalidationReason?: string;
  qrPayload: string;
  lastAck?: PhysicalAckRecord;
}

export interface JobOpportunity {
  id: string;
  title: string;
  organization: string;
  corridorZone: string;
  modality: 'Voluntariado' | 'Capacitación' | 'Empleo local';
  schedule: string;
  partnerStatus: 'Ilustrativo — sin convenio confirmado';
  description: string;
  accessible: boolean;
}

export type OutreachCommandType =
  | 'market.update'
  | 'node.ack'
  | 'incident.pause'
  | 'clock.advance'
  | 'policy.change'
  | 'scenario.change'
  | 'system.reset';

export interface OutreachAuditEntry {
  id: string;
  commandId: string;
  commandType: OutreachCommandType;
  actorRole: string;
  summary: string;
  timestamp: string;
  versionAfter: number;
}

export interface LocalAiResponse {
  answer: string;
  evidence: string[];
  referencedResources: string[];
  noticeVersion: number;
  disclaimer: string;
}

export interface OutreachState {
  scenarioId: ScenarioId;
  scenarioLabel: string;
  scenarioDescription: string;
  policy: PolicyId;
  interventionAccessible: boolean;
  currentTick: number;
  noticeVersion: number;
  lastRecalculationReason: string;
  resources: CorridorResource[];
  routes: RouteOption[];
  allocation: AllocationSummary;
  merchants: Merchant[];
  notices: Record<PublicProfileId, PublicNotice>;
  nodes: BqNodeStation[];
  ackHistory: PhysicalAckRecord[];
  jobs: JobOpportunity[];
  auditLog: OutreachAuditEntry[];
  processedCommandIds: string[];
}

export interface CommandResult {
  ok: boolean;
  error?: string;
  state: OutreachState;
}

export interface MarketUpdatePayload {
  merchantId: string;
  status?: MerchantStatus;
  capacity?: number;
  validUntilTick?: number;
  actorRole?: string;
  commandId?: string;
}

export interface PhysicalAckPayload {
  nodeId: string;
  volunteerName: string;
  volunteerRole: VolunteerRole;
  removedVersion: number;
  note?: string;
  commandId?: string;
}

export interface PreventivePausePayload {
  resourceId: string;
  paused: boolean;
  reason?: string;
  actorRole?: string;
  commandId?: string;
}

export interface ClockAdvancePayload {
  commandId?: string;
  actorRole?: string;
}

export interface PolicyChangePayload {
  policy: PolicyId;
  interventionAccessible?: boolean;
  actorRole?: string;
  commandId?: string;
}

export interface OutreachExternalAdapter {
  externalState?: OutreachState;
  onMarketUpdate?: (payload: MarketUpdatePayload) => CommandResult | void;
  onPhysicalAck?: (payload: PhysicalAckPayload) => CommandResult | void;
  onTogglePause?: (payload: PreventivePausePayload) => CommandResult | void;
  onSetPolicy?: (payload: PolicyChangePayload) => CommandResult | void;
  onAdvanceClock?: (payload?: ClockAdvancePayload) => CommandResult | void;
  onSwitchScenario?: (scenarioId: ScenarioId) => CommandResult | void;
  onResetScenario?: (scenarioId?: ScenarioId) => CommandResult | void;
}

export interface ProfileLabelMeta {
  id: PublicProfileId;
  label: string;
  engineProfile: EngineProfileId;
  description: string;
}

export interface ScenarioDemandConfig {
  totalDemand: number;
  flexDemand: number;
  accessDemand: number;
}

export interface ScenarioConfig {
  scenarioId: ScenarioId;
  scenarioLabel: string;
  scenarioDescription: string;
  defaultPolicy: PolicyId;
  defaultInterventionAccessible: boolean;
  demand: ScenarioDemandConfig;
  sharedCrossingId: string;
  resources: CorridorResource[];
  routes: RouteOption[];
  merchants: Merchant[];
  nodes: BqNodeStation[];
}

export interface ScenarioSeed extends ScenarioConfig {
  jobs: JobOpportunity[];
  issuedAt: string;
}
