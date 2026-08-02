import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  ADMIN_DEMO_BREADCRUMB_COUNTS,
  ADMIN_DEMO_ROUTES,
  firstFile,
  startStaticExportServer,
  staticCandidates,
} from "./check-admin-demo-output.mjs";

test("admin demo browser inventory is the reviewed 62-route scope", () => {
  assert.equal(ADMIN_DEMO_ROUTES.length, 62);
  assert.equal(new Set(ADMIN_DEMO_ROUTES).size, 62);
  for (const family of ["billing", "crm", "customer-service", "projects", "hanhub", "hanship", "hanreview", "hanhelm"]) {
    assert.ok(ADMIN_DEMO_ROUTES.some((route) => route === family));
    assert.ok(ADMIN_DEMO_ROUTES.some((route) => route.startsWith(`${family}/`)));
  }
});

test("every reviewed route has an explicit breadcrumb expectation", () => {
  assert.deepEqual(Object.keys(ADMIN_DEMO_BREADCRUMB_COUNTS), ADMIN_DEMO_ROUTES);
  assert.equal(Object.values(ADMIN_DEMO_BREADCRUMB_COUNTS).reduce((sum, count) => sum + count, 0), 33);
});

test("static server resolves extensionless Next export routes", () => {
  assert.deepEqual(staticCandidates("/tmp/out", "/en/demos/crm"), [
    "/tmp/out/en/demos/crm",
    "/tmp/out/en/demos/crm.html",
    "/tmp/out/en/demos/crm/index.html",
  ]);
});

test("static file lookup ignores missing candidates but rethrows other filesystem errors", async () => {
  assert.equal(await firstFile(["/definitely/missing/hulian-admin-demo.html"]), null);
  assert.equal(await firstFile([`${fileURLToPath(import.meta.url)}/child`]), null);
  await assert.rejects(firstFile(["\0invalid-path"]), { code: "ERR_INVALID_ARG_VALUE" });
});

test("static server reports request-handler failures instead of hanging", async () => {
  const { server, origin } = await startStaticExportServer(process.cwd());
  try {
    const response = await fetch(`${origin}/%E0%A4%A`, { signal: AbortSignal.timeout(3_000) });
    assert.equal(response.status, 500);
    assert.match(await response.text(), /^Static export server error:/);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
