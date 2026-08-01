import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Tilt } from "./tilt";
import { glareState, normalizePointer, tiltAngles } from "./tilt-geometry";

const RECT = { left: 0, top: 0, width: 200, height: 100 };

function stubRect(el: Element) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    ...RECT,
    right: 200,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

beforeEach(() => {
  // jsdom 默认没有 matchMedia；组件用它判 reduced-motion。
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

describe("tiltAngles", () => {
  it("中心处不倾斜", () => {
    expect(tiltAngles(0.5, 0.5, { maxAngleX: 20, maxAngleY: 20 })).toEqual({ rotateX: 0, rotateY: 0 });
  });

  it("上半区 rotateX 为正、右半区 rotateY 为正", () => {
    const a = tiltAngles(1, 0, { maxAngleX: 20, maxAngleY: 20 });
    expect(a.rotateX).toBe(20);
    expect(a.rotateY).toBe(20);
  });

  it("reverse 整体取反", () => {
    const a = tiltAngles(1, 0, { maxAngleX: 20, maxAngleY: 20, reverse: true });
    expect(a).toEqual({ rotateX: -20, rotateY: -20 });
  });

  it("axis 限制单轴", () => {
    expect(tiltAngles(1, 0, { maxAngleX: 20, maxAngleY: 20, axis: "x" }).rotateY).toBe(0);
    expect(tiltAngles(1, 0, { maxAngleX: 20, maxAngleY: 20, axis: "y" }).rotateX).toBe(0);
  });

  it("越界输入被钳到 0..1，不产出超角", () => {
    const a = tiltAngles(5, -5, { maxAngleX: 20, maxAngleY: 20 });
    expect(Math.abs(a.rotateX)).toBeLessThanOrEqual(20);
    expect(Math.abs(a.rotateY)).toBeLessThanOrEqual(20);
  });
});

describe("glareState", () => {
  it("中心处强度为 0", () => {
    expect(glareState(0.5, 0.5, { maxOpacity: 1 }).opacity).toBe(0);
  });

  it("离中心越远越强，角落吃满", () => {
    const near = glareState(0.6, 0.5, { maxOpacity: 1 }).opacity;
    const far = glareState(1, 1, { maxOpacity: 1 }).opacity;
    expect(far).toBeGreaterThan(near);
    expect(far).toBeCloseTo(1, 5);
  });

  it("maxOpacity 封顶", () => {
    expect(glareState(1, 1, { maxOpacity: 0.3 }).opacity).toBeCloseTo(0.3, 5);
  });

  it("角度落在 0..360，reverse 差 180°", () => {
    const a = glareState(1, 0.5, { maxOpacity: 1 });
    const b = glareState(1, 0.5, { maxOpacity: 1, reverse: true });
    expect(a.angle).toBeGreaterThanOrEqual(0);
    expect(a.angle).toBeLessThan(360);
    expect(Math.abs(((a.angle - b.angle) % 360 + 360) % 360)).toBeCloseTo(180, 5);
  });
});

describe("normalizePointer", () => {
  it("换算到 0..1", () => {
    expect(normalizePointer(100, 50, RECT)).toEqual([0.5, 0.5]);
  });

  it("尺寸为 0 时回落中心，不出 NaN", () => {
    expect(normalizePointer(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toEqual([0.5, 0.5]);
  });
});

describe("Tilt", () => {
  it("裹住 children 并给外层加透视", () => {
    const { container, getByText } = render(
      <Tilt perspective={800}>
        <p>内容</p>
      </Tilt>,
    );
    expect(getByText("内容")).toBeTruthy();
    expect((container.firstElementChild as HTMLElement).style.perspective).toBe("800px");
  });

  it("指针移动写入 rotateX/rotateY", () => {
    const { container } = render(<Tilt maxAngleX={20} maxAngleY={20}>x</Tilt>);
    const root = container.firstElementChild as HTMLElement;
    stubRect(root);
    fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
    const inner = container.querySelector("[data-tilt-inner]") as HTMLElement;
    expect(inner.style.transform).toContain("rotateX(20deg)");
    expect(inner.style.transform).toContain("rotateY(20deg)");
  });

  it("离开归位；reset=false 保持最后角度", () => {
    const { container, rerender } = render(<Tilt maxAngleX={20} maxAngleY={20}>x</Tilt>);
    const root = container.firstElementChild as HTMLElement;
    stubRect(root);
    fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
    fireEvent.pointerLeave(root);
    let inner = container.querySelector("[data-tilt-inner]") as HTMLElement;
    expect(inner.style.transform).toContain("rotateX(0deg)");

    rerender(<Tilt maxAngleX={20} maxAngleY={20} reset={false}>x</Tilt>);
    const root2 = container.firstElementChild as HTMLElement;
    stubRect(root2);
    fireEvent.pointerMove(root2, { clientX: 200, clientY: 0 });
    fireEvent.pointerLeave(root2);
    inner = container.querySelector("[data-tilt-inner]") as HTMLElement;
    expect(inner.style.transform).toContain("rotateX(20deg)");
  });

  it("hover 时按 scale 放大，离开还原", () => {
    const { container } = render(<Tilt scale={1.2}>x</Tilt>);
    const root = container.firstElementChild as HTMLElement;
    stubRect(root);
    fireEvent.pointerEnter(root);
    expect((container.querySelector("[data-tilt-inner]") as HTMLElement).style.transform).toContain("scale(1.2)");
    fireEvent.pointerLeave(root);
    expect((container.querySelector("[data-tilt-inner]") as HTMLElement).style.transform).toContain("scale(1)");
  });

  it("manualAngle 接管对应轴，指针不再影响它", () => {
    const { container } = render(<Tilt manualAngleX={30} maxAngleX={20} maxAngleY={20}>x</Tilt>);
    const root = container.firstElementChild as HTMLElement;
    stubRect(root);
    fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
    const inner = container.querySelector("[data-tilt-inner]") as HTMLElement;
    expect(inner.style.transform).toContain("rotateX(30deg)");
    expect(inner.style.transform).toContain("rotateY(20deg)"); // y 轴仍跟指针
  });

  it("initialAngle 作静息角", () => {
    const { container } = render(<Tilt initialAngleX={8}>x</Tilt>);
    expect((container.querySelector("[data-tilt-inner]") as HTMLElement).style.transform).toContain(
      "rotateX(8deg)",
    );
  });

  it("tiltEnable=false 完全不倾斜", () => {
    const { container } = render(<Tilt tiltEnable={false} maxAngleX={20}>x</Tilt>);
    const root = container.firstElementChild as HTMLElement;
    stubRect(root);
    fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
    expect((container.querySelector("[data-tilt-inner]") as HTMLElement).style.transform).toContain(
      "rotateX(0deg)",
    );
  });

  it("glare 开启后出高光层，强度随指针变化", () => {
    const { container } = render(<Tilt glare glareMaxOpacity={0.8}>x</Tilt>);
    const root = container.firstElementChild as HTMLElement;
    stubRect(root);
    const light = () => container.querySelector("[data-tilt-glare]") as HTMLElement;
    expect(light()).toBeTruthy();
    expect(light().getAttribute("aria-hidden")).not.toBeNull();
    fireEvent.pointerMove(root, { clientX: 200, clientY: 100 });
    expect(Number(light().style.opacity)).toBeGreaterThan(0);
  });

  it("回调给出角度与反光数据", () => {
    const onTiltMove = vi.fn();
    const onTiltEnter = vi.fn();
    const onTiltLeave = vi.fn();
    const { container } = render(
      <Tilt onTiltMove={onTiltMove} onTiltEnter={onTiltEnter} onTiltLeave={onTiltLeave}>
        x
      </Tilt>,
    );
    const root = container.firstElementChild as HTMLElement;
    stubRect(root);
    fireEvent.pointerEnter(root);
    fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
    fireEvent.pointerLeave(root);
    expect(onTiltEnter).toHaveBeenCalled();
    expect(onTiltLeave).toHaveBeenCalled();
    expect(onTiltMove).toHaveBeenCalledWith(
      expect.objectContaining({ angles: expect.objectContaining({ rotateX: expect.any(Number) }) }),
    );
  });

  it("reduced-motion 下不倾斜（children 照常渲染）", () => {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: true,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    const { container, getByText } = render(<Tilt maxAngleX={20}>内容</Tilt>);
    const root = container.firstElementChild as HTMLElement;
    stubRect(root);
    fireEvent.pointerMove(root, { clientX: 200, clientY: 0 });
    expect(getByText("内容")).toBeTruthy();
    expect((container.querySelector("[data-tilt-inner]") as HTMLElement).style.transform).toContain(
      "rotateX(0deg)",
    );
  });
});
