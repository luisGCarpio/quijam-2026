import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SCENARIO_CONFIGS,
  createScenarioSeed,
  formatTickTimestamp,
} from './data.mjs';
import {
  advanceClock,
  answerLocalAiQuestion,
  applyMarketUpdate,
  applyPhysicalAck,
  createInitialOutreachState,
  recalculateState,
  resetScenario,
  setPolicy,
  switchScenario,
  togglePreventivePause,
} from './engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_OUTREACH_DIR = path.resolve(__dirname, '../../app/outreach');

function getRoute(state, code) {
  const route = state.routes.find((r) => r.code === code);
  assert.ok(route, `Expected route ${code} to exist`);
  return route;
}

function getNode(state, nodeId) {
  const node = state.nodes.find((n) => n.id === nodeId);
  assert.ok(node, `Expected node ${nodeId} to exist`);
  return node;
}

function getMerchant(state, merchantId) {
  const merchant = state.merchants.find((m) => m.id === merchantId);
  assert.ok(merchant, `Expected merchant ${merchantId} to exist`);
  return merchant;
}

function assertAllocationInvariants(state) {
  const { allocation, routes, resources } = state;
  assert.equal(
    allocation.assignedTotal + allocation.pendingTotal,
    allocation.totalDemand,
    'Demand conservation failed: assignedTotal + pendingTotal !== totalDemand'
  );
  assert.equal(
    allocation.pendingFlex + allocation.pendingAccess,
    allocation.pendingTotal,
    'Pending breakdown must equal pendingTotal'
  );

  const routeSum = routes.reduce((acc, r) => acc + r.assignedTotal, 0);
  assert.equal(routeSum, allocation.assignedTotal, 'Route assignedTotal sum mismatch');

  const accessSum = routes.reduce((acc, r) => acc + r.assignedAccess, 0);
  assert.equal(
    accessSum + allocation.pendingAccess,
    allocation.accessDemand,
    'Access demand conservation failed'
  );

  const flexSum = routes.reduce((acc, r) => acc + r.assignedFlex, 0);
  assert.equal(
    flexSum + allocation.pendingFlex,
    allocation.flexDemand,
    'Flex demand conservation failed'
  );

  for (const route of routes) {
    assert.equal(
      route.assignedFlex + route.assignedAccess,
      route.assignedTotal,
      `Route ${route.id} flex+access !== assignedTotal`
    );
    assert.ok(route.assignedFlex >= 0, `Route ${route.id} negative flex`);
    assert.ok(route.assignedAccess >= 0, `Route ${route.id} negative access`);
    if (!route.accessible) {
      assert.equal(
        route.assignedAccess,
        0,
        `Non-accessible route ${route.id} received access demand`
      );
    }
  }

  for (const res of resources) {
    assert.ok(res.assigned >= 0, `Resource ${res.id} negative assigned`);
    assert.ok(
      res.assigned <= res.capacity,
      `Resource ${res.id} exceeded capacity: ${res.assigned} > ${res.capacity}`
    );
    if (res.status !== 'active') {
      assert.equal(
        res.assigned,
        0,
        `Inactive resource ${res.id} (${res.status}) received assignment ${res.assigned}`
      );
    }
  }

  assert.ok(
    allocation.sharedCrossingUsed <= allocation.sharedCrossingCapacity,
    `Shared crossing exceeded capacity: ${allocation.sharedCrossingUsed} > ${allocation.sharedCrossingCapacity}`
  );
}

describe('BQ360 Outreach Engine — Barranquilla Deterministic Suite', () => {
  test('1. Nominal metro-exit-v1 (balanced): exact capacities, access-first on C, shared crossing <= 430, conservation', () => {
    const state = createInitialOutreachState('metro-exit-v1');

    assert.equal(state.scenarioId, 'metro-exit-v1');
    assert.equal(state.policy, 'balanced');
    assert.equal(state.noticeVersion, 1);
    assert.equal(state.currentTick, 0);

    assert.equal(state.allocation.totalDemand, 500);
    assert.equal(state.allocation.flexDemand, 400);
    assert.equal(state.allocation.accessDemand, 100);
    assert.equal(state.allocation.assignedTotal, 480);
    assert.equal(state.allocation.pendingTotal, 20);
    assert.equal(state.allocation.pendingFlex, 20);
    assert.equal(state.allocation.pendingAccess, 0);

    const routeA = getRoute(state, 'A');
    const routeB = getRoute(state, 'B');
    const routeC = getRoute(state, 'C');
    const routeD = getRoute(state, 'D');

    assert.equal(routeA.assignedTotal, 50);
    assert.equal(routeB.assignedTotal, 250);
    assert.equal(routeC.assignedTotal, 180);
    assert.equal(routeC.assignedAccess, 100);
    assert.equal(routeC.assignedFlex, 80);
    assert.equal(routeD.assignedTotal, 0);

    assert.equal(state.allocation.sharedCrossingUsed, 430);
    assert.equal(state.allocation.sharedCrossingCapacity, 430);
    assert.ok(state.allocation.sharedCrossingUsed <= 430);

    assert.equal(state.notices.movilidad_reducida.routeId, 'route-C');
    assert.equal(state.notices.movilidad_reducida.status, 'active');

    assertAllocationInvariants(state);
  });

  test('2. Policy shortest: assignedTotal === 50, pendingTotal === 450, only route-A receives demand', () => {
    const initial = createInitialOutreachState('metro-exit-v1');
    const res = setPolicy(initial, { policy: 'shortest', commandId: 'cmd-shortest-1' });
    assert.equal(res.ok, true);

    const state = res.state;
    assert.equal(state.policy, 'shortest');
    assert.equal(state.allocation.assignedTotal, 50);
    assert.equal(state.allocation.pendingTotal, 450);
    assert.equal(state.allocation.pendingFlex, 350);
    assert.equal(state.allocation.pendingAccess, 100);

    assert.equal(getRoute(state, 'A').assignedTotal, 50);
    assert.equal(getRoute(state, 'B').assignedTotal, 0);
    assert.equal(getRoute(state, 'C').assignedTotal, 0);
    assert.equal(getRoute(state, 'D').assignedTotal, 0);

    assert.equal(state.notices.movilidad_reducida.status, 'pending_specific_attention');
    assert.equal(state.notices.movilidad_reducida.routeId, null);

    // Invalid policy & duplicate commandId guards
    const invalidPolicy = setPolicy(state, { policy: /** @type {any} */ ('invalid') });
    assert.equal(invalidPolicy.ok, false);
    const dupPolicy = setPolicy(state, { policy: 'balanced', commandId: 'cmd-shortest-1' });
    assert.equal(dupPolicy.ok, false);

    assertAllocationInvariants(state);
  });

  test('3. Preventive pause on dest-C (arroyo): assignedTotal=300, pendingTotal=200, movilidad_reducida pending_specific_attention with routeId=null', () => {
    const initial = createInitialOutreachState('metro-exit-v1');
    const res = togglePreventivePause(initial, {
      resourceId: 'dest-C',
      paused: true,
      reason: 'Arroyo activo en El Prado',
      commandId: 'cmd-pause-c-1',
    });
    assert.equal(res.ok, true);

    const state = res.state;
    assert.equal(state.allocation.assignedTotal, 300);
    assert.equal(state.allocation.pendingTotal, 200);
    assert.equal(state.allocation.pendingAccess, 100);
    assert.equal(state.allocation.pendingFlex, 100);

    assert.equal(getRoute(state, 'A').assignedTotal, 50);
    assert.equal(getRoute(state, 'B').assignedTotal, 250);
    assert.equal(getRoute(state, 'C').status, 'paused');
    assert.equal(getRoute(state, 'C').assignedTotal, 0);
    assert.equal(getRoute(state, 'D').assignedTotal, 0);

    assert.equal(state.notices.movilidad_reducida.status, 'pending_specific_attention');
    assert.equal(state.notices.movilidad_reducida.routeId, null);

    // Linked nodes to route-C must be flagged for physical withdrawal
    assert.equal(getNode(state, 'NODE-PRADO-MERCADO').status, 'pending_physical_withdrawal');
    assert.equal(getNode(state, 'NODE-TRANSMETRO-MURILLO').status, 'pending_physical_withdrawal');
    assert.equal(getNode(state, 'NODE-ESTADIO-SUR').status, 'current');

    assertAllocationInvariants(state);
  });

  test('4. Intervention policy (D = 200): paused/unpaused C and interventionAccessible true/false', () => {
    const initial = createInitialOutreachState('metro-exit-v1');

    // 4a. With dest-C paused and interventionAccessible: true -> D absorbs 100 access + 100 flex = 200
    const pausedC = togglePreventivePause(initial, {
      resourceId: 'dest-C',
      paused: true,
      reason: 'Arroyo en El Prado',
      commandId: 'cmd-p4-pause-c',
    }).state;

    const res4a = setPolicy(pausedC, {
      policy: 'intervention',
      interventionAccessible: true,
      commandId: 'cmd-p4-int-acc',
    });
    assert.equal(res4a.ok, true);
    const state4a = res4a.state;
    assert.equal(state4a.allocation.assignedTotal, 500);
    assert.equal(state4a.allocation.pendingTotal, 0);
    assert.equal(state4a.allocation.pendingAccess, 0);
    const routeD4a = getRoute(state4a, 'D');
    assert.equal(routeD4a.assignedTotal, 200);
    assert.equal(routeD4a.assignedAccess, 100);
    assert.equal(routeD4a.assignedFlex, 100);
    assert.equal(state4a.notices.movilidad_reducida.routeId, 'route-D');
    assertAllocationInvariants(state4a);

    // 4b. With dest-C paused and interventionAccessible: false -> pendingAccess === 100
    const res4b = setPolicy(pausedC, {
      policy: 'intervention',
      interventionAccessible: false,
      commandId: 'cmd-p4-int-noacc',
    });
    assert.equal(res4b.ok, true);
    const state4b = res4b.state;
    assert.equal(state4b.allocation.pendingAccess, 100);
    assert.equal(state4b.allocation.assignedTotal, 400);
    assert.equal(state4b.allocation.pendingTotal, 100);
    assert.equal(getRoute(state4b, 'D').assignedAccess, 0);
    assert.equal(getRoute(state4b, 'D').assignedFlex, 100);
    assert.equal(state4b.notices.movilidad_reducida.status, 'pending_specific_attention');
    assert.equal(state4b.notices.movilidad_reducida.routeId, null);
    assertAllocationInvariants(state4b);

    // 4c. Without pause on C and interventionAccessible: true -> assignedTotal === 500, pendingTotal === 0
    const res4c = setPolicy(initial, {
      policy: 'intervention',
      interventionAccessible: true,
      commandId: 'cmd-p4-open-acc',
    });
    assert.equal(res4c.ok, true);
    const state4c = res4c.state;
    assert.equal(state4c.allocation.assignedTotal, 500);
    assert.equal(state4c.allocation.pendingTotal, 0);
    assert.equal(getRoute(state4c, 'C').assignedAccess, 100);
    assert.equal(getRoute(state4c, 'C').assignedTotal, 180);
    assert.equal(getRoute(state4c, 'D').assignedTotal, 20);
    assertAllocationInvariants(state4c);
  });

  test('5. Commercial rotation & partial invalidation (applyMarketUpdate) + duplicate commandId guard', () => {
    const initial = createInitialOutreachState('metro-exit-v1');

    // 5a. Close 1 of 2 equivalent open merchants on Route B (merch-murillo-mercado)
    const rotRes = applyMarketUpdate(initial, {
      merchantId: 'merch-murillo-mercado',
      status: 'closed',
      commandId: 'cmd-close-murillo-mercado',
    });
    assert.equal(rotRes.ok, true);
    const afterRot = rotRes.state;

    assert.equal(afterRot.noticeVersion, 2);
    assert.equal(getMerchant(afterRot, 'merch-murillo-mercado').status, 'closed');
    assert.equal(getMerchant(afterRot, 'merch-ciudadela-refresco').status, 'open');

    // Route B rotates to merch-ciudadela-refresco and stays active; Route C unaffected
    assert.equal(getRoute(afterRot, 'B').status, 'active');
    assert.equal(getRoute(afterRot, 'B').assignedTotal, 250);
    assert.equal(getRoute(afterRot, 'C').status, 'active');
    assert.equal(getRoute(afterRot, 'C').assignedTotal, 180);

    const ciudadanoOpenIds = afterRot.notices.ciudadano.openMerchants.map((m) => m.id);
    assert.deepEqual(ciudadanoOpenIds, ['merch-ciudadela-refresco']);

    // Route B's linked BQ Nodes become pending_physical_withdrawal with physicalVersion < digitalVersion
    for (const nodeId of ['NODE-ESTADIO-SUR', 'NODE-TRANSMETRO-MURILLO']) {
      const node = getNode(afterRot, nodeId);
      assert.equal(node.status, 'pending_physical_withdrawal');
      assert.ok(node.physicalVersion < node.digitalVersion);
      assert.equal(node.digitalVersion, 2);
    }
    assert.equal(getNode(afterRot, 'NODE-PRADO-MERCADO').status, 'current');

    // 5b. Duplicate commandId is rejected idempotently
    const dupRes = applyMarketUpdate(afterRot, {
      merchantId: 'merch-ciudadela-refresco',
      status: 'closed',
      commandId: 'cmd-close-murillo-mercado',
    });
    assert.equal(dupRes.ok, false);
    assert.equal(dupRes.state.noticeVersion, 2);
    assert.equal(getMerchant(dupRes.state, 'merch-ciudadela-refresco').status, 'open');

    // 5c. Close anchor merchant on Route C (merch-prado-mercado) -> 0 open merchants on C
    const cRes = applyMarketUpdate(afterRot, {
      merchantId: 'merch-prado-mercado',
      status: 'closed',
      commandId: 'cmd-close-prado-mercado',
    });
    assert.equal(cRes.ok, true);
    const afterC = cRes.state;

    assert.equal(afterC.noticeVersion, 3);
    assert.equal(getRoute(afterC, 'C').status, 'degraded');
    assert.ok(getRoute(afterC, 'C').invalidationReason);
    assert.equal(getRoute(afterC, 'B').status, 'active');
    assert.equal(afterC.notices.turista.openMerchants.length, 0);

    for (const nodeId of ['NODE-TRANSMETRO-MURILLO', 'NODE-PRADO-MERCADO']) {
      const node = getNode(afterC, nodeId);
      assert.equal(node.status, 'pending_physical_withdrawal');
      assert.ok(node.physicalVersion < node.digitalVersion);
      assert.equal(node.digitalVersion, 3);
    }
    assert.equal(getNode(afterC, 'NODE-MALECON-DORADA').status, 'current');
    assertAllocationInvariants(afterC);
  });

  test('6. Expiration by clock (advanceClock): switches merchant past validUntilTick to expired, bumps noticeVersion, flags nodes', () => {
    let state = createInitialOutreachState('metro-exit-v1');

    // Initial validUntilTick for merch-murillo-frutas, merch-murillo-mercado, merch-prado-mercado is 6
    for (let i = 1; i <= 6; i++) {
      const step = advanceClock(state, { commandId: `cmd-tick-${i}` });
      assert.equal(step.ok, true);
      state = step.state;
      assert.equal(state.currentTick, i);
      assert.equal(state.noticeVersion, 1, `No merchant should expire at tick ${i}`);
    }

    // Advancing to tick 7 crosses validUntilTick === 6
    const expireStep = advanceClock(state, { commandId: 'cmd-tick-7' });
    assert.equal(expireStep.ok, true);
    state = expireStep.state;

    assert.equal(state.currentTick, 7);
    assert.equal(state.noticeVersion, 2);

    assert.equal(getMerchant(state, 'merch-murillo-frutas').status, 'expired');
    assert.equal(getMerchant(state, 'merch-murillo-mercado').status, 'expired');
    assert.equal(getMerchant(state, 'merch-prado-mercado').status, 'expired');
    // Merchants with validUntilTick: 8 remain open
    assert.equal(getMerchant(state, 'merch-ciudadela-refresco').status, 'open');
    assert.equal(getMerchant(state, 'merch-malecon-gastro').status, 'open');

    assert.equal(getRoute(state, 'A').status, 'degraded');
    assert.equal(getRoute(state, 'B').status, 'active');
    assert.equal(getRoute(state, 'C').status, 'degraded');

    assert.equal(getNode(state, 'NODE-ESTADIO-SUR').status, 'pending_physical_withdrawal');
    assert.equal(getNode(state, 'NODE-TRANSMETRO-MURILLO').status, 'pending_physical_withdrawal');
    assert.equal(getNode(state, 'NODE-PRADO-MERCADO').status, 'pending_physical_withdrawal');
    assert.equal(getNode(state, 'NODE-MALECON-DORADA').status, 'current');

    // Duplicate clock commandId rejected
    const dupClock = advanceClock(state, { commandId: 'cmd-tick-7' });
    assert.equal(dupClock.ok, false);
    assert.equal(dupClock.state.currentTick, 7);

    assertAllocationInvariants(state);
  });

  test('7. Physical Ack & Double-Ack Prevention (applyPhysicalAck)', () => {
    const initial = createInitialOutreachState('metro-exit-v1');
    const paused = togglePreventivePause(initial, {
      resourceId: 'dest-C',
      paused: true,
      reason: 'Arroyo en El Prado',
      commandId: 'cmd-ack-setup',
    }).state;

    const pendingNode = getNode(paused, 'NODE-PRADO-MERCADO');
    assert.equal(pendingNode.status, 'pending_physical_withdrawal');
    assert.equal(pendingNode.physicalVersion, 1);
    assert.equal(pendingNode.digitalVersion, 2);

    // Reject empty / whitespace / 1-char volunteerName
    for (const badName of ['', '   ', 'A']) {
      const badNameRes = applyPhysicalAck(paused, {
        nodeId: 'NODE-PRADO-MERCADO',
        removedVersion: 1,
        volunteerName: badName,
        volunteerRole: 'Voluntario de campo',
        commandId: `cmd-bad-name-${badName.length}`,
      });
      assert.equal(badNameRes.ok, false);
    }

    // Reject mismatched removedVersion
    const badVersionRes = applyPhysicalAck(paused, {
      nodeId: 'NODE-PRADO-MERCADO',
      removedVersion: 99,
      volunteerName: 'Ana Ospino',
      volunteerRole: 'Voluntario de campo',
      commandId: 'cmd-bad-ver',
    });
    assert.equal(badVersionRes.ok, false);

    // Reject invalid volunteerRole
    const badRoleRes = applyPhysicalAck(paused, {
      nodeId: 'NODE-PRADO-MERCADO',
      removedVersion: 1,
      volunteerName: 'Ana Ospino',
      volunteerRole: /** @type {any} */ ('Visitante'),
      commandId: 'cmd-bad-role',
    });
    assert.equal(badRoleRes.ok, false);

    // Valid volunteer ack
    const ackRes = applyPhysicalAck(paused, {
      nodeId: 'NODE-PRADO-MERCADO',
      removedVersion: 1,
      volunteerName: 'Ana Ospino',
      volunteerRole: 'Voluntario de campo',
      commandId: 'cmd-ack-prado-v2',
      note: 'Cartel v1 retirado y v2 instalado',
    });
    assert.equal(ackRes.ok, true);
    const ackedState = ackRes.state;

    const updatedNode = getNode(ackedState, 'NODE-PRADO-MERCADO');
    assert.equal(updatedNode.physicalVersion, updatedNode.digitalVersion);
    assert.equal(updatedNode.physicalVersion, 2);
    assert.equal(updatedNode.status, 'current');

    assert.equal(ackedState.ackHistory.length, 1);
    const record = ackedState.ackHistory[0];
    assert.equal(record.nodeId, 'NODE-PRADO-MERCADO');
    assert.equal(record.removedVersion, 1);
    assert.equal(record.postedVersion, 2);
    assert.equal(record.volunteerName, 'Ana Ospino');
    assert.equal(record.volunteerRole, 'Voluntario de campo');
    assert.equal(record.timestamp, formatTickTimestamp(ackedState.currentTick));

    // Second ack on already-current node returns ok: false (double-ack guard)
    const doubleAckRes = applyPhysicalAck(ackedState, {
      nodeId: 'NODE-PRADO-MERCADO',
      removedVersion: 2,
      volunteerName: 'Carlos Pertuz',
      volunteerRole: 'Coordinador de nodo',
      commandId: 'cmd-ack-prado-double',
    });
    assert.equal(doubleAckRes.ok, false);

    // Reused commandId on another still-pending node (NODE-TRANSMETRO-MURILLO) returns ok: false
    const reusedCmdRes = applyPhysicalAck(ackedState, {
      nodeId: 'NODE-TRANSMETRO-MURILLO',
      removedVersion: 1,
      volunteerName: 'Carlos Pertuz',
      volunteerRole: 'Coordinador de nodo',
      commandId: 'cmd-ack-prado-v2',
    });
    assert.equal(reusedCmdRes.ok, false);
  });

  test('8. Explainable BQ AI (answerLocalAiQuestion): reflects shared crossing 430, paused C, closed merchants, pending nodes & noticeVersion', () => {
    let state = createInitialOutreachState('metro-exit-v1');

    // 8a. Shared crossing in nominal state
    const crossingAi = answerLocalAiQuestion(
      state,
      '¿Cómo funciona el cruce compartido y la política actual?'
    );
    assert.equal(crossingAi.noticeVersion, state.noticeVersion);
    assert.ok(crossingAi.answer.includes('430'));
    assert.ok(crossingAi.evidence.some((e) => e.includes('430/430')));

    // 8b. Paused Route C
    state = togglePreventivePause(state, {
      resourceId: 'dest-C',
      paused: true,
      reason: 'Arroyo en El Prado',
      commandId: 'cmd-ai-pause-c',
    }).state;
    const pauseAi = answerLocalAiQuestion(state, '¿Por qué está pausada la ruta C por arroyo?');
    assert.equal(pauseAi.noticeVersion, state.noticeVersion);
    assert.ok(pauseAi.answer.includes('dest-C'));
    assert.ok(pauseAi.answer.includes('100'));
    assert.ok(pauseAi.referencedResources.includes('dest-C'));

    // 8c. Closed merchant (including queries with "cerraron" / "vencieron" / "cerrados")
    state = applyMarketUpdate(state, {
      merchantId: 'merch-prado-mercado',
      status: 'closed',
      commandId: 'cmd-ai-close-prado',
    }).state;
    const marketAi = answerLocalAiQuestion(
      state,
      '¿Cuál es el estado de los comercios y mercados en BQ Market?'
    );
    assert.equal(marketAi.noticeVersion, state.noticeVersion);
    assert.ok(marketAi.answer.includes('Mercado Cultural del Prado'));
    assert.ok(marketAi.referencedResources.includes('merch-prado-mercado'));

    const closedMerchantPresetAi = answerLocalAiQuestion(
      state,
      '¿Qué comercios cerraron o vencieron?'
    );
    assert.ok(closedMerchantPresetAi.answer.includes('Mercado Cultural del Prado'));
    assert.ok(closedMerchantPresetAi.referencedResources.includes('merch-prado-mercado'));

    // 8d. Pending physical node withdrawals (including queries with "fichas" + "pendientes")
    const nodeAi = answerLocalAiQuestion(
      state,
      '¿Qué estaciones BQ Node necesitan retiro físico de cartel?'
    );
    assert.equal(nodeAi.noticeVersion, state.noticeVersion);
    assert.ok(nodeAi.answer.includes('NODE-PRADO-MERCADO'));
    assert.ok(nodeAi.answer.includes('NODE-TRANSMETRO-MURILLO'));
    assert.ok(nodeAi.disclaimer.includes(`v${state.noticeVersion}`));

    const nodePresetAi = answerLocalAiQuestion(
      state,
      '¿Hay fichas BQ Node pendientes de retiro?'
    );
    assert.ok(nodePresetAi.answer.includes('NODE-PRADO-MERCADO'));
    assert.ok(nodePresetAi.referencedResources.includes('NODE-PRADO-MERCADO'));
  });

  test('8b. Policy-constrained notice routing (H4), capacity/reopen guards (H3 & M4), and QR scenarioId preservation (L3)', () => {
    const initial = createInitialOutreachState('metro-exit-v1');

    // H3: Reject reopening a merchant with capacity === 0 without mutating state
    const zeroCapRes = applyMarketUpdate(initial, {
      merchantId: 'merch-murillo-frutas',
      capacity: 0,
      commandId: 'cmd-h3-cap0',
    });
    assert.equal(zeroCapRes.ok, true);
    assert.equal(getMerchant(zeroCapRes.state, 'merch-murillo-frutas').status, 'closed');

    const reopenZeroRes = applyMarketUpdate(zeroCapRes.state, {
      merchantId: 'merch-murillo-frutas',
      status: 'open',
      commandId: 'cmd-h3-reopen0',
    });
    assert.equal(reopenZeroRes.ok, false);
    assert.equal(reopenZeroRes.state.noticeVersion, zeroCapRes.state.noticeVersion);
    assert.equal(getMerchant(reopenZeroRes.state, 'merch-murillo-frutas').status, 'closed');

    // M4: Setting capacity <= occupied excludes merchant from openMerchants without closing status
    const fullRes = applyMarketUpdate(initial, {
      merchantId: 'merch-prado-mercado',
      capacity: 52, // occupied === 52
      commandId: 'cmd-m4-full',
    });
    assert.equal(fullRes.ok, true);
    assert.equal(fullRes.state.notices.turista.openMerchants.length, 0);
    assert.ok(fullRes.state.lastRecalculationReason.includes('Actualización de cupo'));

    // L3: QR payload preserves scenarioId after node invalidation
    const invalidatedNode = getNode(fullRes.state, 'NODE-PRADO-MERCADO');
    assert.equal(invalidatedNode.status, 'pending_physical_withdrawal');
    assert.ok(
      invalidatedNode.qrPayload.includes('|metro-exit-v1|'),
      `Expected scenarioId in qrPayload, got ${invalidatedNode.qrPayload}`
    );

    // H4: Pausing route-A under 'shortest' does not recommend B/C; pausing A/B/C under 'balanced' does not recommend D
    const shortestState = setPolicy(initial, {
      policy: 'shortest',
      commandId: 'cmd-h4-shortest',
    }).state;
    const shortestPausedA = togglePreventivePause(shortestState, {
      resourceId: 'route-A',
      paused: true,
      commandId: 'cmd-h4-pause-a',
    }).state;
    assert.equal(shortestPausedA.notices.turista.routeId, null);
    assert.equal(shortestPausedA.notices.ciudadano.routeId, null);
    assert.equal(shortestPausedA.notices.prensa.routeId, null);
    assert.equal(shortestPausedA.notices.turista.status, 'paused');

    let balancedAllPaused = togglePreventivePause(initial, {
      resourceId: 'route-A',
      paused: true,
      commandId: 'cmd-h4-bal-a',
    }).state;
    balancedAllPaused = togglePreventivePause(balancedAllPaused, {
      resourceId: 'dest-B',
      paused: true,
      commandId: 'cmd-h4-bal-b',
    }).state;
    balancedAllPaused = togglePreventivePause(balancedAllPaused, {
      resourceId: 'dest-C',
      paused: true,
      commandId: 'cmd-h4-bal-c',
    }).state;
    assert.equal(balancedAllPaused.notices.turista.routeId, null);
    assert.equal(balancedAllPaused.notices.ciudadano.routeId, null);
    assert.equal(balancedAllPaused.notices.prensa.routeId, null);
  });

  test('9. Scenario switch (metro-entry-v1) & resetScenario(metro-exit-v1)', () => {
    const entry = switchScenario('metro-entry-v1');
    assert.equal(entry.scenarioId, 'metro-entry-v1');
    assert.equal(entry.noticeVersion, 1);
    assert.equal(entry.currentTick, 0);

    const corridorText = entry.routes.map((r) => `${r.name} ${r.corridor}`).join(' | ');
    assert.ok(corridorText.includes('El Prado / Norte'));
    assert.ok(corridorText.includes('Gran Malecón / Ciénaga de Mallorquín'));
    assert.ok(corridorText.includes('Centro Histórico Accesible'));
    assert.ok(corridorText.includes('Aeropuerto Ernesto Cortissoz / Calle 30'));
    assertAllocationInvariants(entry);

    // Mutate state heavily before resetting
    let mutated = togglePreventivePause(entry, {
      resourceId: 'dest-C',
      paused: true,
      commandId: 'cmd-mut-1',
    }).state;
    mutated = advanceClock(mutated, { commandId: 'cmd-mut-2' }).state;

    // Note: engine.mjs resets deterministically to v1 / tick 0 (see engine.mjs lines 516 & 999)
    const reset = resetScenario('metro-exit-v1');
    assert.equal(reset.scenarioId, 'metro-exit-v1');
    assert.equal(reset.noticeVersion, 1);
    assert.equal(reset.currentTick, 0);
    assert.equal(reset.ackHistory.length, 0);
    assert.equal(reset.processedCommandIds.length, 0);
    for (const node of reset.nodes) {
      assert.equal(node.status, 'current');
      assert.equal(node.physicalVersion, 1);
      assert.equal(node.digitalVersion, 1);
    }
    for (const merchant of reset.merchants) {
      assert.equal(merchant.status, 'open');
    }
    assert.equal(
      SCENARIO_CONFIGS['metro-exit-v1'].demand.totalDemand,
      createScenarioSeed('metro-exit-v1').demand.totalDemand
    );
    assert.equal(recalculateState(reset).allocation.assignedTotal, 480);
    assertAllocationInvariants(reset);
  });

  test('10. Static Repository Hygiene Check: zero forbidden terms in features/outreach and app/outreach', async () => {
    // Build pattern dynamically so this test file itself stays hygiene-clean
    const forbiddenPattern = new RegExp(
      [
        'Safe' + 'Move',
        'Chi' + 'le',
        '\\b13' + '3\\b',
        '\\b13' + '1\\b',
        '\\b13' + '2\\b',
        '\\+5' + '6',
      ].join('|'),
      'gi'
    );

    async function collectFiles(dir) {
      let entries;
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch (err) {
        if (err && err.code === 'ENOENT') return [];
        throw err;
      }
      const files = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...(await collectFiles(fullPath)));
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const files = [
      ...(await collectFiles(__dirname)),
      ...(await collectFiles(APP_OUTREACH_DIR)),
    ];

    assert.ok(files.length > 0, 'Expected outreach files to scan');

    const violations = [];
    for (const filePath of files) {
      const content = await fs.readFile(filePath, 'utf8');
      const matches = content.match(forbiddenPattern);
      if (matches) {
        violations.push({ filePath, matches });
      }
    }

    assert.deepEqual(
      violations,
      [],
      `Found forbidden references in outreach files: ${JSON.stringify(violations)}`
    );
  });
});
