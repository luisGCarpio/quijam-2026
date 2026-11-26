import type {
  JobOpportunity,
  ProfileLabelMeta,
  PublicProfileId,
  ScenarioConfig,
  ScenarioDemandConfig,
  ScenarioId,
  ScenarioSeed,
} from './types';

export type {
  ProfileLabelMeta,
  ScenarioConfig,
  ScenarioDemandConfig,
  ScenarioSeed,
};

export declare function formatTickTimestamp(
  tick: number,
  extraMinutes?: number
): string;

export declare const PROFILE_LABELS: Record<PublicProfileId, ProfileLabelMeta>;

export declare const ILLUSTRATIVE_JOBS: JobOpportunity[];

export declare const SCENARIO_CONFIGS: Record<ScenarioId, ScenarioConfig>;

export declare function createScenarioSeed(scenarioId?: ScenarioId): ScenarioSeed;
