import assert from "node:assert/strict";
import test from "node:test";

import {
  componentRouteFromHtmlPath,
  findCjkLeaks,
  isIgnorableRequestFailure,
  validateShowcaseRouteResult,
} from "./check-showcase-english-browser.mjs";

test("findCjkLeaks catches Han text in visible, hidden, code, and accessible fields", () => {
  const leaks = findCjkLeaks([
    { kind: "visible-text", locator: "body", value: "English page with 中文" },
    { kind: "hidden-text", locator: "[hidden]", value: "稍后显示" },
    { kind: "code", locator: "pre code", value: '<Button aria-label="保存" />' },
    { kind: "title", locator: "document", value: "组件 · Hulian" },
    { kind: "alt", locator: "img", value: "头像" },
    { kind: "placeholder", locator: "input", value: "请输入" },
    { kind: "aria-label", locator: "button", value: "关闭" },
    { kind: "visible-text", locator: "p", value: "Full-width residue：" },
    { kind: "visible-text", locator: "main", value: "English only" },
  ]);

  assert.deepEqual(
    leaks.map(({ kind }) => kind),
    [
      "visible-text",
      "hidden-text",
      "code",
      "title",
      "alt",
      "placeholder",
      "aria-label",
      "visible-text",
    ],
  );
});

test("componentRouteFromHtmlPath maps exported component files to English routes", () => {
  assert.equal(componentRouteFromHtmlPath("button.html"), "/en/components/button");
  assert.equal(componentRouteFromHtmlPath("nested/item.html"), "/en/components/nested/item");
  assert.equal(componentRouteFromHtmlPath("index.html"), null);
});

test("ignores only aborted non-navigation prefetches", () => {
  assert.equal(
    isIgnorableRequestFailure({
      errorText: "net::ERR_ABORTED",
      resourceType: "fetch",
      isNavigationRequest: false,
    }),
    true,
  );
  assert.equal(
    isIgnorableRequestFailure({
      errorText: "net::ERR_ABORTED",
      resourceType: "document",
      isNavigationRequest: true,
    }),
    false,
  );
  assert.equal(
    isIgnorableRequestFailure({
      errorText: "net::ERR_NAME_NOT_RESOLVED",
      resourceType: "fetch",
      isNavigationRequest: false,
    }),
    false,
  );
});

test("validateShowcaseRouteResult rejects browser, load, and dynamic CJK failures", () => {
  assert.throws(
    () =>
      validateShowcaseRouteResult({
        route: "/en/components/dialog",
        phase: "dialog-open",
        status: 200,
        failed: ["http:404:/en/chunk.js"],
        leaks: [{ kind: "aria-label", locator: "button", value: "关闭" }],
      }),
    /dialog-open.*http:404.*aria-label.*关闭/s,
  );
});
