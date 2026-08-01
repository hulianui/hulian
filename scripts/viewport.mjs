#!/usr/bin/env node

import { pathToFileURL } from "node:url";

import { gotoAndSettle, startStaticServer } from "./static-server.mjs";

// 响应式文档门禁 —— 拦 hulianui/hulian#39 那一类「正文只在桌面分支里」的回归。
//
// 那个 bug 的要害是：正文**被生成了**（SSR HTML 里有、sitemap 有、axe 也扫得到），
// 只是祖先 display:none。所以 a11y 门禁、构建、类型检查全绿都拦不住它，必须有一道
// 按视口量**几何**的门禁：元素在这个宽度下到底占不占面积。
//
// 判据全部落在纯函数 checkProbe 上（scripts/viewport.test.mjs 覆盖），
// 浏览器侧只负责取一份 probe 快照，好让判据本身也能被测试。

/** md 断点 = 768px。< md 走单列文档滚动，>= md 走 Sider + Content 双滚动。 */
export const MD_BREAKPOINT = 768;

export const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "390", width: 390, height: 844 },
  { name: "767", width: 767, height: 900 },
  { name: "768", width: 768, height: 900 },
  { name: "1280", width: 1280, height: 900 },
];

// 覆盖 #39 报告的两条链路（/components/** 与 /theme/**）各自的画廊页与详情页。
export const DOCS_ROUTES = [
  { route: "/components", heading: "组件" },
  { route: "/components/button", heading: "Button" },
  { route: "/theme", heading: "主题与设计 Token" },
  { route: "/theme/color", heading: "颜色" },
];

export const isDesktop = (width) => width >= MD_BREAKPOINT;

/**
 * 判据。probe 是浏览器侧取的一份快照，见 PROBE 源码。
 * 返回失败原因数组，空数组 = 通过。
 */
export function checkProbe({ route, heading, width, probe }) {
  const failures = [];
  const desktop = isDesktop(width);

  // —— 全断点共通 ——
  // 1. 正文有唯一出口：多于一个 = 有人又把 {children} 复制成了移动/桌面两份。
  if (probe.contentCount !== 1) {
    failures.push(`正文出口数 ${probe.contentCount}（应为 1；>1 说明 children 被双挂载）`);
  }
  // 2. 正文真的占面积（#39 的直接判据：祖先 display:none 时这里是 0×0）。
  if (!(probe.contentWidth > 0 && probe.contentHeight > 0)) {
    failures.push(`正文区域 ${probe.contentWidth}×${probe.contentHeight}（被祖先隐藏或塌缩）`);
  }
  // 3. h1 可见且是本页标题。
  if (!probe.headingVisible) {
    failures.push(`h1 不可见（文本 ${JSON.stringify(probe.headingText)}）`);
  }
  if (heading && probe.headingText?.trim() !== heading) {
    failures.push(`h1 文本为 ${JSON.stringify(probe.headingText)}，应为 ${JSON.stringify(heading)}`);
  }
  // 4. 不许靠横向滚出屏幕来「显示」内容。
  if (probe.overflowX) {
    failures.push(`文档横向溢出（scrollWidth ${probe.scrollWidth} > 视口 ${width}）`);
  }

  // —— 分断点 ——
  if (desktop) {
    // 桌面保持侧栏 + 内容独立滚动：外壳定高，故文档本身不滚。
    if (probe.siderDisplay === "none" || probe.siderDisplay === "absent") {
      failures.push(`桌面侧栏缺失（display=${probe.siderDisplay}）`);
    }
    if (probe.documentScrolls) {
      failures.push("桌面整页在滚动，应由 Layout.Content 独立滚动");
    }
  } else {
    // 移动端退化为单列：侧栏收起，正文随文档滚动（不再有定高的内滚容器）。
    if (probe.siderDisplay !== "none" && probe.siderDisplay !== "absent") {
      failures.push(`移动端侧栏未收起（display=${probe.siderDisplay}）`);
    }
    // 折叠导航展开后正文仍可达 —— #39 验收明确要求。
    if (!probe.headingVisibleWithNavOpen) {
      failures.push("移动端展开折叠导航后 h1 不可见");
    }
    if (probe.focusStuck) {
      failures.push("移动端折叠导航内 Tab 焦点原地不动（键盘陷阱）");
    }
  }

  return failures;
}

// 浏览器侧快照。必须是**真函数**而不是函数源码字符串：page.evaluate 收到字符串时按
// 表达式求值，`"() => {…}"` 只会求出一个函数对象、拿不到调用结果（probe 会是 undefined）。
function probeDocsLayout() {
  const rect = (el) => (el ? el.getBoundingClientRect() : null);
  const visible = (el) => {
    const r = rect(el);
    return !!r && r.width > 0 && r.height > 0;
  };
  const content = document.querySelector("main[data-layout-content]");
  const contentRect = rect(content);
  const heading = document.querySelector("h1");
  const sider = document.querySelector("aside[data-layout-sider]");
  return {
    contentCount: document.querySelectorAll("main[data-layout-content]").length,
    contentWidth: contentRect ? Math.round(contentRect.width) : 0,
    contentHeight: contentRect ? Math.round(contentRect.height) : 0,
    headingText: heading ? heading.textContent : null,
    headingVisible: visible(heading),
    siderDisplay: sider ? getComputedStyle(sider).display : "absent",
    documentScrolls: document.documentElement.scrollHeight > window.innerHeight + 1,
    scrollWidth: document.documentElement.scrollWidth,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
  };
}

// 移动端补测：展开 <details> 折叠导航后，正文是否仍可见；并从 summary 起连按 Tab，
// 确认焦点会移动（原地不动 = 陷阱）。363 项的组件树 Tab 不完，故只取前若干步判「动没动」。
async function probeMobileNav() {
  const details = document.querySelector("details");
  if (!details) return { headingVisibleWithNavOpen: true, focusStuck: false };
  details.open = true;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const heading = document.querySelector("h1");
  const r = heading ? heading.getBoundingClientRect() : null;
  const summary = details.querySelector("summary");
  if (summary) summary.focus();
  const seen = [];
  for (let i = 0; i < 6; i += 1) {
    seen.push(document.activeElement);
    const focusables = Array.from(
      document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, summary, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.getBoundingClientRect().width > 0);
    const at = focusables.indexOf(document.activeElement);
    const next = focusables[at + 1];
    if (!next) break;
    next.focus();
  }
  return {
    headingVisibleWithNavOpen: !!r && r.width > 0 && r.height > 0,
    focusStuck: new Set(seen).size <= 1,
  };
}

export async function runViewportGate() {
  const { chromium } = await import("playwright");
  const staticServer = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      try {
        for (const { route, heading } of DOCS_ROUTES) {
          const page = await context.newPage();
          await gotoAndSettle(page, `${staticServer.baseUrl}${route}`);
          let probe = await page.evaluate(probeDocsLayout);
          if (!isDesktop(viewport.width)) {
            probe = { ...probe, ...(await page.evaluate(probeMobileNav)) };
          }
          results.push({
            route,
            heading,
            width: viewport.width,
            failures: checkProbe({ route, heading, width: viewport.width, probe }),
          });
          await page.close();
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await staticServer.close();
  }

  let failed = 0;
  for (const result of results) {
    if (result.failures.length === 0) {
      console.log(`[viewport] ${result.width}px ${result.route} · OK`);
      continue;
    }
    failed += 1;
    console.log(`[viewport] ${result.width}px ${result.route} · FAIL`);
    for (const reason of result.failures) console.log(`    ${reason}`);
  }
  if (failed > 0) throw new Error(`视口门禁失败 ${failed}/${results.length} 组`);
  console.log(`[viewport] PASS ${results.length}/${results.length} 组（视口 × 路由）`);
  return results;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runViewportGate().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
