import assert from "node:assert/strict";
import test from "node:test";

import { classify, shouldIgnoreRequestFailure, validateRouteResult } from "./a11y.mjs";

test("axe 分级只阻塞 critical 与 serious", () => {
  assert.equal(classify([{ impact: "critical" }]).blocking.length, 1);
  assert.equal(classify([{ impact: "serious" }]).blocking.length, 1);
  assert.equal(classify([{ impact: "moderate" }]).blocking.length, 0);
  assert.equal(classify([{ impact: "moderate" }]).reported.length, 1);
});

test("路由或资源加载失败不能伪装成零违规", () => {
  assert.throws(
    () => validateRouteResult({ route: "/broken", loadFailed: true, violations: [] }),
    /route load failed.*\/broken/i,
  );
});

test("只忽略 Next 导航预取主动取消，不忽略真实资源失败", () => {
  assert.equal(
    shouldIgnoreRequestFailure({ resourceType: "fetch", errorText: "net::ERR_ABORTED" }),
    true,
  );
  assert.equal(
    shouldIgnoreRequestFailure({ resourceType: "script", errorText: "net::ERR_ABORTED" }),
    false,
  );
  assert.equal(
    shouldIgnoreRequestFailure({ resourceType: "fetch", errorText: "net::ERR_CONNECTION_REFUSED" }),
    false,
  );
});
