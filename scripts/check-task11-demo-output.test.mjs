import assert from "node:assert/strict";
import test from "node:test";
import { TASK11_DEMO_ROUTES, TASK11_ROUTE_MARKERS } from "./check-task11-demo-output.mjs";

test("Task 11 browser inventory is the reviewed 11-route scope", () => {
  assert.equal(TASK11_DEMO_ROUTES.length, 11);
  assert.equal(new Set(TASK11_DEMO_ROUTES).size, 11);
  for (const family of ["ai-chat", "ai-workflow", "knowledge", "learn", "scheduler", "dashboard"]) {
    assert.ok(TASK11_DEMO_ROUTES.includes(family));
  }
});

test("every Task 11 route has an explicit English marker", () => {
  assert.deepEqual(Object.keys(TASK11_ROUTE_MARKERS), TASK11_DEMO_ROUTES);
  for (const marker of Object.values(TASK11_ROUTE_MARKERS)) {
    assert.ok(marker.trim().length > 0);
    assert.doesNotMatch(marker, /\p{Script=Han}/u);
  }
});
