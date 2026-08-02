import assert from "node:assert/strict";
import test from "node:test";

import {
  THEMES,
  classify,
  shouldFailResponse,
  shouldIgnoreRequestFailure,
  validateRouteResult,
} from "./a11y.mjs";
import * as a11y from "./a11y.mjs";

test("无障碍路由矩阵补齐中英文并去重已带 /en 的路由", () => {
  assert.equal(typeof a11y.expandBilingualRoutes, "function");
  assert.deepEqual(
    a11y.expandBilingualRoutes([
      "/components/button",
      "/en/components/button",
    ]),
    [
      { route: "/components/button", locale: "zh-CN" },
      { route: "/en/components/button", locale: "en" },
    ],
  );
  assert.deepEqual(
    a11y.ROUTES.filter(({ route }) => route.endsWith("/components/button")),
    [
      { route: "/components/button", locale: "zh-CN" },
      { route: "/en/components/button", locale: "en" },
    ],
  );
});

test("无障碍门禁固定覆盖亮色与暗色，不继承运行机器偏好", () => {
  assert.deepEqual(THEMES, ["light", "dark"]);
});

test("axe 分级只阻塞 critical 与 serious", () => {
  assert.equal(classify([{ impact: "critical" }]).blocking.length, 1);
  assert.equal(classify([{ impact: "serious" }]).blocking.length, 1);
  assert.equal(classify([{ impact: "moderate" }]).blocking.length, 0);
  assert.equal(classify([{ impact: "moderate" }]).reported.length, 1);
});

test("路由或资源加载失败不能伪装成零违规", () => {
  assert.throws(
    () =>
      validateRouteResult({
        route: "/en/broken",
        locale: "en",
        loadFailed: true,
        violations: [],
      }),
    /\[en\].*route load failed.*\/en\/broken/i,
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

test("同站子资源的 HTTP 失败会阻断，站外响应不纳入静态站完整性", () => {
  assert.equal(
    shouldFailResponse(
      { url: "http://127.0.0.1:3000/_next/app.js", status: 404 },
      "http://127.0.0.1:3000",
    ),
    true,
  );
  assert.equal(
    shouldFailResponse(
      { url: "http://127.0.0.1:3000/app.css", status: 200 },
      "http://127.0.0.1:3000",
    ),
    false,
  );
  assert.equal(
    shouldFailResponse({ url: "https://example.com/pixel", status: 404 }, "http://127.0.0.1:3000"),
    false,
  );
});
