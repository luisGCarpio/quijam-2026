import { findEligibleRoutes, RouteSpec, Profile } from "./routing";

export type AllocationPolicy = "shortest" | "balanced" | "intervention";

export interface DemandInput {
  flex?: number;
  access?: number;
  press?: number;
}

export interface AllocationResult {
  assigned: number;
  pending: number;
  allocations: Record<string, number>;
  pendingByProfile: Record<string, number>;
  pendingByReason: Record<string, number>;
  sharedCrossingLoads: Record<string, number>;
  policy: AllocationPolicy;
  profiles: { flex: number; access: number; press: number };
}

export interface AllocationOptions {
  pausedRouteIds?: Iterable<string>;
  accessible?: boolean;
  dAccessible?: boolean;
  rotationIndex?: number;
  sharedCrossing?: { id: string; capacity: number };
  crossingLoads?: Record<string, number>;
}

export const defaultMetroExitRoutes: RouteSpec[] = [
  { id: "A", destination: "Av. Murillo", capacity: 50, cost: 1, compatibleProfiles: ["flex", "press"], accessible: false, crossing: undefined },
  { id: "B", destination: "Transmetro Sur", capacity: 250, cost: 2, compatibleProfiles: ["flex", "press"], accessible: false, crossing: "cross-BC" },
  { id: "C", destination: "El Prado / Gran Malecón", capacity: 180, cost: 3, compatibleProfiles: ["flex", "access", "press"], accessible: true, crossing: "cross-BC" },
  { id: "D", destination: "Calle 30 / Gran Malecón", capacity: 200, cost: 4, compatibleProfiles: ["flex", "access", "press"], accessible: true, crossing: undefined },
];

function nonNegative(value: number | undefined) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value ?? 0)) : 0;
}

function normalizeDemand(demand: DemandInput | number) {
  if (typeof demand === "number") return { flex: demand, access: 0, press: 0 };
  return {
    flex: nonNegative(demand.flex),
    access: nonNegative(demand.access),
    press: nonNegative(demand.press),
  };
}

export function allocateDemand(
  demand: DemandInput | number,
  policy: AllocationPolicy = "balanced",
  routes: RouteSpec[] = defaultMetroExitRoutes,
  options: AllocationOptions = {},
) {
  const counts = normalizeDemand(demand);
  const allocations: Record<string, number> = Object.fromEntries(routes.map((route) => [route.id, 0]));
  const pendingByProfile: Record<string, number> = { flex: 0, access: 0, press: 0 };
  const pendingByReason: Record<string, number> = {};
  const pending = (profile: Profile, amount: number, reason: string) => {
    pendingByProfile[profile] += amount;
    pendingByReason[reason] = (pendingByReason[reason] ?? 0) + amount;
  };

  const paused = new Set(options.pausedRouteIds ? [...options.pausedRouteIds] : []);
  const availableRoutes = routes.map((route) => ({
    ...route,
    paused: route.paused || paused.has(route.id) || (route.id === "D" && options.dAccessible === false),
  }));

  const remaining = new Map(availableRoutes.map((route) => [route.id, nonNegative(route.capacity)]));
  let accessCount = counts.access;
  let flexCount = counts.flex;
  let pressCount = counts.press;

  if (policy === "shortest") {
    const eligible = findEligibleRoutes(availableRoutes, "flex", { pausedRouteIds: paused });
    const routeA = eligible.find((route) => route.id === "A") ?? eligible[0];
    if (routeA) {
      const room = remaining.get(routeA.id) ?? 0;
      const taken = Math.min(flexCount, room);
      allocations[routeA.id] += taken;
      flexCount -= taken;
    }
    pending("flex", flexCount, "no_shortest_route_capacity");
    pending("access", accessCount, "no_compatible_route");
    pending("press", pressCount, "no_shortest_route_capacity");
  } else if (policy === "intervention") {
    const dRoute = availableRoutes.find((route) => route.id === "D");
    if (dRoute && dRoute.paused !== true && dRoute.accessible) {
      remaining.set("D", nonNegative(dRoute.capacity));
    } else {
      remaining.set("D", 0);
    }

    const routeA = availableRoutes.find((route) => route.id === "A");
    if (routeA) {
      const taken = Math.min(flexCount + pressCount, remaining.get("A") ?? 0);
      const takeFlex = Math.min(flexCount, taken);
      const takePress = taken - takeFlex;
      allocations.A += taken;
      flexCount -= takeFlex;
      pressCount -= takePress;
      remaining.set("A", (remaining.get("A") ?? 0) - taken);
    }
    const routeB = availableRoutes.find((route) => route.id === "B");
    if (routeB) {
      const taken = Math.min(flexCount + pressCount, remaining.get("B") ?? 0);
      const takeFlex = Math.min(flexCount, taken);
      const takePress = taken - takeFlex;
      allocations.B += taken;
      flexCount -= takeFlex;
      pressCount -= takePress;
      remaining.set("B", (remaining.get("B") ?? 0) - taken);
    }
    if (dRoute) {
      const takeAccess = Math.min(accessCount, remaining.get("D") ?? 0);
      allocations.D += takeAccess;
      accessCount -= takeAccess;
      remaining.set("D", (remaining.get("D") ?? 0) - takeAccess);

      const takeFlex = Math.min(flexCount + pressCount, remaining.get("D") ?? 0);
      const takeFlexOnly = Math.min(flexCount, takeFlex);
      const takePress = takeFlex - takeFlexOnly;
      allocations.D += takeFlex;
      flexCount -= takeFlexOnly;
      pressCount -= takePress;
    }
    pending("flex", flexCount, "no_compatible_route");
    pending("access", accessCount, "no_compatible_route");
    pending("press", pressCount, "no_compatible_route");
  } else {
    // Access profiles are scarce: reserve C before any flexible group is considered.
    const routeC = availableRoutes.find((route) => route.id === "C");
    if (routeC && !routeC.paused && routeC.accessible) {
      const taken = Math.min(accessCount, remaining.get("C") ?? 0);
      allocations.C += taken;
      accessCount -= taken;
      remaining.set("C", (remaining.get("C") ?? 0) - taken);
    } else {
      pending("access", accessCount, "no_compatible_route");
      accessCount = 0;
    }

    const routeA = availableRoutes.find((route) => route.id === "A");
    if (routeA) {
      let available = remaining.get("A") ?? 0;
      const taken = Math.min(flexCount + pressCount, available);
      const takeFlex = Math.min(flexCount, taken);
      const takePress = taken - takeFlex;
      allocations.A += taken;
      flexCount -= takeFlex;
      pressCount -= takePress;
      remaining.set("A", available - taken);
    }
    const routeB = availableRoutes.find((route) => route.id === "B");
    if (routeB) {
      let available = remaining.get("B") ?? 0;
      const taken = Math.min(flexCount + pressCount, available);
      const takeFlex = Math.min(flexCount, taken);
      const takePress = taken - takeFlex;
      allocations.B += taken;
      flexCount -= takeFlex;
      pressCount -= takePress;
      remaining.set("B", available - taken);
    }
    if (routeC && !routeC.paused && routeC.accessible) {
      let available = remaining.get("C") ?? 0;
      const taken = Math.min(flexCount + pressCount, available);
      const takeFlex = Math.min(flexCount, taken);
      const takePress = taken - takeFlex;
      allocations.C += taken;
      flexCount -= takeFlex;
      pressCount -= takePress;
      remaining.set("C", available - taken);
    }
    pending("flex", flexCount, "no_compatible_route");
    pending("press", pressCount, "no_compatible_route");
  }

  const pendingByProfileTotal = pendingByProfile.flex + pendingByProfile.access + pendingByProfile.press;
  const assigned = Object.values(allocations).reduce((sum, value) => sum + value, 0);

  const crossing = options.sharedCrossing ?? { id: "cross-BC", capacity: 430 };
  const bLoad = allocations.B ?? 0;
  const cLoad = allocations.C ?? 0;
  const sharedCrossingLoads = {
    [crossing.id]: Math.min(crossing.capacity, bLoad + cLoad),
  };

  return {
    assigned,
    pending: pendingByProfileTotal,
    allocations,
    pendingByProfile,
    pendingByReason,
    sharedCrossingLoads,
    policy,
    profiles: { flex: counts.flex, access: counts.access, press: counts.press },
  } satisfies AllocationResult;
}

export const allocate = allocateDemand;
export const calculateAllocation = allocateDemand;
