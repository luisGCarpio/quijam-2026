// Pure deterministic ESM engine for BQ360 Outreach (no React/DOM imports).
import {
  PROFILE_LABELS,
  SCENARIO_CONFIGS,
  createScenarioSeed,
  formatTickTimestamp,
} from './data.mjs';

const VALID_POLICIES = new Set(['shortest', 'balanced', 'intervention']);
const VALID_ROLES = new Set([
  'Voluntario de campo',
  'Enlace comunitario',
  'Coordinador de nodo',
]);

/**
 * Deep clone helper safe across Node 24 and browsers.
 * @template T
 * @param {T} value
 * @returns {T}
 */
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Normalizes Spanish text for deterministic keyword matching in BQ AI.
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Checks whether a merchant is currently open and valid for the given tick.
 * Requires positive remaining capacity (capacity > occupied).
 * @param {import('./types').Merchant} merchant
 * @param {number} currentTick
 * @returns {boolean}
 */
function isMerchantOpen(merchant, currentTick) {
  return (
    merchant.status === 'open' &&
    merchant.capacity > 0 &&
    merchant.capacity > merchant.occupied &&
    currentTick <= merchant.validUntilTick
  );
}

/**
 * Checks whether a route is eligible under the active balancing policy and not paused/closed.
 * @param {import('./types').RouteOption | undefined} route
 * @param {import('./types').PolicyId} policy
 * @returns {boolean}
 */
function isRouteAllowedByPolicy(route, policy) {
  if (!route || route.status === 'paused' || route.status === 'closed') {
    return false;
  }
  if (policy === 'shortest') {
    return route.code === 'A';
  }
  if (policy === 'balanced') {
    return route.code !== 'D';
  }
  return true;
}

/**
 * Returns sorted open merchants for a route.
 * @param {import('./types').RouteOption} route
 * @param {import('./types').Merchant[]} merchants
 * @param {number} currentTick
 */
function getOpenMerchantsForRoute(route, merchants, currentTick) {
  const allowed = new Set(route.merchantIds || []);
  return merchants
    .filter((m) => allowed.has(m.id) && isMerchantOpen(m, currentTick))
    .sort((a, b) => a.rotationPriority - b.rotationPriority);
}

/**
 * Marks BQ Nodes linked to any affected route as pending physical withdrawal.
 * Keeps physicalVersion unchanged so physicalVersion < digitalVersion.
 * @param {import('./types').BqNodeStation[]} nodes
 * @param {string[]} affectedRouteIds
 * @param {number} newVersion
 * @param {string} timestamp
 * @param {string} reason
 * @param {import('./types').ScenarioId} scenarioId
 */
function flagAffectedNodes(
  nodes,
  affectedRouteIds,
  newVersion,
  timestamp,
  reason,
  scenarioId
) {
  const affected = new Set(affectedRouteIds);
  for (const node of nodes) {
    const intersects = node.linkedRouteIds.some((rid) => affected.has(rid));
    if (intersects) {
      node.digitalVersion = newVersion;
      node.status = 'pending_physical_withdrawal';
      node.invalidatedAt = timestamp;
      node.invalidationReason = reason;
      node.qrPayload = `BQ360|${node.id}|${scenarioId}|v${newVersion}`;
    }
  }
}

/**
 * Builds public notices per Barranquilla citizen profile from recalculated state.
 * @param {import('./types').OutreachState} state
 * @returns {Record<import('./types').PublicProfileId, import('./types').PublicNotice>}
 */
function buildNotices(state) {
  const issuedAt = formatTickTimestamp(state.currentTick);
  const validUntilTick = state.currentTick + 2;
  const routesByCode = new Map(state.routes.map((r) => [r.code, r]));

  const pickPreferredFlexRoute = (preferredCodes) => {
    for (const code of preferredCodes) {
      const route = routesByCode.get(code);
      if (isRouteAllowedByPolicy(route, state.policy) && route.assignedTotal > 0) {
        return route;
      }
    }
    for (const code of preferredCodes) {
      const route = routesByCode.get(code);
      if (isRouteAllowedByPolicy(route, state.policy)) {
        return route;
      }
    }
    return null;
  };

  const pickAccessRoute = () => {
    const accessibleAssigned = state.routes.filter(
      (r) =>
        r.accessible &&
        r.status !== 'paused' &&
        r.status !== 'closed' &&
        r.assignedAccess > 0
    );
    if (accessibleAssigned.length > 0) {
      return accessibleAssigned[0];
    }
    return null;
  };

  const baseStatus = (route) => {
    if (!route) {
      return 'paused';
    }
    return state.noticeVersion > 1 ? 'recalculated' : 'active';
  };

  const formatRouteServices = (route) => [
    route.services.hydration,
    route.services.health,
    route.services.culture,
    route.services.green,
  ];

  // 1. Turista
  const turistaRoute = pickPreferredFlexRoute(['C', 'D', 'B', 'A']);
  const turistaMerchants = turistaRoute
    ? getOpenMerchantsForRoute(turistaRoute, state.merchants, state.currentTick)
    : [];

  const turistaNotice = {
    id: `notice-turista-v${state.noticeVersion}`,
    version: state.noticeVersion,
    profileId: 'turista',
    engineProfile: PROFILE_LABELS.turista.engineProfile,
    scenarioId: state.scenarioId,
    routeId: turistaRoute ? turistaRoute.id : null,
    routeName: turistaRoute ? turistaRoute.name : 'Corredores en pausa temporal',
    status: baseStatus(turistaRoute),
    headline: turistaRoute
      ? `Ruta sugerida ${turistaRoute.code}: ${turistaRoute.corridor} (${turistaRoute.travelMinutes} min)`
      : 'Corredores turísticos en pausa preventiva',
    reason: turistaRoute
      ? turistaRoute.invalidationReason ||
        `Asignación vigente bajo política "${state.policy}". Orientación gratuita sin obligación de compra.`
      : 'Todos los corredores disponibles están en pausa preventiva; siga indicaciones de BQ Nodes y líneas 123/125.',
    servicesIncluded: turistaRoute
      ? formatRouteServices(turistaRoute)
      : ['Punto de hidratación BQ — Zona segura Estadio', 'Línea de emergencias 123 / Salud 125'],
    openMerchants: turistaMerchants,
    validUntilTick,
    issuedAt,
  };

  // 2. Ciudadano
  const ciudadanoRoute = pickPreferredFlexRoute(['B', 'A', 'D', 'C']);
  const ciudadanoMerchants = ciudadanoRoute
    ? getOpenMerchantsForRoute(ciudadanoRoute, state.merchants, state.currentTick)
    : [];

  const ciudadanoNotice = {
    id: `notice-ciudadano-v${state.noticeVersion}`,
    version: state.noticeVersion,
    profileId: 'ciudadano',
    engineProfile: PROFILE_LABELS.ciudadano.engineProfile,
    scenarioId: state.scenarioId,
    routeId: ciudadanoRoute ? ciudadanoRoute.id : null,
    routeName: ciudadanoRoute ? ciudadanoRoute.name : 'Sin corredor ciudadano activo',
    status: baseStatus(ciudadanoRoute),
    headline: ciudadanoRoute
      ? `Conexión recomendada Ruta ${ciudadanoRoute.code}: ${ciudadanoRoute.corridor}`
      : 'Corredores ciudadanos en pausa preventiva',
    reason: ciudadanoRoute
      ? ciudadanoRoute.invalidationReason ||
        `${ciudadanoRoute.assignedTotal} personas asignadas en este corredor. Orientación gratuita sin obligación de compra.`
      : 'Espere reapertura verificada en BQ Nodes o consulte el punto de hidratación más cercano.',
    servicesIncluded: ciudadanoRoute
      ? formatRouteServices(ciudadanoRoute)
      : ['Punto de hidratación BQ', 'Atención 123 / 125 / 119'],
    openMerchants: ciudadanoMerchants,
    validUntilTick,
    issuedAt,
  };

  // 3. Movilidad reducida
  const accessRoute = pickAccessRoute();
  const accessMerchants = accessRoute
    ? getOpenMerchantsForRoute(accessRoute, state.merchants, state.currentTick)
    : [];

  const accessPending = state.allocation.pendingAccess > 0 && !accessRoute;
  const accessNotice = {
    id: `notice-movilidad_reducida-v${state.noticeVersion}`,
    version: state.noticeVersion,
    profileId: 'movilidad_reducida',
    engineProfile: PROFILE_LABELS.movilidad_reducida.engineProfile,
    scenarioId: state.scenarioId,
    routeId: accessRoute ? accessRoute.id : null,
    routeName: accessRoute
      ? accessRoute.name
      : 'Pendiente de atención específica (sin ruta accesible activa)',
    status: accessPending || !accessRoute ? 'pending_specific_attention' : baseStatus(accessRoute),
    headline: accessRoute
      ? `Acceso prioritario garantizado: Ruta ${accessRoute.code} (${accessRoute.assignedAccess} cupos accesibles)`
      : 'Atención específica requerida: sin ruta accesible compatible disponible',
    reason: accessRoute
      ? accessRoute.invalidationReason ||
        `Reserva prioritaria activa para ${state.allocation.accessDemand - state.allocation.pendingAccess} de ${state.allocation.accessDemand} personas con movilidad reducida.`
      : state.allocation.pendingReason ||
        'Corredor accesible pausado o sin accesibilidad habilitada; se requiere asistencia directa en BQ Node y atención CRUE 125.',
    servicesIncluded: accessRoute
      ? formatRouteServices(accessRoute)
      : [
          'Línea prioritaria de salud CRUE 125 / Emergencias 123',
          'Punto de hidratación BQ con sombra y asiento preferencial',
          'Asistencia presencial en BQ Node más cercano',
        ],
    openMerchants: accessMerchants,
    validUntilTick,
    issuedAt,
  };

  // 4. Prensa
  const pressRoute = pickPreferredFlexRoute(['C', 'B', 'D', 'A']);
  const pressMerchants = pressRoute
    ? getOpenMerchantsForRoute(pressRoute, state.merchants, state.currentTick)
    : [];
  const closedNames = state.resources
    .filter((r) => r.status === 'verified_closure')
    .map((r) => r.name);
  const pausedNames = state.resources
    .filter((r) => r.status === 'preventive_pause')
    .map((r) => r.name);
  const incidentSegments = [];
  if (closedNames.length > 0) {
    incidentSegments.push(`Cierre oficial verificado en: ${closedNames.join('; ')}`);
  }
  if (pausedNames.length > 0) {
    incidentSegments.push(`Pausa preventiva activa en: ${pausedNames.join('; ')}`);
  }

  const pressNotice = {
    id: `notice-prensa-v${state.noticeVersion}`,
    version: state.noticeVersion,
    profileId: 'prensa',
    engineProfile: PROFILE_LABELS.prensa.engineProfile,
    scenarioId: state.scenarioId,
    routeId: pressRoute ? pressRoute.id : null,
    routeName: pressRoute ? pressRoute.name : 'Operación en pausa general',
    status: !pressRoute
      ? 'paused'
      : state.noticeVersion > 1
        ? 'recalculated'
        : 'active',
    headline: `Boletín v${state.noticeVersion}: ${state.allocation.assignedTotal}/${state.allocation.totalDemand} asignados · ${state.allocation.pendingTotal} pendientes`,
    reason:
      incidentSegments.length > 0
        ? `Datos simulados — ${incidentSegments.join('. ')}. Motivo: ${state.lastRecalculationReason}`
        : `Datos simulados — Política "${state.policy}". Cruce compartido: ${state.allocation.sharedCrossingUsed}/${state.allocation.sharedCrossingCapacity}.`,
    servicesIncluded: [
      'Líneas oficiales Barranquilla: 123 Policía · 125 Salud/CRUE · 119 Bomberos',
      `Cruce compartido: ${state.allocation.sharedCrossingUsed}/${state.allocation.sharedCrossingCapacity} plazas`,
      'Datos simulados de operación urbana BQ360',
    ],
    openMerchants: pressMerchants,
    validUntilTick,
    issuedAt,
  };

  return {
    turista: turistaNotice,
    ciudadano: ciudadanoNotice,
    movilidad_reducida: accessNotice,
    prensa: pressNotice,
  };
}

/**
 * Pure deterministic recalculation of corridor capacities, shared crossing,
 * inclusive priority allocation (access first), merchant status, and public notices.
 *
 * @param {import('./types').OutreachState} state
 * @param {string} [reason]
 * @returns {import('./types').OutreachState}
 */
export function recalculateState(state, reason) {
  const next = deepClone(state);
  if (reason) {
    next.lastRecalculationReason = reason;
  }

  const cfg = SCENARIO_CONFIGS[next.scenarioId] || SCENARIO_CONFIGS['metro-exit-v1'];
  const flexDemand = cfg.demand.flexDemand;
  const accessDemand = cfg.demand.accessDemand;
  const totalDemand = cfg.demand.totalDemand;

  const resourceById = new Map(next.resources.map((r) => [r.id, r]));

  // Reset resource assigned counters
  for (const res of next.resources) {
    res.assigned = 0;
    if (res.id === 'dest-D') {
      res.accessible = Boolean(next.interventionAccessible);
    }
  }

  // Determine route eligibility and status
  const remainingDestCap = new Map();
  const remainingCrossingCap = new Map();
  for (const res of next.resources) {
    const cap = res.status === 'active' ? res.capacity : 0;
    if (res.kind === 'passage') {
      remainingCrossingCap.set(res.id, cap);
    } else {
      remainingDestCap.set(res.id, cap);
    }
  }

  for (const route of next.routes) {
    route.assignedTotal = 0;
    route.assignedFlex = 0;
    route.assignedAccess = 0;

    if (route.id === 'route-D') {
      route.accessible = Boolean(next.interventionAccessible);
    }

    const destRes = resourceById.get(route.destinationId);
    const crossRes = route.sharedCrossingId
      ? resourceById.get(route.sharedCrossingId)
      : null;

    const openMerchants = getOpenMerchantsForRoute(
      route,
      next.merchants,
      next.currentTick
    );

    if (destRes && destRes.status === 'verified_closure') {
      route.status = 'closed';
      route.invalidationReason =
        destRes.pauseReason || 'Cierre oficial verificado en el corredor.';
    } else if (crossRes && crossRes.status === 'verified_closure') {
      route.status = 'closed';
      route.invalidationReason =
        crossRes.pauseReason || 'Cierre oficial verificado en el cruce compartido.';
    } else if (destRes && destRes.status === 'preventive_pause') {
      route.status = 'paused';
      route.invalidationReason =
        destRes.pauseReason || 'Pausa preventiva activa en el corredor.';
    } else if (crossRes && crossRes.status === 'preventive_pause') {
      route.status = 'paused';
      route.invalidationReason =
        crossRes.pauseReason || 'Pausa preventiva activa en el cruce compartido.';
    } else if (route.merchantIds.length > 0 && openMerchants.length === 0) {
      route.status = 'degraded';
      route.invalidationReason =
        'Opción comercial cerrada o vencida en este corredor; tránsito y orientación gratuita sin compra continúan habilitados.';
    } else {
      route.status = 'active';
      route.invalidationReason = undefined;
    }
  }

  // Policy filter:
  // - shortest: only route A (code === 'A')
  // - balanced: A, B, C
  // - intervention: A, B, C, D
  const eligibleRoutes = next.routes.filter((route) =>
    isRouteAllowedByPolicy(route, next.policy)
  );

  const getAvailableRouteCap = (route) => {
    const dCap = remainingDestCap.get(route.destinationId) ?? 0;
    if (!route.sharedCrossingId) {
      return dCap;
    }
    const cCap = remainingCrossingCap.get(route.sharedCrossingId) ?? 0;
    return Math.min(dCap, cCap);
  };

  const consumeRouteCap = (route, amount) => {
    if (amount <= 0) return;
    remainingDestCap.set(
      route.destinationId,
      (remainingDestCap.get(route.destinationId) ?? 0) - amount
    );
    if (route.sharedCrossingId) {
      remainingCrossingCap.set(
        route.sharedCrossingId,
        (remainingCrossingCap.get(route.sharedCrossingId) ?? 0) - amount
      );
    }
  };

  // Phase 1: Reserve access demand FIRST on accessible eligible routes (C before D)
  let remainingAccess = accessDemand;
  const accessOrder = ['C', 'D', 'B', 'A'];
  for (const code of accessOrder) {
    if (remainingAccess <= 0) break;
    const route = eligibleRoutes.find((r) => r.code === code && r.accessible);
    if (!route) continue;
    const avail = getAvailableRouteCap(route);
    const take = Math.min(remainingAccess, avail);
    if (take > 0) {
      route.assignedAccess += take;
      route.assignedTotal += take;
      consumeRouteCap(route, take);
      remainingAccess -= take;
    }
  }

  // Phase 2: Assign flex demand across eligible routes (A -> B -> C -> D)
  let remainingFlex = flexDemand;
  const flexOrder = ['A', 'B', 'C', 'D'];
  for (const code of flexOrder) {
    if (remainingFlex <= 0) break;
    const route = eligibleRoutes.find((r) => r.code === code);
    if (!route) continue;
    const avail = getAvailableRouteCap(route);
    const take = Math.min(remainingFlex, avail);
    if (take > 0) {
      route.assignedFlex += take;
      route.assignedTotal += take;
      consumeRouteCap(route, take);
      remainingFlex -= take;
    }
  }

  // Recompute resource assigned counts from final route allocations
  for (const route of next.routes) {
    const destRes = resourceById.get(route.destinationId);
    if (destRes) {
      destRes.assigned += route.assignedTotal;
    }
    if (route.sharedCrossingId) {
      const crossRes = resourceById.get(route.sharedCrossingId);
      if (crossRes) {
        crossRes.assigned += route.assignedTotal;
      }
    }
  }

  const assignedTotal = next.routes.reduce((sum, r) => sum + r.assignedTotal, 0);
  const pendingFlex = remainingFlex;
  const pendingAccess = remainingAccess;
  const pendingTotal = pendingFlex + pendingAccess;

  const sharedCrossingRes = resourceById.get(cfg.sharedCrossingId);
  const sharedCrossingUsed = sharedCrossingRes ? sharedCrossingRes.assigned : 0;
  const sharedCrossingCapacity = sharedCrossingRes ? sharedCrossingRes.capacity : 0;

  let pendingReason;
  if (pendingTotal > 0) {
    if (pendingAccess > 0 && pendingFlex > 0) {
      pendingReason = `${pendingAccess} personas de movilidad reducida sin ruta accesible compatible y ${pendingFlex} personas flexibles por límite de capacidad.`;
    } else if (pendingAccess > 0) {
      pendingReason = `${pendingAccess} personas de movilidad reducida requieren atención específica: sin ruta accesible compatible activa.`;
    } else {
      pendingReason = `${pendingFlex} personas en espera por capacidad disponible bajo política "${next.policy}".`;
    }
  }

  next.allocation = {
    totalDemand,
    flexDemand,
    accessDemand,
    assignedTotal,
    pendingTotal,
    pendingFlex,
    pendingAccess,
    pendingReason,
    sharedCrossingUsed,
    sharedCrossingCapacity,
  };

  next.notices = buildNotices(next);
  return next;
}

/**
 * Creates a clean initial OutreachState for a given scenario.
 * @param {import('./types').ScenarioId} [scenarioId='metro-exit-v1']
 * @returns {import('./types').OutreachState}
 */
export function createInitialOutreachState(scenarioId = 'metro-exit-v1') {
  const seed = createScenarioSeed(scenarioId);
  /** @type {import('./types').OutreachState} */
  const baseState = {
    scenarioId: seed.scenarioId,
    scenarioLabel: seed.scenarioLabel,
    scenarioDescription: seed.scenarioDescription,
    policy: seed.defaultPolicy,
    interventionAccessible: seed.defaultInterventionAccessible,
    currentTick: 0,
    noticeVersion: 1,
    lastRecalculationReason: 'Estado inicial del escenario en Barranquilla.',
    resources: seed.resources,
    routes: seed.routes,
    allocation: {
      totalDemand: seed.demand.totalDemand,
      flexDemand: seed.demand.flexDemand,
      accessDemand: seed.demand.accessDemand,
      assignedTotal: 0,
      pendingTotal: seed.demand.totalDemand,
      pendingFlex: seed.demand.flexDemand,
      pendingAccess: seed.demand.accessDemand,
      sharedCrossingUsed: 0,
      sharedCrossingCapacity: 0,
    },
    merchants: seed.merchants,
    notices: /** @type {any} */ ({}),
    nodes: seed.nodes,
    ackHistory: [],
    jobs: seed.jobs,
    auditLog: [
      {
        id: 'audit-init-1',
        commandId: `init-${seed.scenarioId}`,
        commandType: 'system.reset',
        actorRole: 'Sistema BQ360',
        summary: `Escenario "${seed.scenarioLabel}" inicializado en v1.`,
        timestamp: seed.issuedAt,
        versionAfter: 1,
      },
    ],
    processedCommandIds: [],
  };

  return recalculateState(baseState, 'Estado inicial del escenario en Barranquilla.');
}

/**
 * Updates a single merchant (open/closed/expired or capacity/validity),
 * recalculates affected corridors, increments noticeVersion, and flags linked BQ Nodes.
 *
 * @param {import('./types').OutreachState} state
 * @param {import('./types').MarketUpdatePayload} payload
 * @returns {import('./types').CommandResult}
 */
export function applyMarketUpdate(state, payload) {
  if (!payload || !payload.merchantId) {
    return { ok: false, error: 'Debe especificar un comercio válido.', state };
  }

  if (payload.commandId && state.processedCommandIds.includes(payload.commandId)) {
    return {
      ok: false,
      error: 'Actualización duplicada: este comando ya fue procesado.',
      state,
    };
  }

  const targetIndex = state.merchants.findIndex((m) => m.id === payload.merchantId);
  if (targetIndex === -1) {
    return { ok: false, error: 'Comercio no encontrado en el corredor.', state };
  }

  const existingMerchant = state.merchants[targetIndex];
  const resultingCapacity =
    payload.capacity !== undefined
      ? Math.max(0, Math.floor(payload.capacity))
      : existingMerchant.capacity;

  if (payload.status === 'open' && resultingCapacity <= 0) {
    return {
      ok: false,
      error: 'Defina un cupo mayor a 0 antes de reabrir la recepción.',
      state,
    };
  }

  if (payload.status === 'open' && resultingCapacity <= existingMerchant.occupied) {
    return {
      ok: false,
      error: `El cupo debe superar la ocupación actual (${existingMerchant.occupied}) antes de reabrir la recepción.`,
      state,
    };
  }

  const wasOpen = isMerchantOpen(existingMerchant, state.currentTick);
  const next = deepClone(state);
  const merchant = next.merchants[targetIndex];
  const timestamp = formatTickTimestamp(next.currentTick);

  if (payload.status !== undefined) {
    merchant.status = payload.status;
    if (payload.status === 'open' && payload.validUntilTick === undefined) {
      merchant.validUntilTick = Math.max(merchant.validUntilTick, next.currentTick + 4);
    }
  }
  if (payload.capacity !== undefined) {
    merchant.capacity = resultingCapacity;
    if (merchant.capacity === 0 && payload.status === undefined) {
      merchant.status = 'closed';
    }
  }
  if (payload.validUntilTick !== undefined) {
    merchant.validUntilTick = Math.max(0, Math.floor(payload.validUntilTick));
  }
  merchant.lastUpdatedAt = timestamp;

  next.noticeVersion += 1;
  const cmdId =
    payload.commandId || `cmd-market-${merchant.id}-v${next.noticeVersion}`;
  next.processedCommandIds.push(cmdId);

  // Check if affected routes rotated or lost all open merchants
  const openCountByAffectedRoute = merchant.routeIds.map((rid) => {
    const route = next.routes.find((r) => r.id === rid);
    if (!route) return 0;
    return getOpenMerchantsForRoute(route, next.merchants, next.currentTick).length;
  });

  const hasRotation = openCountByAffectedRoute.some((count) => count > 0);
  const transitionedToClosedOrExpired =
    payload.status === 'closed' ||
    payload.status === 'expired' ||
    merchant.capacity === 0 ||
    (wasOpen && merchant.status !== 'open');

  let reason;
  if (payload.status === 'open') {
    reason = `Reapertura en ${merchant.name} (${merchant.zone}, cupo ${merchant.capacity}).`;
  } else if (transitionedToClosedOrExpired) {
    reason = hasRotation
      ? `Cierre en ${merchant.name}: rotación automática a comercio equivalente abierto en el corredor.`
      : `Cierre en ${merchant.name}: opción comercial invalidada en la ruta afectada.`;
  } else {
    const availabilityNote =
      merchant.capacity <= merchant.occupied
        ? 'sin cupo disponible'
        : `estado ${merchant.status}`;
    reason = `Actualización de cupo en ${merchant.name}: ${merchant.capacity} plazas (${merchant.occupied} ocupados, ${availabilityNote}).`;
  }

  const recalculated = recalculateState(next, reason);
  flagAffectedNodes(
    recalculated.nodes,
    merchant.routeIds,
    recalculated.noticeVersion,
    timestamp,
    reason,
    recalculated.scenarioId
  );

  recalculated.auditLog.unshift({
    id: `audit-${recalculated.auditLog.length + 1}-v${recalculated.noticeVersion}`,
    commandId: cmdId,
    commandType: 'market.update',
    actorRole: payload.actorRole || 'Gestor BQ Market',
    summary: reason,
    timestamp,
    versionAfter: recalculated.noticeVersion,
  });

  return { ok: true, state: recalculated };
}

/**
 * Registers an independent physical withdrawal & posting acknowledgement on a BQ Node.
 *
 * @param {import('./types').OutreachState} state
 * @param {import('./types').PhysicalAckPayload} payload
 * @returns {import('./types').CommandResult}
 */
export function applyPhysicalAck(state, payload) {
  if (!payload || !payload.nodeId) {
    return { ok: false, error: 'Debe seleccionar un nodo presencial válido.', state };
  }

  if (payload.commandId && state.processedCommandIds.includes(payload.commandId)) {
    return {
      ok: false,
      error: 'Acuse duplicado: este retiro físico ya fue registrado.',
      state,
    };
  }

  const trimmedName = String(payload.volunteerName || '').trim();
  if (trimmedName.length < 2) {
    return {
      ok: false,
      error: 'Ingrese el nombre del voluntario o enlace (mínimo 2 caracteres).',
      state,
    };
  }

  if (!VALID_ROLES.has(payload.volunteerRole)) {
    return {
      ok: false,
      error: 'Rol de responsable inválido para el acuse físico.',
      state,
    };
  }

  const nodeIdx = state.nodes.findIndex((n) => n.id === payload.nodeId);
  if (nodeIdx === -1) {
    return { ok: false, error: 'Estación BQ Node no encontrada.', state };
  }

  const existingNode = state.nodes[nodeIdx];
  if (existingNode.status !== 'pending_physical_withdrawal') {
    return {
      ok: false,
      error: 'Este BQ Node ya está al día; no admite doble acuse físico.',
      state,
    };
  }

  if (payload.removedVersion !== existingNode.physicalVersion) {
    return {
      ok: false,
      error: `Versión retirada (${payload.removedVersion}) no coincide con el cartel físico vigente (v${existingNode.physicalVersion}).`,
      state,
    };
  }

  const next = deepClone(state);
  const node = next.nodes[nodeIdx];
  const timestamp = formatTickTimestamp(next.currentTick);
  const cmdId =
    payload.commandId || `cmd-ack-${node.id}-v${node.digitalVersion}`;

  /** @type {import('./types').PhysicalAckRecord} */
  const ackRecord = {
    id: `ack-${next.ackHistory.length + 1}-v${node.digitalVersion}`,
    commandId: cmdId,
    nodeId: node.id,
    removedVersion: payload.removedVersion,
    postedVersion: node.digitalVersion,
    volunteerName: trimmedName,
    volunteerRole: payload.volunteerRole,
    timestamp,
    note: payload.note ? String(payload.note).trim() || undefined : undefined,
  };

  node.physicalVersion = node.digitalVersion;
  node.status = 'current';
  node.invalidatedAt = undefined;
  node.invalidationReason = undefined;
  node.qrPayload = `BQ360|${node.id}|${next.scenarioId}|v${node.digitalVersion}`;
  node.lastAck = ackRecord;

  next.ackHistory.unshift(ackRecord);
  next.processedCommandIds.push(cmdId);

  next.auditLog.unshift({
    id: `audit-${next.auditLog.length + 1}-ack`,
    commandId: cmdId,
    commandType: 'node.ack',
    actorRole: `${payload.volunteerRole} (${trimmedName})`,
    summary: `Retiro físico v${ackRecord.removedVersion} y fijación de v${ackRecord.postedVersion} en ${node.name}.`,
    timestamp,
    versionAfter: next.noticeVersion,
  });

  return { ok: true, state: next };
}

/**
 * Applies or lifts a preventive pause on a corridor resource (e.g., dest-C arroyo).
 *
 * @param {import('./types').OutreachState} state
 * @param {import('./types').PreventivePausePayload} payload
 * @returns {import('./types').CommandResult}
 */
export function togglePreventivePause(state, payload) {
  if (!payload || !payload.resourceId) {
    return { ok: false, error: 'Debe indicar el recurso afectado.', state };
  }

  if (payload.commandId && state.processedCommandIds.includes(payload.commandId)) {
    return {
      ok: false,
      error: 'Comando duplicado: la pausa ya fue procesada.',
      state,
    };
  }

  const resIdx = state.resources.findIndex((r) => r.id === payload.resourceId);
  if (resIdx === -1) {
    return { ok: false, error: 'Recurso territorial no encontrado.', state };
  }

  const next = deepClone(state);
  const resource = next.resources[resIdx];
  const timestamp = formatTickTimestamp(next.currentTick);
  const paused = Boolean(payload.paused);

  resource.status = paused ? 'preventive_pause' : 'active';
  resource.pauseReason = paused
    ? payload.reason || 'Pausa preventiva por arroyo o congestión reportada.'
    : undefined;

  next.noticeVersion += 1;
  const cmdId =
    payload.commandId ||
    `cmd-pause-${resource.id}-${paused ? 'on' : 'off'}-v${next.noticeVersion}`;
  next.processedCommandIds.push(cmdId);

  const reason = paused
    ? `Pausa preventiva en ${resource.name}: ${resource.pauseReason}`
    : `Reapertura verificada de ${resource.name}.`;

  const recalculated = recalculateState(next, reason);
  const affectedRouteIds = recalculated.routes
    .filter(
      (r) => r.destinationId === resource.id || r.sharedCrossingId === resource.id
    )
    .map((r) => r.id);

  flagAffectedNodes(
    recalculated.nodes,
    affectedRouteIds,
    recalculated.noticeVersion,
    timestamp,
    reason,
    recalculated.scenarioId
  );

  recalculated.auditLog.unshift({
    id: `audit-${recalculated.auditLog.length + 1}-v${recalculated.noticeVersion}`,
    commandId: cmdId,
    commandType: 'incident.pause',
    actorRole: payload.actorRole || 'Operador BQ Safe / Live',
    summary: reason,
    timestamp,
    versionAfter: recalculated.noticeVersion,
  });

  return { ok: true, state: recalculated };
}

/**
 * Advances simulation clock by 1 tick (+15 min), expiring outdated merchants and
 * recalculating affected routes and physical nodes.
 *
 * @param {import('./types').OutreachState} state
 * @param {import('./types').ClockAdvancePayload} [payload]
 * @returns {import('./types').CommandResult}
 */
export function advanceClock(state, payload = {}) {
  if (payload?.commandId && state.processedCommandIds.includes(payload.commandId)) {
    return {
      ok: false,
      error: 'Avance de reloj duplicado.',
      state,
    };
  }

  const next = deepClone(state);
  next.currentTick += 1;
  const timestamp = formatTickTimestamp(next.currentTick);

  const expiredMerchants = [];
  for (const merchant of next.merchants) {
    if (merchant.status === 'open' && next.currentTick > merchant.validUntilTick) {
      merchant.status = 'expired';
      merchant.lastUpdatedAt = timestamp;
      expiredMerchants.push(merchant);
    }
  }

  const affectedRouteIds = Array.from(
    new Set(expiredMerchants.flatMap((m) => m.routeIds))
  );

  if (expiredMerchants.length > 0) {
    next.noticeVersion += 1;
  }

  const reason =
    expiredMerchants.length > 0
      ? `Reloj avanzó a tick ${next.currentTick}; vencieron ${expiredMerchants.map((m) => m.name).join(', ')}.`
      : `Reloj avanzó a tick ${next.currentTick} (${timestamp}).`;

  const recalculated = recalculateState(next, reason);

  if (affectedRouteIds.length > 0) {
    flagAffectedNodes(
      recalculated.nodes,
      affectedRouteIds,
      recalculated.noticeVersion,
      timestamp,
      reason,
      recalculated.scenarioId
    );
  }

  const cmdId = payload?.commandId || `cmd-clock-t${recalculated.currentTick}`;
  recalculated.processedCommandIds.push(cmdId);

  recalculated.auditLog.unshift({
    id: `audit-${recalculated.auditLog.length + 1}-t${recalculated.currentTick}`,
    commandId: cmdId,
    commandType: 'clock.advance',
    actorRole: payload?.actorRole || 'Reloj de simulación BQ360',
    summary: reason,
    timestamp,
    versionAfter: recalculated.noticeVersion,
  });

  return { ok: true, state: recalculated };
}

/**
 * Changes the active balancing policy ('shortest' | 'balanced' | 'intervention')
 * and optional intervention accessibility toggle.
 *
 * @param {import('./types').OutreachState} state
 * @param {import('./types').PolicyChangePayload} payload
 * @returns {import('./types').CommandResult}
 */
export function setPolicy(state, payload) {
  if (!payload || !VALID_POLICIES.has(payload.policy)) {
    return { ok: false, error: 'Política de balanceo inválida.', state };
  }

  if (payload.commandId && state.processedCommandIds.includes(payload.commandId)) {
    return {
      ok: false,
      error: 'Cambio de política duplicado.',
      state,
    };
  }

  const next = deepClone(state);
  const timestamp = formatTickTimestamp(next.currentTick);
  next.policy = payload.policy;
  if (payload.interventionAccessible !== undefined) {
    next.interventionAccessible = Boolean(payload.interventionAccessible);
  }

  next.noticeVersion += 1;
  const cmdId =
    payload.commandId ||
    `cmd-policy-${next.policy}-${next.interventionAccessible ? 'acc' : 'noacc'}-v${next.noticeVersion}`;
  next.processedCommandIds.push(cmdId);

  const policyNames = {
    shortest: 'Ruta más corta (solo A)',
    balanced: 'Balanceo inclusivo BQ360',
    intervention: 'Intervención urbana (habilita D)',
  };

  const reason = `Cambio a política "${policyNames[next.policy]}"${
    next.policy === 'intervention'
      ? next.interventionAccessible
        ? ' con acceso inclusivo en D'
        : ' sin accesibilidad en D'
      : ''
  }.`;

  const recalculated = recalculateState(next, reason);

  // Flag nodes linked to routes whose assignment or accessibility changed
  const changedRouteIds = recalculated.routes
    .filter((newRoute) => {
      const oldRoute = state.routes.find((r) => r.id === newRoute.id);
      return (
        !oldRoute ||
        oldRoute.assignedTotal !== newRoute.assignedTotal ||
        oldRoute.assignedAccess !== newRoute.assignedAccess ||
        oldRoute.status !== newRoute.status
      );
    })
    .map((r) => r.id);

  if (changedRouteIds.length > 0) {
    flagAffectedNodes(
      recalculated.nodes,
      changedRouteIds,
      recalculated.noticeVersion,
      timestamp,
      reason,
      recalculated.scenarioId
    );
  }

  recalculated.auditLog.unshift({
    id: `audit-${recalculated.auditLog.length + 1}-v${recalculated.noticeVersion}`,
    commandId: cmdId,
    commandType: 'policy.change',
    actorRole: payload.actorRole || 'Control BQ360',
    summary: reason,
    timestamp,
    versionAfter: recalculated.noticeVersion,
  });

  return { ok: true, state: recalculated };
}

/**
 * Switches cleanly between Barranquilla scenarios ('metro-exit-v1' | 'metro-entry-v1').
 * @param {import('./types').ScenarioId} scenarioId
 * @returns {import('./types').OutreachState}
 */
export function switchScenario(scenarioId) {
  const next = createInitialOutreachState(scenarioId);
  next.auditLog = [
    {
      id: 'audit-scenario-1',
      commandId: `switch-${next.scenarioId}`,
      commandType: 'scenario.change',
      actorRole: 'Operador BQ360',
      summary: `Cambio de escenario a "${next.scenarioLabel}".`,
      timestamp: formatTickTimestamp(0),
      versionAfter: next.noticeVersion,
    },
  ];
  return next;
}

/**
 * Resets a scenario deterministically back to v1 / tick 0.
 * @param {import('./types').ScenarioId} [scenarioId='metro-exit-v1']
 * @returns {import('./types').OutreachState}
 */
export function resetScenario(scenarioId = 'metro-exit-v1') {
  return createInitialOutreachState(scenarioId);
}

/**
 * Verifiable offline local assistant (BQ AI) grounded strictly in current OutreachState.
 * Never calls external APIs; explains decisions with exact numbers and resource IDs.
 *
 * @param {import('./types').OutreachState} state
 * @param {string} query
 * @returns {import('./types').LocalAiResponse}
 */
export function answerLocalAiQuestion(state, query) {
  const q = normalizeText(query);
  const disclaimer = `Asistente local verificable BQ AI (sin conexión ni API externa). Respuesta basada únicamente en datos simulados vigentes (aviso v${state.noticeVersion}, tick ${state.currentTick}).`;

  const pausedResources = state.resources.filter((r) => r.status !== 'active');
  const openMerchants = state.merchants.filter((m) =>
    isMerchantOpen(m, state.currentTick)
  );
  const closedMerchants = state.merchants.filter(
    (m) => !isMerchantOpen(m, state.currentTick)
  );
  const pendingNodes = state.nodes.filter(
    (n) => n.status === 'pending_physical_withdrawal'
  );

  // 1. Explicit BQ Nodes / physical withdrawal / QR / print / version questions
  // Checked before generic "pendiente" / "cerrad" so node queries never fall into the pause branch
  if (
    q.includes('nodo') ||
    q.includes('node') ||
    q.includes('ficha') ||
    q.includes('fisic') ||
    q.includes('acuse') ||
    q.includes('cartel') ||
    q.includes('qr') ||
    q.includes('retiro') ||
    q.includes('imprim') ||
    q.includes('version')
  ) {
    const evidence = state.nodes.map(
      (n) =>
        `${n.id} (${n.name}): estado=${n.status}, versión física=v${n.physicalVersion}, versión digital=v${n.digitalVersion}.`
    );
    const answer =
      pendingNodes.length > 0
        ? `Existen ${pendingNodes.length} estación(es) BQ Node en estado "Pendiente de retiro físico": ${pendingNodes.map((n) => `${n.id} (física v${n.physicalVersion} vs digital v${n.digitalVersion})`).join(', ')}. Un voluntario o enlace comunitario debe confirmar el retiro del cartel anterior antes de marcar el nodo al día.`
        : `Los ${state.nodes.length} puntos presenciales BQ Node están sincronizados con la versión digital vigente (v${state.noticeVersion}).`;

    return {
      answer,
      evidence,
      referencedResources: state.nodes.map((n) => n.id),
      noticeVersion: state.noticeVersion,
      disclaimer,
    };
  }

  // 2. Explicit Merchant / BQ Market / hydration / expiration questions
  // Checked before generic "cerrad" / "pendiente" / "accesib" so merchant queries route accurately
  const hasExplicitMerchantIntent =
    q.includes('comercio') ||
    q.includes('mercado') ||
    q.includes('tienda') ||
    q.includes('vencid') ||
    q.includes('venci') ||
    q.includes('caduc') ||
    q.includes('compra') ||
    q.includes('hidratacion') ||
    q.includes('cupo') ||
    q.includes('rotacion') ||
    q.includes('market');

  const hasPauseOrRouteCIntent =
    q.includes('paus') ||
    q.includes('arroyo') ||
    q.includes('ruta c') ||
    q.includes('destino c');

  if (
    hasExplicitMerchantIntent ||
    (!hasPauseOrRouteCIntent && (q.includes('prado') || q.includes('murillo')))
  ) {
    const evidence = [
      `Comercios abiertos vigentes (${openMerchants.length}): ${openMerchants.map((m) => `${m.name} [${m.zone}]`).join('; ') || 'ninguno'}.`,
      `Comercios cerrados o vencidos (${closedMerchants.length}): ${closedMerchants.map((m) => `${m.name} (${m.status === 'open' && state.currentTick > m.validUntilTick ? 'expired' : m.status})`).join('; ') || 'ninguno'}.`,
      'Todos los comercios participantes ofrecen orientación ciudadana gratuita sin obligación de compra.',
    ];
    const answer =
      closedMerchants.length > 0
        ? `Se registran ${closedMerchants.length} comercio(s) cerrado(s) o vencido(s): ${closedMerchants.map((m) => m.name).join(', ')}. El motor recalculó las rutas afectadas sin afectar los corredores independientes y manteniendo ${openMerchants.length} comercio(s) abierto(s) con orientación gratuita sin obligación de compra.`
        : `Los ${openMerchants.length} comercios barriales del escenario están abiertos y ofrecen orientación gratuita sin obligación de compra ni restricción de paso.`;

    return {
      answer,
      evidence,
      referencedResources: [
        ...openMerchants.map((m) => m.id),
        ...closedMerchants.map((m) => m.id),
      ],
      noticeVersion: state.noticeVersion,
      disclaimer,
    };
  }

  // 3. Pause / arroyo / accessibility / pending demand / Route C questions
  if (
    hasPauseOrRouteCIntent ||
    q.includes('cerrad') ||
    q.includes('accesib') ||
    q.includes('movilidad reducida') ||
    q.includes('pendiente')
  ) {
    const accessNotice = state.notices.movilidad_reducida;
    const evidence = [
      `Demanda de acceso compatible: ${state.allocation.accessDemand} personas; asignadas: ${state.allocation.accessDemand - state.allocation.pendingAccess}; pendientes: ${state.allocation.pendingAccess}.`,
      `Estado del aviso Movilidad reducida: ${accessNotice.status} (${accessNotice.routeName}).`,
      ...pausedResources.map(
        (r) =>
          `Recurso ${r.id} (${r.name}) en ${r.status}: ${r.pauseReason || 'sin motivo adicional'}.`
      ),
    ];
    if (pausedResources.length === 0 && state.allocation.pendingTotal === 0) {
      evidence.push('No hay pausas preventivas activas en este momento.');
    }

    const answer =
      pausedResources.length > 0
        ? `Hay ${pausedResources.length} recurso(s) fuera de servicio (${pausedResources.map((r) => r.id).join(', ')}). Bajo la política "${state.policy}", el total asignado es ${state.allocation.assignedTotal}/${state.allocation.totalDemand} y quedan ${state.allocation.pendingTotal} pendientes (${state.allocation.pendingAccess} con necesidad de acceso compatible). ${accessNotice.reason}`
        : `Actualmente no hay pausas preventivas activas. Bajo la política "${state.policy}", hay ${state.allocation.assignedTotal} personas asignadas y ${state.allocation.pendingTotal} pendientes (${state.allocation.pendingAccess} de movilidad reducida). ${accessNotice.headline}.`;

    return {
      answer,
      evidence,
      referencedResources: [
        ...pausedResources.map((r) => r.id),
        ...(accessNotice.routeId ? [accessNotice.routeId] : []),
      ],
      noticeVersion: state.noticeVersion,
      disclaimer,
    };
  }

  // 4. Policy / routing / shared crossing / intervention D questions
  if (
    q.includes('politica') ||
    q.includes('ruta') ||
    q.includes('cruce') ||
    q.includes('intervencion') ||
    q.includes('balanceo') ||
    q.includes('corta') ||
    q.includes('asign') ||
    q.includes('por que')
  ) {
    const routeEvidence = state.routes.map(
      (r) =>
        `Ruta ${r.code} (${r.id}): ${r.assignedTotal} asignados (${r.assignedFlex} flex, ${r.assignedAccess} acceso), estado=${r.status}.`
    );
    const evidence = [
      `Política vigente: ${state.policy} (Intervención D accesible: ${state.interventionAccessible ? 'sí' : 'no'}).`,
      `Cruce compartido: ${state.allocation.sharedCrossingUsed}/${state.allocation.sharedCrossingCapacity}.`,
      ...routeEvidence,
    ];
    const answer = `Con la política "${state.policy}", el motor asignó ${state.allocation.assignedTotal} de ${state.allocation.totalDemand} personas (${state.allocation.pendingTotal} pendientes). El cruce compartido usa ${state.allocation.sharedCrossingUsed} de ${state.allocation.sharedCrossingCapacity} plazas y se priorizó primero a los perfiles de movilidad reducida. Último motivo registrado: ${state.lastRecalculationReason}`;

    return {
      answer,
      evidence,
      referencedResources: state.routes.map((r) => r.id),
      noticeVersion: state.noticeVersion,
      disclaimer,
    };
  }

  // 5. General summary fallback
  const summaryEvidence = [
    `Escenario: ${state.scenarioLabel} (${state.scenarioId}).`,
    `Asignación: ${state.allocation.assignedTotal}/${state.allocation.totalDemand} (${state.allocation.pendingTotal} pendientes).`,
    `Comercios abiertos: ${openMerchants.length}/${state.merchants.length}.`,
    `BQ Nodes pendientes de retiro físico: ${pendingNodes.length}/${state.nodes.length}.`,
    'Líneas de emergencia Barranquilla: 123 Policía · 125 Salud/CRUE · 119 Bomberos.',
  ];

  return {
    answer: `Estado actual v${state.noticeVersion} (tick ${state.currentTick}, política "${state.policy}"): ${state.allocation.assignedTotal} personas asignadas y ${state.allocation.pendingTotal} pendientes en "${state.scenarioLabel}". Hay ${pausedResources.length} recurso(s) pausado(s) y ${pendingNodes.length} BQ Node(s) por actualizar físicamente.`,
    evidence: summaryEvidence,
    referencedResources: state.routes.map((r) => r.id),
    noticeVersion: state.noticeVersion,
    disclaimer,
  };
}
