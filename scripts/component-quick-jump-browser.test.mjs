import assert from "node:assert/strict";
import test from "node:test";

import { localeRoutePath } from "./docs-locale-layout.mjs";

const gate = await import("./component-quick-jump-browser.mjs").catch(() => ({}));

const EN_BUTTON = localeRoutePath("/components/button", "en");
const ZH_BUTTON = localeRoutePath("/components/button", "zh-CN");

test("真实浏览器矩阵覆盖 Button、按钮、button 与 375/桌面视口", () => {
  assert.equal(typeof gate.buildQuickJumpCases, "function");
  assert.deepEqual(gate.QUICK_JUMP_QUERIES, ["Button", "按钮", "button"]);
  assert.deepEqual(gate.QUICK_JUMP_VIEWPORTS, [
    { name: "mobile", width: 375, height: 812 },
    { name: "desktop", width: 1280, height: 900 },
  ]);
  assert.equal(gate.buildQuickJumpCases().length, 12);
  assert.deepEqual(
    gate
      .buildQuickJumpCases()
      .filter(({ query, viewport }) => query === "按钮" && viewport.name === "mobile")
      .map(({ locale, sourceRoute, targetRoute }) => ({ locale, sourceRoute, targetRoute })),
    [
      {
        locale: "zh-CN",
        sourceRoute: localeRoutePath("/components", "zh-CN"),
        targetRoute: localeRoutePath("/components/button", "zh-CN"),
      },
      {
        locale: "en",
        sourceRoute: localeRoutePath("/components", "en"),
        targetRoute: localeRoutePath("/components/button", "en"),
      },
    ],
  );
});

test("快速直达快照要求同语言详情、正确 lang 与可见焦点", () => {
  assert.equal(typeof gate.checkQuickJumpSnapshot, "function");
  assert.deepEqual(
    gate.checkQuickJumpSnapshot({
      locale: "en",
      query: "按钮",
      viewport: "mobile",
      targetRoute: EN_BUTTON,
      pathname: EN_BUTTON,
      documentLang: "en",
      heading: "Button",
      focusVisible: true,
    }),
    [],
  );

  const failures = gate.checkQuickJumpSnapshot({
    locale: "en",
    query: "button",
    viewport: "desktop",
    targetRoute: EN_BUTTON,
    // 落到另一语种的路径 → 应报 lost same-language route
    pathname: ZH_BUTTON,
    documentLang: "zh-CN",
    heading: "Button",
    focusVisible: false,
  });
  assert.match(failures.join("\n"), /\[en\].*lost same-language route/i);
  assert.match(failures.join("\n"), /\[en\].*document lang/i);
  assert.match(failures.join("\n"), /\[en\].*focus/i);
});

test("语言切换快照必须保留路径、query、hash 并更新 lang", () => {
  assert.equal(typeof gate.checkLanguageSwitchSnapshot, "function");
  assert.deepEqual(
    gate.checkLanguageSwitchSnapshot({
      sourceLocale: "zh-CN",
      targetLocale: "en",
      beforeUrl: `${ZH_BUTTON}?from=quick-jump#api`,
      afterUrl: `${EN_BUTTON}?from=quick-jump#api`,
      documentLang: "en",
    }),
    [],
  );

  const failures = gate.checkLanguageSwitchSnapshot({
    sourceLocale: "en",
    targetLocale: "zh-CN",
    beforeUrl: `${EN_BUTTON}?from=quick-jump#api`,
    afterUrl: ZH_BUTTON,
    documentLang: "en",
  });
  assert.match(failures.join("\n"), /\[en→zh-CN\].*query/i);
  assert.match(failures.join("\n"), /\[en→zh-CN\].*hash/i);
  assert.match(failures.join("\n"), /\[en→zh-CN\].*document lang/i);
});

test("浏览器异常保留 locale、viewport 与 query 上下文", async () => {
  assert.equal(typeof gate.withQuickJumpCaseContext, "function");
  await assert.rejects(
    gate.withQuickJumpCaseContext(
      { locale: "en", query: "按钮", viewport: { name: "mobile" } },
      async () => {
        throw new Error("navigation timeout");
      },
    ),
    /\[en\] mobile "按钮".*navigation timeout/,
  );
});
