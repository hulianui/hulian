import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { CardSpotlight } from "./card-spotlight";

describe("CardSpotlight", () => {
  // ── 基础渲染 ─────────────────────────────────────────────────────────────────

  it("渲染 children 内容", () => {
    const { getByText } = render(<CardSpotlight>瑚琏卡片</CardSpotlight>);
    expect(getByText("瑚琏卡片")).not.toBeNull();
  });

  it("根节点带必要结构类（overflow-hidden / rounded / bg-surface）", () => {
    const { container } = render(<CardSpotlight>x</CardSpotlight>);
    const root = container.firstElementChild as HTMLDivElement;
    expect(root.className).toContain("overflow-hidden");
    expect(root.className).toContain("rounded-");
    expect(root.className).toContain("bg-surface");
  });

  it("高光层存在且带 pointer-events-none / absolute inset-0", () => {
    const { container } = render(<CardSpotlight>x</CardSpotlight>);
    const spotlightLayer = container.querySelector("[aria-hidden]") as HTMLDivElement;
    expect(spotlightLayer).not.toBeNull();
    expect(spotlightLayer.className).toContain("pointer-events-none");
    expect(spotlightLayer.className).toContain("absolute");
    expect(spotlightLayer.className).toContain("inset-0");
  });

  it("className 透传到根节点", () => {
    const { container } = render(<CardSpotlight className="w-64 my-custom">x</CardSpotlight>);
    const root = container.firstElementChild as HTMLDivElement;
    expect(root.className).toContain("w-64");
    expect(root.className).toContain("my-custom");
  });

  // ── CSS 变量初始状态 ────────────────────────────────────────────────────────

  it("默认 CSS 变量初始值正确设置", () => {
    const { container } = render(<CardSpotlight>x</CardSpotlight>);
    const root = container.firstElementChild as HTMLDivElement;
    // 初始高光不可见
    expect(root.style.getPropertyValue("--hulian-spotlight-opacity")).toBe("0");
    // 默认半径 350px
    expect(root.style.getPropertyValue("--hulian-spotlight-r")).toBe("350px");
    // 默认颜色 chart-1 token
    expect(root.style.getPropertyValue("--hulian-spotlight-color")).toBe("var(--color-chart-1)");
  });

  it("radius prop 修改 --hulian-spotlight-r 初始值", () => {
    const { container } = render(<CardSpotlight radius={200}>x</CardSpotlight>);
    const root = container.firstElementChild as HTMLDivElement;
    expect(root.style.getPropertyValue("--hulian-spotlight-r")).toBe("200px");
  });

  it("color prop 写入 --hulian-spotlight-color", () => {
    const { container } = render(<CardSpotlight color="var(--color-primary)">x</CardSpotlight>);
    const root = container.firstElementChild as HTMLDivElement;
    expect(root.style.getPropertyValue("--hulian-spotlight-color")).toBe("var(--color-primary)");
  });

  // ── 鼠标交互 ────────────────────────────────────────────────────────────────

  it("mouseMove 后 CSS 变量 --hulian-spotlight-x 被设置（非空）", () => {
    const { container } = render(<CardSpotlight>x</CardSpotlight>);
    const root = container.firstElementChild as HTMLDivElement;

    // 模拟 getBoundingClientRect（jsdom 默认返回全 0）
    root.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      width: 300,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.mouseMove(root, { clientX: 120, clientY: 80 });

    expect(root.style.getPropertyValue("--hulian-spotlight-x")).toBe("120px");
    expect(root.style.getPropertyValue("--hulian-spotlight-y")).toBe("80px");
  });

  it("mouseMove 后 --hulian-spotlight-r 跟随 radius prop 更新", () => {
    const { container } = render(<CardSpotlight radius={180}>x</CardSpotlight>);
    const root = container.firstElementChild as HTMLDivElement;

    root.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      width: 300,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.mouseMove(root, { clientX: 50, clientY: 50 });
    expect(root.style.getPropertyValue("--hulian-spotlight-r")).toBe("180px");
  });

  it("mouseEnter 设置 --hulian-spotlight-opacity 为 1", () => {
    const { container } = render(<CardSpotlight>x</CardSpotlight>);
    const root = container.firstElementChild as HTMLDivElement;
    fireEvent.mouseEnter(root);
    expect(root.style.getPropertyValue("--hulian-spotlight-opacity")).toBe("1");
  });

  it("mouseLeave 设置 --hulian-spotlight-opacity 为 0", () => {
    const { container } = render(<CardSpotlight>x</CardSpotlight>);
    const root = container.firstElementChild as HTMLDivElement;
    // 先进入，再离开
    fireEvent.mouseEnter(root);
    fireEvent.mouseLeave(root);
    expect(root.style.getPropertyValue("--hulian-spotlight-opacity")).toBe("0");
  });

  // ── 事件透传 ────────────────────────────────────────────────────────────────

  it("onMouseMove 回调被透传调用", () => {
    let called = false;
    const { container } = render(
      <CardSpotlight onMouseMove={() => { called = true; }}>x</CardSpotlight>,
    );
    const root = container.firstElementChild as HTMLDivElement;
    root.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => ({}) });
    fireEvent.mouseMove(root, { clientX: 10, clientY: 10 });
    expect(called).toBe(true);
  });

  it("onMouseEnter / onMouseLeave 回调透传", () => {
    let enterCalled = false;
    let leaveCalled = false;
    const { container } = render(
      <CardSpotlight
        onMouseEnter={() => { enterCalled = true; }}
        onMouseLeave={() => { leaveCalled = true; }}
      >
        x
      </CardSpotlight>,
    );
    const root = container.firstElementChild as HTMLDivElement;
    fireEvent.mouseEnter(root);
    fireEvent.mouseLeave(root);
    expect(enterCalled).toBe(true);
    expect(leaveCalled).toBe(true);
  });

  // ── style 合并 ─────────────────────────────────────────────────────────────

  it("外部 style prop 与内部 CSS 变量合并（不互相覆盖）", () => {
    const { container } = render(
      <CardSpotlight style={{ padding: "2rem" }}>x</CardSpotlight>,
    );
    const root = container.firstElementChild as HTMLDivElement;
    // 外部 style 保留
    expect(root.style.padding).toBe("2rem");
    // 内部 CSS 变量仍在
    expect(root.style.getPropertyValue("--hulian-spotlight-opacity")).toBe("0");
  });

  // ── 无障碍 ──────────────────────────────────────────────────────────────────

  it("高光层 aria-hidden 对屏幕阅读器隐藏", () => {
    const { container } = render(<CardSpotlight>x</CardSpotlight>);
    const spotlightLayer = container.querySelector("[aria-hidden]");
    expect(spotlightLayer?.getAttribute("aria-hidden")).toBeTruthy();
  });
});
