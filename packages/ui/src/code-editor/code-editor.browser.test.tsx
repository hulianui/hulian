import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { CodeEditor } from "./code-editor";

/**
 * CodeEditor 的正确性有一半是**几何**：透明 textarea、染色 <pre>、行号槽三层必须逐项等度量，
 * 差半像素就表现为「光标和字错位」。jsdom 没有布局引擎（computed style 拿不到真实
 * font/line-height 解析值、scrollTop 恒 0），这类断言只能在真实浏览器里写。
 *
 * 这里守两件事：
 *   1. 三层度量一致 —— 也顺带守住 `leading-[var(--hl-ce-line-height)]` 这类任意值类
 *      真的被 Tailwind 生成了（类名没生成时不会报错，只会静默退回默认行高）。
 *   2. 滚动同步 —— 高亮层与行号槽是 overflow-hidden，靠程序化 scrollTop/scrollLeft 跟随。
 */

afterEach(cleanup);

const LONG_LINE = "const x = " + "'0123456789'.repeat(8) + ".repeat(6) + "1;";
const CODE = Array.from({ length: 40 }, (_, i) => `${LONG_LINE} // line ${i}`).join("\n");

function setup(props: Record<string, unknown> = {}) {
  const { container } = render(
    <CodeEditor value={CODE} onChange={() => {}} className="h-[160px] w-[320px]" {...props} />,
  );
  return {
    area: container.querySelector("textarea")!,
    pre: container.querySelector<HTMLElement>('[data-slot="code-editor-highlight"]')!,
    gutter: container.querySelector<HTMLElement>('[data-slot="code-editor-gutter"]')!,
  };
}

describe("CodeEditor 三层度量对齐", () => {
  it("textarea 与高亮层的字体/行高/内边距/换行/制表位逐项相等", () => {
    const { area, pre } = setup();
    const a = getComputedStyle(area);
    const p = getComputedStyle(pre);
    for (const prop of [
      "fontFamily",
      "fontSize",
      "lineHeight",
      "letterSpacing",
      "fontWeight",
      "whiteSpace",
      "tabSize",
      "paddingTop",
      "paddingLeft",
      "paddingRight",
      "paddingBottom",
    ] as const) {
      expect(`${prop}=${p[prop]}`).toBe(`${prop}=${a[prop]}`);
    }
  });

  it("行号槽与代码行行高一致（行号才不会跟代码越差越远）", () => {
    const { pre, gutter } = setup();
    const codeLine = pre.querySelector("div")!.getBoundingClientRect();
    const numberLine = gutter.querySelector("div")!.getBoundingClientRect();
    expect(numberLine.height).toBeCloseTo(codeLine.height, 1);
  });

  it("第 N 行的行号与第 N 行代码顶端对齐（三层纵向零漂移）", () => {
    const { pre, gutter } = setup();
    const codeLines = pre.querySelectorAll("div");
    const numbers = gutter.querySelectorAll("div");
    for (const i of [0, 9, 25, 39]) {
      const dy = numbers[i].getBoundingClientRect().top - codeLines[i].getBoundingClientRect().top;
      expect(Math.abs(dy)).toBeLessThan(1);
    }
  });

  it("lineHeight prop 真的改变渲染行高（守住任意值类被生成）", () => {
    const tight = setup({ lineHeight: 1.2 });
    const tightHeight = tight.pre.querySelector("div")!.getBoundingClientRect().height;
    cleanup();
    const loose = setup({ lineHeight: 2.4 });
    const looseHeight = loose.pre.querySelector("div")!.getBoundingClientRect().height;
    expect(looseHeight).toBeGreaterThan(tightHeight * 1.5);
  });

  it("长行不换行（wrap=off + white-space: pre），否则行号会立刻说谎", () => {
    const { pre } = setup();
    expect(pre.querySelectorAll("div").length).toBe(CODE.split("\n").length);
    expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth);
  });
});

describe("CodeEditor 滚动同步", () => {
  it("纵向：高亮层与行号槽都跟随 textarea", () => {
    const { area, pre, gutter } = setup();
    area.scrollTop = 120;
    area.dispatchEvent(new Event("scroll", { bubbles: true }));
    expect(pre.scrollTop).toBe(120);
    expect(gutter.scrollTop).toBe(120);
  });

  it("横向：只有高亮层跟随，行号槽保持钉在左侧", () => {
    const { area, pre, gutter } = setup();
    area.scrollLeft = 200;
    area.dispatchEvent(new Event("scroll", { bubbles: true }));
    expect(pre.scrollLeft).toBe(200);
    expect(gutter.scrollLeft).toBe(0);
  });

  it("当前行底色横向铺满内容宽度（横滚后不在容器右缘断掉）", () => {
    const { pre } = setup();
    const line = pre.querySelector("div")!;
    expect(line.getBoundingClientRect().width).toBeGreaterThan(pre.clientWidth);
  });
});
