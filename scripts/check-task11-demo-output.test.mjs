import assert from "node:assert/strict";
import test from "node:test";
import {
  TASK11_ACCESSIBLE_ATTRIBUTES,
  collectCjkLines,
  TASK11_DEMO_ROUTES,
  TASK11_INTERACTION_CHECKS,
  TASK11_ROUTE_MARKERS,
} from "./check-task11-demo-output.mjs";

test("Task 11 browser scan reports every CJK surface in one route pass", () => {
  assert.deepEqual(collectCjkLines("English\naria-label: 清除\ntitle: 中文"), [
    "aria-label: 清除",
    "title: 中文",
  ]);
});

test("Task 11 browser inventory is the reviewed 11-route scope", () => {
  assert.equal(TASK11_DEMO_ROUTES.length, 11);
  assert.equal(new Set(TASK11_DEMO_ROUTES).size, 11);
  for (const family of ["ai-chat", "ai-workflow", "knowledge", "learn", "scheduler", "dashboard"]) {
    assert.ok(TASK11_DEMO_ROUTES.includes(family));
  }
});

test("Task 11 browser scan covers reviewed interactions and accessible text surfaces", () => {
  assert.deepEqual(TASK11_ACCESSIBLE_ATTRIBUTES, ["aria-label", "title", "alt", "placeholder"]);
  assert.deepEqual(TASK11_INTERACTION_CHECKS, [
    "english-navigation",
    "workflow-notifications",
    "learn-mentions",
    "scheduler-retry-detail-submit",
    "dashboard-status-toast",
  ]);
});

test("every Task 11 route has an explicit English marker", () => {
  assert.deepEqual(Object.keys(TASK11_ROUTE_MARKERS), TASK11_DEMO_ROUTES);
  for (const marker of Object.values(TASK11_ROUTE_MARKERS)) {
    assert.ok(marker.trim().length > 0);
    assert.doesNotMatch(marker, /\p{Script=Han}/u);
  }
});
