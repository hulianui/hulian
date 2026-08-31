import { describe, it, expect, afterEach } from "vitest";
import { resolveColor } from "./meta-balls";

/**
 * 颜色解析走真实浏览器：jsdom 既没有 canvas 2d 上下文（`getContext("2d")` 返回 null），
 * 也不做 `oklch()`/`lab()` → sRGB 的色彩空间换算，这里的断言在 jsdom 下全部不可信。
 *
 * 守的是一个真实上过线的回归：原实现拿 `/rgba?\(...\)/` 正则去解析计算值，
 * 而本库的 oklch token 经 Lightning CSS 降级后计算值是 `lab(...)` —— 正则永远不匹配，
 * 于是 color / cursorBallColor **全部**静默落到兜底中性灰，配色 prop 形同虚设。
 * 单测、typecheck、guard 都看不见（颜色只活在 shader uniform 里），只能靠这条。
 */

const FALLBACK: [number, number, number] = [0.8, 0.8, 0.85];
const near = (a: number, b: number) => Math.abs(a - b) <= 2 / 255;

afterEach(() => {
  document.querySelectorAll("[data-mb-host]").forEach((n) => n.remove());
});

function host(cssText = "") {
  const el = document.createElement("div");
  el.setAttribute("data-mb-host", "");
  el.style.cssText = cssText;
  document.body.appendChild(el);
  const child = document.createElement("div");
  el.appendChild(child);
  return child;
}

describe("MetaBalls resolveColor", () => {
  it("十六进制原样解析", () => {
    const [r, g, b] = resolveColor("#ff8000", host());
    expect(near(r, 1)).toBe(true);
    expect(near(g, 0x80 / 255)).toBe(true);
    expect(near(b, 0)).toBe(true);
  });

  it("oklch() 字面量解析成非兜底色（走的是画布换算，不是正则）", () => {
    const rgb = resolveColor("oklch(0.75 0.15 70)", host());
    expect(rgb).not.toEqual(FALLBACK);
    // 0.75 亮度 / 70° 色相 = 橙：R 最大、B 最小
    expect(rgb[0]).toBeGreaterThan(rgb[1]);
    expect(rgb[1]).toBeGreaterThan(rgb[2]);
  });

  it("lab() 字面量解析成非兜底色（Lightning CSS 降级后 token 就长这样）", () => {
    const rgb = resolveColor("lab(70.6914 24.1602 66.1517)", host());
    expect(rgb).not.toEqual(FALLBACK);
    expect(rgb[0]).toBeGreaterThan(rgb[2]);
  });

  it("var() token 按容器上的定义解析，且不落兜底", () => {
    const el = host("--mb-token: oklch(0.62 0.19 255)");
    const rgb = resolveColor("var(--mb-token)", el);
    expect(rgb).not.toEqual(FALLBACK);
    // 255° 色相 = 蓝：B 最大
    expect(rgb[2]).toBeGreaterThan(rgb[0]);
  });

  it("同一个 var() 在两个主题岛里解析出不同的值（探针挂在组件自己的子树内）", () => {
    const light = host("--mb-token: #ff0000");
    const dark = host("--mb-token: #0000ff");
    expect(resolveColor("var(--mb-token)", light)[0]).toBeGreaterThan(0.9);
    expect(resolveColor("var(--mb-token)", dark)[2]).toBeGreaterThan(0.9);
  });

  it("非法字面量回兜底中性灰，而不是静默继承祖先文字色", () => {
    const el = host("color: #000");
    expect(resolveColor("definitely-not-a-color", el)).toEqual(FALLBACK);
  });

  it("未定义的 var() 回兜底中性灰（否则「配错色」会表现成「球是黑的」）", () => {
    const el = host("color: #000");
    expect(resolveColor("var(--mb-token-that-does-not-exist)", el)).toEqual(FALLBACK);
  });

  it("带兜底值的 var() 仍然按兜底值解析", () => {
    const rgb = resolveColor("var(--mb-nope, #00ff00)", host());
    expect(rgb[1]).toBeGreaterThan(0.9);
    expect(rgb[0]).toBeLessThan(0.1);
  });
});
