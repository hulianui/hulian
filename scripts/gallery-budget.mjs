#!/usr/bin/env node

import { pathToFileURL } from "node:url";

import { gotoAndSettle, startStaticServer } from "./static-server.mjs";
import { expandBilingualRoutes, formatRouteLabel } from "./a11y.mjs";

export { expandBilingualRoutes } from "./a11y.mjs";

// 画廊预算门禁 —— 拦 hulianui/hulian#40 那一类「把整座画廊当活组件同时挂上」的回归。
//
// /pages 曾把 20 个整页预览全部挂进当前文档（顶层 6353 节点）。这不是字节问题：
// 预览里的 Marquee、计数动效、表单、弹层、图片会在画廊上下文里**真实运行**，
// `inert` 只挡交互挡不住 effect —— 控制台那批头像 "preloaded but not used" 就是证据。
//
// 所以门禁量三件事，并且都要**同时**守住：
//   1. 已挂载预览数 —— 防「换个写法又全量挂上」
//   2. 顶层 DOM 节点数 —— 防「预览没挂但别处又堆回去」
//   3. 控制台 warning 数 —— 防「挂载省了，但资源仍在预加载」
// 判据是纯函数 checkBudget（scripts/gallery-budget.test.mjs 覆盖）。

/**
 * 各画廊的预算。数字来自静态导出产物上的实测值 + 余量，不是拍脑袋：
 * 收紧到「刚好卡住当前实现」会让任何无关改动都红，留太松则等于没门禁。
 */
export const GALLERY_BUDGETS = expandBilingualRoutes([
  {
    route: "/pages",
    /** 该画廊总共有多少个预览（低于此说明卡片渲染坏了，不是「优化」）。 */
    minPreviews: 18,
    /** 首屏加载完成时允许已挂载的预览数上限。 */
    maxMountedOnLoad: 12,
    /** 顶层 document 节点数上限。修复前实测 6353。 */
    maxDomNodes: 4200,
    maxConsoleWarnings: 6,
  },
  {
    route: "/blocks",
    minPreviews: 40,
    maxMountedOnLoad: 18,
    maxDomNodes: 4200,
    maxConsoleWarnings: 6,
  },
  {
    // 组件画廊：299 张活预览（装饰件按 canPreviewCategory 排除，理由见 lib/gallery-preview.ts），
    // 全站预览最密的一页。首屏实测：已挂载 6 个、DOM 4935，下面的预算按实测留余量。
    // DOM 基线本就比 /blocks 高——299 张卡片自身的节点摆在那，与预览无关。
    route: "/components",
    minPreviews: 250,
    maxMountedOnLoad: 16,
    maxDomNodes: 6000,
    maxConsoleWarnings: 6,
  },
]);

/** 判据。probe 见 probeGallery；返回失败原因数组，空 = 通过。 */
export function checkBudget(budget, probe) {
  const failures = [];
  if (probe.previewTotal < budget.minPreviews) {
    failures.push(
      `预览卡片只有 ${probe.previewTotal} 个（应 ≥ ${budget.minPreviews}）—— 画廊本身渲染坏了，不是变快了`,
    );
  }
  if (probe.mounted > budget.maxMountedOnLoad) {
    failures.push(
      `首屏已挂载 ${probe.mounted} 个活预览（预算 ${budget.maxMountedOnLoad}）—— 按需挂载失效`,
    );
  }
  // 全量挂载的典型特征：挂载数 == 总数。单独点名，报错更好读。
  if (probe.previewTotal > 0 && probe.mounted === probe.previewTotal) {
    failures.push(`全部 ${probe.previewTotal} 个预览都被挂载 —— 回到了「整座画廊同时运行」`);
  }
  if (probe.domNodes > budget.maxDomNodes) {
    failures.push(`顶层 DOM ${probe.domNodes} 个节点（预算 ${budget.maxDomNodes}）`);
  }
  if (probe.consoleWarnings > budget.maxConsoleWarnings) {
    failures.push(`控制台 warning ${probe.consoleWarnings} 条（预算 ${budget.maxConsoleWarnings}）`);
  }
  // 缩略图是纯视觉：不可交互、不进 tab 顺序。回归了会让键盘用户在画廊里迷路。
  //
  // 判据刻意不是「缩略图内有没有 a/button」—— 预览就是真实区块，里面当然有。
  // 要断言的是**它们焦点拿不到**：inert 生效时 .focus() 是空操作。
  if (probe.thumbsMissingInert > 0) {
    failures.push(`${probe.thumbsMissingInert} 个缩略图缺 inert/aria-hidden（会进 tab 顺序与无障碍树）`);
  }
  if (probe.focusEscapes > 0) {
    failures.push(`缩略图内有 ${probe.focusEscapes} 个元素真的拿到了焦点（inert 失效）`);
  }
  const label = formatRouteLabel(budget);
  return failures.map((failure) => `${label}: ${failure}`);
}

// 必须是真函数：page.evaluate 收字符串时按表达式求值，函数源码只会求出个函数对象。
function probeGallery() {
  // 两种缩略图都要盯：整页/区块用 PreviewThumbnail（按设计宽缩放），
  // 组件画廊用 ComponentThumbnail（按内容自适应缩放）。预算判据对两者一致。
  const thumbs = Array.from(
    document.querySelectorAll("[data-preview-thumbnail], [data-component-thumbnail]"),
  );
  const mounted = thumbs.filter((t) => t.hasAttribute("data-mounted"));
  const thumbsMissingInert = thumbs.filter(
    (t) => !t.hasAttribute("inert") || t.getAttribute("aria-hidden") !== "true",
  ).length;

  // 真去 focus 一遍：inert 生效时 .focus() 不会改变 activeElement。
  // 每张缩略图取前 3 个候选即可 —— 要证的是「inert 有没有生效」，不是逐个点名。
  const before = document.activeElement;
  let focusEscapes = 0;
  for (const t of mounted) {
    const candidates = Array.from(
      t.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]'),
    ).slice(0, 3);
    for (const el of candidates) {
      el.focus?.();
      if (document.activeElement === el) focusEscapes += 1;
    }
  }
  before?.focus?.();

  return {
    previewTotal: thumbs.length,
    mounted: mounted.length,
    domNodes: document.getElementsByTagName("*").length,
    thumbsMissingInert,
    focusEscapes,
  };
}

export async function runGalleryBudget() {
  const { chromium } = await import("playwright");
  const staticServer = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const budget of GALLERY_BUDGETS) {
      // 固定 1280×900：预算是按视口量的，跟着运行机器的窗口大小漂就没有可比性。
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      let consoleWarnings = 0;
      page.on("console", (message) => {
        if (message.type() === "warning") consoleWarnings += 1;
      });
      // 多等一会儿：预算量的是「稳定后」的挂载数，IO 与瀑布流列高要settle 完。
      await gotoAndSettle(page, `${staticServer.baseUrl}${budget.route}`, { settleMs: 900 });
      const probe = { ...(await page.evaluate(probeGallery)), consoleWarnings };
      results.push({
        route: budget.route,
        locale: budget.locale,
        probe,
        failures: checkBudget(budget, probe),
      });
      await context.close();
    }
  } finally {
    await browser.close();
    await staticServer.close();
  }

  let failed = 0;
  for (const r of results) {
    const { previewTotal, mounted, domNodes, consoleWarnings } = r.probe;
    const line = `预览 ${mounted}/${previewTotal} 已挂载 · DOM ${domNodes} · warning ${consoleWarnings}`;
    if (r.failures.length === 0) {
      console.log(`[gallery] ${formatRouteLabel(r)} · OK · ${line}`);
      continue;
    }
    failed += 1;
    console.log(`[gallery] ${formatRouteLabel(r)} · FAIL · ${line}`);
    for (const reason of r.failures) console.log(`    ${reason}`);
  }
  if (failed > 0) throw new Error(`画廊预算门禁失败 ${failed}/${results.length} 条路由`);
  console.log(`[gallery] PASS ${results.length}/${results.length} 条路由`);
  return results;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runGalleryBudget().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
