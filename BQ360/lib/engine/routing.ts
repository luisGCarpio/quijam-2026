export type Profile = "flex" | "access" | "press";

export interface RouteSpec {
  id: string;
  destination?: string;
  compatibleProfiles?: Profile[];
  accessible?: boolean;
  paused?: boolean;
  cost?: number;
  distance?: number;
  capacity?: number;
  resources?: string[];
  crossing?: string;
}

export interface RoutingOptions {
  accessibilityRequired?: boolean;
  pausedRouteIds?: Iterable<string>;
  accessibleResourceIds?: Iterable<string>;
}

export function isRouteEligible(
  route: RouteSpec,
  profile: Profile = "flex",
  options: RoutingOptions = {},
) {
  if (route.paused) return false;
  if (options.pausedRouteIds && [...options.pausedRouteIds].includes(route.id)) return false;

  if (profile === "access") {
    if (route.accessible !== true) return false;
    if (route.compatibleProfiles && !route.compatibleProfiles.includes("access")) return false;
  } else if (route.compatibleProfiles && !route.compatibleProfiles.includes(profile)) {
    return false;
  }

  if (options.accessibilityRequired) {
    if (!route.accessible) return false;
  }

  if (route.resources && options.accessibleResourceIds) {
    const ids = new Set(options.accessibleResourceIds);
    if (route.resources.some((id) => /access|accessible|c/i.test(id)) && !route.resources.every((id) => ids.has(id) || !/access|accessible|c/i.test(id))) {
      return false;
    }
  }
  return true;
}

export function routeCost(route: RouteSpec) {
  return route.cost ?? route.distance ?? 0;
}

export function findEligibleRoutes(
  routes: RouteSpec[],
  profile: Profile,
  options: RoutingOptions = {},
) {
  return routes
    .filter((route) => isRouteEligible(route, profile, options))
    .sort((a, b) => routeCost(a) - routeCost(b) || a.id.localeCompare(b.id));
}

export function sharedCrossingCost(
  routeIds: Iterable<string>,
  crossingCapacity: number,
  loadByRoute: Record<string, number>,
) {
  const ids = [...new Set([...routeIds])];
  const combinedLoad = ids.reduce((sum, id) => sum + (loadByRoute[id] ?? 0), 0);
  return Math.min(combinedLoad, crossingCapacity);
}
