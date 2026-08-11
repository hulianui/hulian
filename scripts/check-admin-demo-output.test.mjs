import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  ADMIN_DEMO_BREADCRUMB_COUNTS,
  ADMIN_DEMO_ROUTES,
  firstFile,
  isTimeoutFailure,
  scanAdminDemoOutputWithRetry,
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


// #182：这道门禁本机偶发超时、重跑即过。允许重试，但只允许「等超时」这一类，
// 而且必须把「重试后通过」打出来 —— 吞掉的 flaky 会训练出「红了就 rerun」，那正是真回归被漏掉的路径。
test("只有超时形态算 flaky，其它失败一律不重试", () => {
  const timeout = new Error("locator.waitFor: Timeout 30000ms exceeded.");
  timeout.name = "TimeoutError";
  assert.equal(isTimeoutFailure(timeout), true);
  assert.equal(isTimeoutFailure(new Error("Timeout 60000ms exceeded while waiting")), true);
  assert.equal(isTimeoutFailure(new Error("/en/demos/crm contains visible CJK text")), false);
  assert.equal(isTimeoutFailure(new Error("Browser page errors:\nboom")), false);
});

test("超时失败重试一次并如实报出重试次数", async () => {
  let calls = 0;
  const retries = [];
  const result = await scanAdminDemoOutputWithRetry("out", {
    run: async () => {
      calls += 1;
      if (calls === 1) {
        const error = new Error("locator.waitFor: Timeout 30000ms exceeded.");
        error.name = "TimeoutError";
        throw error;
      }
      return { routes: 62, breadcrumbClicks: 33, graphPaths: 4 };
    },
    onRetry: (info) => retries.push(info),
  });
  assert.equal(calls, 2);
  assert.equal(result.attempts, 2, "重试后通过必须与一次通过可区分");
  assert.equal(retries.length, 1);
  assert.match(retries[0].reason, /Timeout/);
});

test("非超时失败直接抛出，不给第二次机会", async () => {
  let calls = 0;
  await assert.rejects(
    scanAdminDemoOutputWithRetry("out", {
      run: async () => {
        calls += 1;
        throw new Error("/en/demos/crm contains visible CJK text");
      },
    }),
    /visible CJK text/,
  );
  assert.equal(calls, 1);
});

test("一次通过时 attempts 为 1（flaky 率才有基准）", async () => {
  const result = await scanAdminDemoOutputWithRetry("out", {
    run: async () => ({ routes: 62, breadcrumbClicks: 33, graphPaths: 4 }),
  });
  assert.equal(result.attempts, 1);
});
