import assert from "node:assert/strict";
import test from "node:test";

import { DOCS_ROUTES, MD_BREAKPOINT, VIEWPORTS, checkProbe, isDesktop } from "./viewport.mjs";
import * as viewport from "./viewport.mjs";
import { localeRoutePath } from "./docs-locale-layout.mjs";

const zh = (bare) => localeRoutePath(bare, "zh-CN");
const en = (bare) => localeRoutePath(bare, "en");

test("视口路由矩阵补齐中英文并去重已带语言前缀的路由", () => {
  assert.equal(typeof viewport.expandBilingualRoutes, "function");
  assert.deepEqual(
    viewport.expandBilingualRoutes([
      { route: zh("/components/button"), heading: "Button" },
      { route: en("/components/button"), heading: "Button" },
    ]),
    [
      { route: zh("/components/button"), heading: "Button", locale: "zh-CN" },
      { route: en("/components/button"), heading: "Button", locale: "en" },
    ],
  );
});

// 一份「全都对」的桌面快照，各用例只覆盖要断言的那一项。
const desktopProbe = {
  contentCount: 1,
  contentWidth: 1040,
  contentHeight: 820,
  headingText: "Button",
  headingVisible: true,
  siderDisplay: "flex",
  documentScrolls: false,
  scrollWidth: 1280,
  overflowX: false,
};

const mobileProbe = {
  contentCount: 1,
  contentWidth: 390,
  contentHeight: 4009,
  headingText: "Button",
  headingVisible: true,
  siderDisplay: "none",
  documentScrolls: true,
  scrollWidth: 390,
  overflowX: false,
  headingVisibleWithNavOpen: true,
  focusStuck: false,
};

const desktop = (patch) =>
  checkProbe({ route: "/components/button", heading: "Button", width: 1280, probe: { ...desktopProbe, ...patch } });
const mobile = (patch) =>
  checkProbe({ route: "/components/button", heading: "Button", width: 390, probe: { ...mobileProbe, ...patch } });

test("门禁覆盖 #39 报告的两条链路与 md 断点两侧", () => {
  assert.equal(MD_BREAKPOINT, 768);
  const widths = VIEWPORTS.map((v) => v.width);
  // 375 / 390 是 issue 指名的复现宽度；767 与 768 钉住断点两侧不漂。
  for (const w of [375, 390, 767, 768]) assert.ok(widths.includes(w), `缺少 ${w}px`);
  const routes = DOCS_ROUTES.map((r) => r.route);
  assert.ok(routes.some((r) => r.startsWith("/components")));
  assert.ok(routes.some((r) => r.startsWith("/theme")));
  assert.deepEqual(
    DOCS_ROUTES.filter(({ route }) => route.endsWith("/theme/color")).map(
      ({ route, locale, heading }) => ({ route, locale, heading }),
    ),
    [
      { route: zh("/theme/color"), locale: "zh-CN", heading: "颜色" },
      { route: en("/theme/color"), locale: "en", heading: "Color" },
    ],
  );
});

test("767 归移动端、768 归桌面 —— 断点两侧不许各自解释", () => {
  assert.equal(isDesktop(767), false);
  assert.equal(isDesktop(768), true);
});

test("正常快照零失败", () => {
  assert.deepEqual(desktop(), []);
  assert.deepEqual(mobile(), []);
});

test("#39 本体：正文区域 0×0 必须失败（内容仍在 DOM 里也不放过）", () => {
  const failures = mobile({ contentWidth: 0, contentHeight: 0 });
  assert.match(failures.join("\n"), /正文区域 0×0/);
});

test("正文被复制成移动/桌面两份必须失败", () => {
  assert.match(mobile({ contentCount: 2 }).join("\n"), /正文出口数 2/);
  assert.match(desktop({ contentCount: 0 }).join("\n"), /正文出口数 0/);
});

test("h1 缺失、文本不符、或不可见都失败", () => {
  assert.match(mobile({ headingVisible: false }).join("\n"), /h1 不可见/);
  assert.match(mobile({ headingText: "别的" }).join("\n"), /应为 "Button"/);
});

test("视口失败原因带语言，避免双语矩阵里无法定位", () => {
  const failures = checkProbe({
    route: "/en/components/button",
    locale: "en",
    heading: "Button",
    width: 390,
    probe: { ...mobileProbe, contentWidth: 0, contentHeight: 0 },
  });
  assert.match(failures.join("\n"), /\[en\].*\/en\/components\/button/);
});

test("不许靠横向滚出屏幕冒充「显示」", () => {
  assert.match(mobile({ overflowX: true, scrollWidth: 1280 }).join("\n"), /横向溢出/);
});

test("桌面必须保留侧栏且由 Content 独立滚动", () => {
  assert.match(desktop({ siderDisplay: "none" }).join("\n"), /桌面侧栏缺失/);
  assert.match(desktop({ siderDisplay: "absent" }).join("\n"), /桌面侧栏缺失/);
  assert.match(desktop({ documentScrolls: true }).join("\n"), /桌面整页在滚动/);
});

test("移动端必须收起侧栏，且不检查桌面专属的滚动归属", () => {
  assert.match(mobile({ siderDisplay: "flex" }).join("\n"), /移动端侧栏未收起/);
  // 移动端整页滚动是正确行为，不该被判失败。
  assert.deepEqual(mobile({ documentScrolls: true }), []);
});

test("折叠导航展开后正文不可达 / 焦点原地不动都失败", () => {
  assert.match(mobile({ headingVisibleWithNavOpen: false }).join("\n"), /展开折叠导航后 h1 不可见/);
  assert.match(mobile({ focusStuck: true }).join("\n"), /键盘陷阱/);
});
