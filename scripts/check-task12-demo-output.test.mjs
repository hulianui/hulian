import assert from "node:assert/strict";
import test from "node:test";

test("Task 12 browser gate exposes the complete route and interaction contract", async () => {
  const gate = await import("./check-task12-demo-output.mjs");

  assert.equal(gate.TASK12_DEMO_ROUTES.length, 54);
  assert.equal(new Set(gate.TASK12_DEMO_ROUTES).size, 54);
  assert.deepEqual(gate.TASK12_ACCESSIBLE_ATTRIBUTES, [
    "aria-label",
    "title",
    "alt",
    "placeholder",
  ]);
  assert.deepEqual(gate.TASK12_INTERACTION_CHECKS, [
    "personal-guestbook-fail-once-recovery",
    "live-audience-support",
    "mobile-service-booking",
    "shop-product-retry-navigation",
    "website-pricing-navigation",
    "website-command-menu-navigation",
  ]);
  assert.equal(Object.keys(gate.TASK12_ROUTE_MARKERS).length, 54);
  assert.deepEqual(gate.TASK12_RECOVERY_MARKERS, {
    "personal/guestbook": "CodeFrame saved my technical posts",
    shop: "Flash sale",
    "shop/products": "All products",
  });
  for (const route of gate.TASK12_DEMO_ROUTES) {
    assert.ok(gate.TASK12_ROUTE_MARKERS[route]?.trim(), `${route} marker`);
    assert.doesNotMatch(gate.TASK12_ROUTE_MARKERS[route], /\p{Script=Han}/u);
  }
});

test("Task 12 failure detection rejects undeclared retry and error UI", async () => {
  const gate = await import("./check-task12-demo-output.mjs");
  assert.deepEqual(gate.collectUnexpectedFailureMarkers("Failed to load\nRetry"), [
    "Failed to load",
    "Retry",
  ]);
  assert.deepEqual(
    gate.collectUnexpectedFailureMarkers("Failed to load\nRetry", ["Failed to load", "Retry"]),
    [],
  );
});

test("Task 12 CJK collection includes accessible surfaces", async () => {
  const gate = await import("./check-task12-demo-output.mjs");
  assert.deepEqual(
    gate.collectCjkLines("English\naria-label: 返回\nAlex： hello\nquantity ＋\nplaceholder: Search"),
    ["aria-label: 返回", "Alex： hello", "quantity ＋"],
  );
});

test("Task 12 CJK collection decodes text-bearing SVG data URIs", async () => {
  const gate = await import("./check-task12-demo-output.mjs");
  assert.equal(typeof gate.decodeTextBearingSvgDataUri, "function");
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>家政保洁</text></svg>';
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  assert.equal(gate.decodeTextBearingSvgDataUri(dataUri), svg);
  assert.deepEqual(gate.collectCjkLines(gate.decodeTextBearingSvgDataUri(dataUri)), [
    svg,
  ]);
});
