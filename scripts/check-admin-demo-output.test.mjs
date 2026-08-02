import assert from "node:assert/strict";
import test from "node:test";
import { ADMIN_DEMO_ROUTES, staticCandidates } from "./check-admin-demo-output.mjs";

test("admin demo browser inventory is the reviewed 62-route scope", () => {
  assert.equal(ADMIN_DEMO_ROUTES.length, 62);
  assert.equal(new Set(ADMIN_DEMO_ROUTES).size, 62);
  for (const family of ["billing", "crm", "customer-service", "projects", "hanhub", "hanship", "hanreview", "hanhelm"]) {
    assert.ok(ADMIN_DEMO_ROUTES.some((route) => route === family));
    assert.ok(ADMIN_DEMO_ROUTES.some((route) => route.startsWith(`${family}/`)));
  }
});

test("static server resolves extensionless Next export routes", () => {
  assert.deepEqual(staticCandidates("/tmp/out", "/en/demos/crm"), [
    "/tmp/out/en/demos/crm",
    "/tmp/out/en/demos/crm.html",
    "/tmp/out/en/demos/crm/index.html",
  ]);
});
