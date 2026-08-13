import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";
import { TextReveal } from "./text-reveal";

// jsdom 没有 IntersectionObserver，组件对此有兜底（直接开扫）。这里装一个可控的假实现，
// 用来验 startOnView / once 两条分支。
type Cb = (entries: { isIntersecting: boolean }[]) => void;
let observers: { cb: Cb; disconnect: () => void }[] = [];

function installIO() {
  observers = [];
  class FakeIO {
    cb: Cb;
    constructor(cb: Cb) {
      this.cb = cb;
      observers.push({ cb, disconnect: () => this.disconnect() });
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", FakeIO);
}
const intersect = (hit: boolean) =>
  act(() => {
    for (const o of observers) o.cb([{ isIntersecting: hit }]);
  });

describe("TextReveal", () => {
  beforeEach(() => {
    observers = [];
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("文字靠 background-clip 揭示：色带是渐变、字身透明", () => {
    const { container } = render(<TextReveal text="OCR 中" />);
    const el = container.querySelector("span") as HTMLSpanElement;
    expect(el.textContent).toBe("OCR 中");
    expect(el.getAttribute("class")).toContain("bg-clip-text");
    expect(el.getAttribute("class")).toContain("text-transparent");
    expect(el.style.backgroundSize).toBe("300% 100%");
  });

  it("默认五色带吃主题 token，已揭示段是 textColor", () => {
    const { container } = render(<TextReveal text="解析中" />);
    const bg = (container.querySelector("span") as HTMLSpanElement).style.backgroundImage;
    for (const i of [1, 2, 3, 4, 5]) expect(bg).toContain(`var(--color-chart-${i})`);
    expect(bg).toContain("var(--color-foreground) 0%");
    expect(bg).toContain("transparent 100%");
  });

  it("色带两端落在 (33.3%, 66.7%) 内：起点整串透明、终点整串实色，不会「还没扫左边就有色」", () => {
    const { container } = render(<TextReveal text="x" colors={["red", "blue"]} />);
    const bg = (container.querySelector("span") as HTMLSpanElement).style.backgroundImage;
    expect(bg).toContain("var(--color-foreground) 34%");
    expect(bg).toContain("red 40%");
    expect(bg).toContain("blue 60%");
    expect(bg).toContain("transparent 66%");
  });

  it("单色带落在色带中点（不除以 0）", () => {
    const { container } = render(<TextReveal text="x" colors={["red"]} />);
    expect((container.querySelector("span") as HTMLSpanElement).style.backgroundImage).toContain(
      "red 50%",
    );
  });

  it("repeat 才无限循环；默认扫一轮停在终态", () => {
    const once = render(<TextReveal text="x" startOnView={false} />);
    expect(once.container.querySelector("span")!.getAttribute("class")).not.toContain("_infinite_");
    const loop = render(<TextReveal text="x" startOnView={false} repeat />);
    expect(loop.container.querySelector("span")!.getAttribute("class")).toContain("_infinite_");
  });

  it("startOnView={false}：立刻开扫，不等视口（侧边栏里的任务态标签）", () => {
    installIO();
    const { container } = render(<TextReveal text="归档中" startOnView={false} repeat />);
    expect(container.querySelector("span")!.getAttribute("class")).not.toContain(
      "animation-play-state:paused",
    );
    expect(observers.length).toBe(0);
  });

  it("startOnView 默认 true：滚入视口前暂停在「未揭示」，滚入后开扫", () => {
    installIO();
    const { container } = render(<TextReveal text="标题" />);
    expect(container.querySelector("span")!.getAttribute("class")).toContain(
      "animation-play-state:paused",
    );
    intersect(true);
    expect(container.querySelector("span")!.getAttribute("class")).not.toContain(
      "animation-play-state:paused",
    );
  });

  it("once={false}：滚出视口暂停，滚回来重挂节点从头扫（不是从暂停处接着扫）", () => {
    installIO();
    const { container } = render(<TextReveal text="标题" once={false} />);
    intersect(true);
    const first = container.querySelector("span")!;
    intersect(false);
    expect(container.querySelector("span")!.getAttribute("class")).toContain(
      "animation-play-state:paused",
    );
    intersect(true);
    expect(container.querySelector("span")).not.toBe(first);
  });

  it("没有 IntersectionObserver 时直接开扫，不把字卡在透明态", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(<TextReveal text="兜底" />);
    expect(container.querySelector("span")!.getAttribute("class")).not.toContain(
      "animation-play-state:paused",
    );
  });

  it("减弱动效靠 class 压住：动画不内联，落回静态 background-position = 整串实色", () => {
    const { container } = render(<TextReveal text="x" startOnView={false} />);
    const el = container.querySelector("span") as HTMLSpanElement;
    expect(el.getAttribute("class")).toContain("motion-reduce:[animation:none]");
    expect(el.style.animation).toBe("");
    expect(el.style.animationName).toBe("");
    // 静态位置不被内联覆盖，减弱动效下就是 0 0（窗口落在渐变最左 1/3 = 全 textColor）
    expect(el.style.backgroundPosition).toBe("");
  });

  it("多串轮换：容器按最宽那串预留宽度，换串不跳", () => {
    const { container } = render(
      <TextReveal text={["OCR 中", "解析中", "归档中"]} startOnView={false} repeat />,
    );
    const root = container.querySelector("span")!;
    expect(root.getAttribute("class")).toContain("inline-grid");
    // 三串全在同一个网格单元里叠着，宽度取最大值
    expect(root.querySelectorAll(".\\[grid-area\\:1\\/1\\]").length).toBe(3);
  });

  it("占位串不进 DOM 文本：状态标签的 textContent 只有当前那一串", () => {
    const { container } = render(
      <TextReveal text={["OCR 中", "解析中", "归档中"]} startOnView={false} repeat />,
    );
    expect(container.querySelector("span")!.textContent).toBe("OCR 中");
    const ghosts = [...container.querySelectorAll("[data-hulian-ghost-text]")];
    expect(ghosts.map((g) => g.getAttribute("data-hulian-ghost-text"))).toEqual(["解析中", "归档中"]);
    expect(ghosts.every((g) => g.childNodes.length === 0)).toBe(true);
    // 占位靠 visibility:hidden 而不是 display:none —— 后者不占位，宽度预留就没了
    expect(ghosts.every((g) => g.getAttribute("class")!.includes("invisible"))).toBe(true);
  });

  it("扫完一轮换下一串，转一圈回到第一串", () => {
    const { container } = render(
      <TextReveal text={["OCR 中", "解析中"]} startOnView={false} repeat />,
    );
    // jsdom 没有 AnimationEvent 构造器，用 testing-library 的事件工厂
    const fire = () => fireEvent.animationIteration(container.querySelector(".bg-clip-text")!);
    expect(container.querySelector("span")!.textContent).toBe("OCR 中");
    fire();
    expect(container.querySelector("span")!.textContent).toBe("解析中");
    fire();
    expect(container.querySelector("span")!.textContent).toBe("OCR 中");
  });

  it("className / style / 其余 span 属性透传", () => {
    const { container } = render(
      <TextReveal text="x" startOnView={false} className="text-xs" title="任务阶段" style={{ letterSpacing: "1px" }} />,
    );
    const el = container.querySelector("span") as HTMLSpanElement;
    expect(el.getAttribute("class")).toContain("text-xs");
    expect(el.getAttribute("title")).toBe("任务阶段");
    expect(el.style.letterSpacing).toBe("1px");
    // 自带的扫光样式还在
    expect(el.style.backgroundImage).toContain("linear-gradient");
  });

  it("duration 落 CSS 变量（动画时长由它读）", () => {
    const { container } = render(<TextReveal text="x" duration={3.5} startOnView={false} />);
    const el = container.querySelector("span") as HTMLSpanElement;
    expect(el.style.getPropertyValue("--hulian-reveal-duration")).toBe("3.5s");
    expect(el.getAttribute("class")).toContain("var(--hulian-reveal-duration,2s)");
  });
});
