import { allocateDemand, AllocationPolicy, AllocationOptions, AllocationResult, DemandInput } from "./allocation";
import { RouteSpec } from "./routing";

export type Cohort = "recommended" | "inTransit" | "arrived" | "pending";

export interface SimulationState {
  tick: number;
  policy: AllocationPolicy;
  demand: DemandInput;
  cohorts: Record<Cohort, number>;
  allocation: AllocationResult;
  inTransitIds: string[];
  history: Array<{ tick: number; allocation: AllocationResult }>;
}

export interface SimulationOptions extends AllocationOptions {
  arrivalRate?: number;
  recommendedToTransitRate?: number;
}

export function createSimulationState(
  demand: DemandInput = { flex: 400, access: 100 },
  policy: AllocationPolicy = "balanced",
  routes?: RouteSpec[],
  options: SimulationOptions = {},
) {
  const allocation = allocateDemand(demand, policy, routes, options);
  return {
    tick: 0,
    policy,
    demand,
    cohorts: {
      recommended: allocation.assigned,
      inTransit: 0,
      arrived: 0,
      pending: allocation.pending,
    },
    allocation,
    inTransitIds: [],
    history: [{ tick: 0, allocation }],
  } satisfies SimulationState;
}

export function advanceSimulation(
  state: SimulationState,
  demand: DemandInput = state.demand,
  routes?: RouteSpec[],
  options: SimulationOptions = {},
) {
  const transitCount = Math.floor(state.cohorts.recommended * (options.recommendedToTransitRate ?? 0));
  const nextTransit = state.cohorts.inTransit + transitCount;
  const arrivals = Math.floor(nextTransit * (options.arrivalRate ?? 0));
  const arrived = state.cohorts.arrived + arrivals;
  const inTransit = nextTransit - arrivals;

  const recalculation = allocateDemand(demand, state.policy, routes, options);
  const reallocatable = recalculation.pending;
  const result = {
    ...recalculation,
    assigned: recalculation.assigned,
  };

  const next: SimulationState = {
    ...state,
    tick: state.tick + 1,
    demand,
    allocation: result,
    cohorts: {
      recommended: reallocatable,
      inTransit,
      arrived,
      pending: reallocatable,
    },
    inTransitIds: state.inTransitIds,
    history: [...state.history, { tick: state.tick + 1, allocation: result }],
  };
  return next;
}

export function runSimulation(
  demand: DemandInput,
  policy: AllocationPolicy,
  ticks = 1,
  routes?: RouteSpec[],
  options: SimulationOptions = {},
) {
  let state = createSimulationState(demand, policy, routes, options);
  for (let index = 0; index < ticks; index += 1) {
    state = advanceSimulation(state, demand, routes, options);
  }
  return state;
}

export const simulateTick = advanceSimulation;
