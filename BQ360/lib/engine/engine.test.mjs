import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bq360-engine-"));

function loadTypeScriptModule(fileName) {
  const source = fs.readFileSync(path.join(here, fileName), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const outFile = path.join(tempDir, fileName.replace(/\.ts$/, ".js"));
  fs.writeFileSync(outFile, output);
  const require = createRequire(import.meta.url);
  return require(outFile);
}

// Allocation imports routing through a relative TypeScript specifier. Keep both modules
// in the same temporary directory and transpile before loading.
loadTypeScriptModule("routing.ts");
const allocation = loadTypeScriptModule("allocation.ts");
const simulation = loadTypeScriptModule("simulation.ts");

const demand = { flex: 400, access: 100 };
const routes = allocation.defaultMetroExitRoutes;

test("shortest assigns 50 and leaves 450 pending", () => {
  const result = allocation.allocateDemand(demand, "shortest", routes);
  assert.equal(result.assigned, 50);
  assert.equal(result.pending, 450);
  assert.equal(result.allocations.A, 50);
});

test("balanced reserves C for access and balances destinations", () => {
  const result = allocation.allocateDemand(demand, "balanced", routes);
  assert.deepEqual(
    { A: result.allocations.A, B: result.allocations.B, C: result.allocations.C, pending: result.pending },
    { A: 50, B: 250, C: 180, pending: 20 },
  );
  assert.ok(result.allocations.C >= 100);
  assert.equal(result.sharedCrossingLoads["cross-BC"], 430);
});

test("preventive pause of C leaves 300 assigned and 200 pending", () => {
  const result = allocation.allocateDemand(demand, "balanced", routes, {
    pausedRouteIds: ["C"],
  });
  assert.equal(result.assigned, 300);
  assert.equal(result.pending, 200);
  assert.equal(result.pendingByProfile.access, 100);
  assert.equal(result.pendingByReason.no_compatible_route, 200);
});

test("intervention with accessible D assigns every person", () => {
  const result = allocation.allocateDemand(demand, "intervention", routes, {
    dAccessible: true,
  });
  assert.equal(result.assigned, 500);
  assert.equal(result.pending, 0);
  assert.equal(result.allocations.D, 200);
});

test("intervention without D accessibility keeps access pending", () => {
  const result = allocation.allocateDemand(demand, "intervention", routes, {
    dAccessible: false,
  });
  assert.equal(result.pendingByProfile.access, 100);
  assert.equal(result.allocations.D, 0);
});

test("shared crossing is counted once and remains below 250 + 180", () => {
  const routeLoads = { B: 250, C: 180 };
  const routing = loadTypeScriptModule("routing.ts");
  const crossing = routing.sharedCrossingCost(["B", "C"], 350, routeLoads);
  assert.equal(crossing, 350);
  assert.ok(crossing < routeLoads.B + routeLoads.C);
});

test("people already in transit are not reassigned by a later condition change", () => {
  let state = simulation.createSimulationState(demand, "balanced", routes);
  state = {
    ...state,
    cohorts: { ...state.cohorts, inTransit: 100 },
  };
  const next = simulation.advanceSimulation(state, demand, routes, {
    pausedRouteIds: ["C"],
  });
  assert.equal(next.cohorts.inTransit, 100);
  assert.equal(next.allocation.assigned, 300);
});
