import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { overlayTransitions, transitionCss, TRANSFORM_TRANSITION_PROPERTIES } from "./transition";

/** 变换段的时长形态：token 时长乘减弱动效系数（reduce 时系数为 0 → 瞬时）。 */
const reducible = (ms: string) => `calc(${ms} * var(--hl-motion-transform-factor, 1))`;

/**
 * 按顶层逗号拆过渡串 —— 不能直接 `split(", ")`：变换段的时长是
 * `calc(200ms * var(--hl-motion-transform-factor, 1))`，`var()` 回退值里的逗号会把它劈成两半。
 * CSS 解析器本身是括号感知的，这里照着来。
 */
function segments(transition: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of transition) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      out.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

describe("transitionCss", () => {
  it("transform 展开成四个独立变换属性，时长与曲线逐项相同", () => {
    const css = transitionCss({ property: "transform", duration: "base" });
    const parts = segments(css);
    expect(parts.map((p) => p.split(" ")[0])).toEqual([...TRANSFORM_TRANSITION_PROPERTIES]);
    for (const p of parts)
      expect(p).toBe(`${p.split(" ")[0]} ${reducible("200ms")} cubic-bezier(0.16, 1, 0.3, 1)`);
  });

  it("其它属性原样一项，ease 缺省 out", () => {
    expect(transitionCss({ property: "opacity", duration: "fast" })).toBe(
      "opacity 150ms cubic-bezier(0.16, 1, 0.3, 1)",
    );
  });
});

describe("overlayTransitions", () => {
  // #341 的核心断言：入场用的是 scale / translate 属性，过渡列表里必须有它们。
  it("popup 同时过渡 opacity 与 scale / translate", () => {
    expect(overlayTransitions.popup.transition).toContain(`scale ${reducible("200ms")}`);
    expect(overlayTransitions.popup.transition).toContain(`translate ${reducible("200ms")}`);
    expect(overlayTransitions.popup.transition).toContain("opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)");
  });

  it("slide 的位移走 slow + 抽屉曲线，淡入仍是 base", () => {
    expect(overlayTransitions.slide.transition).toContain(
      `translate ${reducible("300ms")} cubic-bezier(0.32, 0.72, 0, 1)`,
    );
    expect(overlayTransitions.slide.transition).toContain("opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)");
  });

  // 减弱动效只压变换，不压淡入：淡入不产生位移，且是「浮层出现了」最低成本的线索。
  it("opacity 段不带减弱动效系数", () => {
    for (const preset of Object.values(overlayTransitions)) {
      const opacitySegment = segments(preset.transition).find((seg) => seg.startsWith("opacity"));
      expect(opacitySegment).toBeDefined();
      expect(opacitySegment).not.toContain("--hl-motion-transform-factor");
    }
  });

  it("backdrop / fade 不碰变换属性", () => {
    expect(overlayTransitions.backdrop.transition).not.toMatch(/transform|scale|translate/);
    expect(overlayTransitions.fade.transition).not.toMatch(/transform|scale|translate/);
  });
});

// 源码守卫：不许再手写「带 transform 的 motion token 过渡串」。判据锚在 `${motionDurationCss`
// 上 —— Tilt 之类真的在动 `transform` 属性、时长由 prop 决定的写法自然不命中。
describe("浮层过渡串不许手写（#341）", () => {
  function listTsx(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return listTsx(full);
      return entry.name.endsWith(".tsx") && !entry.name.includes(".test.") ? [full] : [];
    });
  }

  it("src 里没有模板串既含 transform 又引用 motion 时长 token", () => {
    const root = join(__dirname, "..");
    const offenders = listTsx(root).filter((file) => {
      const literals = readFileSync(file, "utf8").match(/`[^`]*`/gu) ?? [];
      // 两个条件缺一不可：Tilt 动的是真 `transform` 属性、时长来自 prop（不含 token），
      // Tour 用 `all`（覆盖独立变换属性）——都不是 #341 的形状，不该被拦。
      return literals.some((lit) => lit.includes("transform") && lit.includes("motionDurationCss"));
    });
    expect(offenders.map((f) => f.slice(root.length + 1))).toEqual([]);
  });
});
