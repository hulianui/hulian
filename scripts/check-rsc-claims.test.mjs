import assert from "node:assert/strict";
import test from "node:test";

import { checkRscClaims, findClaims } from "./check-rsc-claims.mjs";

/** issue #307 里真实出现过的 13 处断言，逐条当回归样本。 */
const REGRESSIONS = [
  "- 暂无其他已知坑（纯 RSC，外链统一新窗打开）。",
  "| font | `string` | `bold 30px` | 标题字体；默认用系统字体栈，离线/RSC 安全 |",
  "> 点击火花 · 交互背景包裹器（canvas2d+RAF 零依赖·reduced-motion 静默·RSC 安全·jsdom 安全） · decoration/overlay-fx",
  "- reduced-motion 下静默不放火花；RSC/jsdom 环境安全（不报错），但实际火花需浏览器运行时。",
  "> 贡献活动墙 · 日期算术是纯函数 buildContributionCalendar 可测(零新依赖·RSC) · data-display/collection",
  "> 液态玻璃折射面 · SVG feDisplacementMap 三通道色散(零依赖·RSC client·reduced-motion 关过渡)",
  "> 轨道环绕 · 中心叠层(纯 CSS offset-path·零依赖·RSC 安全·reduced-motion) · decoration/overlay-fx",
  "OrbitImages 形状更丰富、可承载任意 ReactNode 子项、零依赖 RSC 安全。",
  "- 纯 CSS `offset-path` 驱动，零依赖 RSC 安全；但 `offset-path` 在老浏览器上有兼容差异。",
  "> 流体溅射光标 · 彩虹色相轮/固定 chart token 双模(canvas2d 零依赖·reduced-motion·RSC 安全)",
  "它是 canvas2d 零依赖 RSC 安全的纯特效层，`pointer-events-none` 不拦交互。",
  "- canvas2d 零依赖、RSC 安全、自带 `pointer-events-none` 不拦下层交互。",
  "> 打字指示 · 三点交错弹跳(纯CSS·RSC) + reduced-motion停 · ai/agent",
];

/** 英文侧的同类断言，含 #307 顺带修掉的两处机翻错译。 */
const REGRESSIONS_EN = [
  "- The component is an RSC, and all external record links open in a new window.",
  "| font | `string` | `bold 30px` | The default system font stack is offline- and RSC-safe. |",
  "> Click on sparks (canvas2d+RAF zero dependency·reduced-motion silent·RSC safety·jsdom safety)",
  "- No sparks are released silently under reduced-motion; the RSC/jsdom environment is safe.",
  "> Liquid glass refractive surface (zero dependency · RSC client · reduced-motion off transition)",
  "> Shape-based orbit layout (CSS `offset-path` · zero dependencies · RSC-safe · reduced-motion support)",
  "- Pure CSS `offset-path` driver, zero dependence on RSC security; however, compatibility differs.",
  "> Fluid splash cursor (canvas2d zero dependency·reduced-motion·RSC security)",
  "- canvas2d has zero dependency, RSC security, and comes with `pointer-events-none`.",
];

/** 这些是**准确**表述，门禁必须放行 —— 否则唯一的修法就成了「别提 RSC」，反而更差。 */
const ACCURATE = [
  // 否定语境：word-rotate 中英两侧的原文，一字未改地活到了今天
  "- 客户端组件，不能在纯 RSC 边界直接当 server 组件用；放进 server 页时它本身带 `\"use client\"` 可正常作为子组件渲染。",
  '- The `"use client"` component may be nested under a server component but is not itself a pure RSC.',
  "- 星位在客户端随机生成；本身是 `\"use client\"` 组件，可嵌进 server 页，但不能当纯 RSC 用。",
  // 中性提法：说的是使用位置，没有断言组件自身是什么
  "- WebGL/ogl 组件，仅客户端渲染；放在 RSC 页面里注意它是 `\"use client\"`。",
  "- 放进 RSC 页时确保挂在 client 子树或动态 import。",
  "- 在 RSC 页面里作客户端孤岛直接用。",
  "- 放进 RSC 树前注意它是 `\"use client\"`；SSR 阶段不渲染 canvas，只走 fallback。",
  // 修复后采用的写法，不能反过来被自己抓住
  "- 客户端组件（`\"use client\"`）：canvas 取不到时静默跳过，SSR 与 jsdom 下都不报错。",
  "> 打字指示 · 三点交错弹跳(纯CSS·客户端组件) + reduced-motion停 · ai/agent",
  '- Client component (`"use client"`): the canvas and the pointer listeners all live inside effects.',
  "- 默认用系统字体栈，不发网络请求、SSR 期也不会缺字。",
];

test("catches every claim that issue #307 found", () => {
  for (const line of REGRESSIONS) {
    assert.equal(findClaims(line).length > 0, true, `should flag: ${line.slice(0, 48)}`);
  }
});

test("catches the English counterparts too", () => {
  for (const line of REGRESSIONS_EN) {
    assert.equal(findClaims(line).length > 0, true, `should flag: ${line.slice(0, 48)}`);
  }
});

test("leaves accurate and neutral wording alone", () => {
  for (const line of ACCURATE) {
    assert.deepEqual(findClaims(line), [], `should allow: ${line.slice(0, 56)}`);
  }
});

test("reports the line number and the matched phrase", () => {
  const found = findClaims("第一行\n- 纯 CSS 驱动，零依赖 RSC 安全；仅此而已。\n第三行");
  assert.equal(found.length, 1);
  assert.equal(found[0].line, 2);
  assert.match(found[0].claim, /RSC\s*安全/);
});

test("escape hatch needs a stated reason", () => {
  assert.deepEqual(findClaims("- 纯 RSC 的历史说法 <!-- rsc-claim-ok: 讲的是上游库不是本组件 -->"), []);
  assert.equal(findClaims("- 纯 RSC 的历史说法 <!-- rsc-claim-ok: -->").length, 1);
});

test("the repository is clean", () => {
  const { findings, scanned } = checkRscClaims();
  assert.deepEqual(
    findings.map((f) => `${f.file}:${f.line} ${f.claim}`),
    [],
  );
  // 门禁只对客户端组件生效；这个数掉到 0 就说明 isClientComponent 判空了，等于门禁没在跑。
  assert.equal(scanned > 200, true, `expected to scan many client components, got ${scanned}`);
});
