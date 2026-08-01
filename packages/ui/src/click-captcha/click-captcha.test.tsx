import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ClickCaptcha } from "./click-captcha";
import type { CaptchaPoint } from "./click-captcha.types";

// jsdom 不做布局：点位换算依赖 getBoundingClientRect，这里给一块 200×100 的假区域
const RECT = { left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON: () => ({}) };

function area(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-slot="captcha-area"]') as HTMLElement;
}

function pointsOf(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-slot="captcha-point"]')).map((el) =>
    (el as HTMLElement).style.cssText,
  );
}

describe("ClickCaptcha", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(RECT as DOMRect);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("渲染背景图与默认提示，进度播报 0/3", () => {
    const { container, getByText } = render(<ClickCaptcha backgroundSrc="/bg.png" />);
    expect(container.querySelector('img[src="/bg.png"]')).toBeTruthy();
    expect(getByText("请依次点击图中的提示内容")).toBeTruthy();
    expect(getByText("已选点位 0/3")).toBeTruthy();
  });

  it("点击落点换算成 0~1 相对坐标", () => {
    const onPointsChange = vi.fn();
    const { container } = render(<ClickCaptcha backgroundSrc="/bg.png" onPointsChange={onPointsChange} />);
    fireEvent.click(area(container), { clientX: 50, clientY: 25 });
    expect(onPointsChange).toHaveBeenCalledWith([{ x: 0.25, y: 0.25 }]);
  });

  it("采满 maxPoints 触发 onComplete，且不再收点", () => {
    const onComplete = vi.fn();
    const { container } = render(<ClickCaptcha backgroundSrc="/bg.png" maxPoints={2} onComplete={onComplete} />);
    fireEvent.click(area(container), { clientX: 20, clientY: 10 });
    fireEvent.click(area(container), { clientX: 100, clientY: 50 });
    expect(onComplete).toHaveBeenCalledWith([
      { x: 0.1, y: 0.1 },
      { x: 0.5, y: 0.5 },
    ]);
    fireEvent.click(area(container), { clientX: 180, clientY: 90 });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(pointsOf(container)).toHaveLength(2);
  });

  it("越界坐标被夹到 [0,1]", () => {
    const onPointsChange = vi.fn();
    const { container } = render(<ClickCaptcha backgroundSrc="/bg.png" onPointsChange={onPointsChange} />);
    fireEvent.click(area(container), { clientX: 320, clientY: -40 });
    expect(onPointsChange).toHaveBeenCalledWith([{ x: 1, y: 0 }]);
  });

  it("受控 points：按外部值渲染标记，内部不自管", () => {
    const controlled: CaptchaPoint[] = [{ x: 0.2, y: 0.4 }];
    const onPointsChange = vi.fn();
    const { container } = render(
      <ClickCaptcha backgroundSrc="/bg.png" points={controlled} onPointsChange={onPointsChange} />,
    );
    expect(pointsOf(container)).toHaveLength(1);
    fireEvent.click(area(container), { clientX: 100, clientY: 50 });
    expect(onPointsChange).toHaveBeenCalledWith([
      { x: 0.2, y: 0.4 },
      { x: 0.5, y: 0.5 },
    ]);
    expect(pointsOf(container)).toHaveLength(1); // 外部没回写 → 不自行增加
  });

  it("撤销按钮删掉最后一个点，无点时禁用", () => {
    const { container, getByLabelText } = render(<ClickCaptcha backgroundSrc="/bg.png" />);
    const undo = getByLabelText("撤销上一个点") as HTMLButtonElement;
    expect(undo.disabled).toBe(true);
    fireEvent.click(area(container), { clientX: 20, clientY: 10 });
    fireEvent.click(area(container), { clientX: 60, clientY: 30 });
    expect(pointsOf(container)).toHaveLength(2);
    fireEvent.click(undo);
    expect(pointsOf(container)).toHaveLength(1);
  });

  it("换一张：清空点位并回调 onRefresh", () => {
    const onRefresh = vi.fn();
    const { container, getByLabelText } = render(<ClickCaptcha backgroundSrc="/bg.png" onRefresh={onRefresh} />);
    fireEvent.click(area(container), { clientX: 20, clientY: 10 });
    fireEvent.click(getByLabelText("换一张"));
    expect(pointsOf(container)).toHaveLength(0);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("status=failed：抖动类 + 清空点位 + 播报失败文案", () => {
    const onPointsChange = vi.fn();
    const { container, rerender, getByText } = render(
      <ClickCaptcha backgroundSrc="/bg.png" onPointsChange={onPointsChange} />,
    );
    fireEvent.click(area(container), { clientX: 20, clientY: 10 });
    expect(pointsOf(container)).toHaveLength(1);
    rerender(<ClickCaptcha backgroundSrc="/bg.png" status="failed" onPointsChange={onPointsChange} />);
    expect(area(container).className).toContain("motion-safe:[animation:hulian-captcha-shake");
    expect(pointsOf(container)).toHaveLength(0);
    expect(getByText("验证失败，请重新点选")).toBeTruthy();
  });

  it("status=verifying / loading / disabled 时不再收点", () => {
    const onPointsChange = vi.fn();
    const { container, rerender } = render(
      <ClickCaptcha backgroundSrc="/bg.png" status="verifying" onPointsChange={onPointsChange} />,
    );
    fireEvent.click(area(container), { clientX: 20, clientY: 10 });
    rerender(<ClickCaptcha backgroundSrc="/bg.png" loading onPointsChange={onPointsChange} />);
    fireEvent.click(area(container), { clientX: 20, clientY: 10 });
    rerender(<ClickCaptcha backgroundSrc="/bg.png" disabled onPointsChange={onPointsChange} />);
    fireEvent.click(area(container), { clientX: 20, clientY: 10 });
    expect(onPointsChange).not.toHaveBeenCalled();
  });

  it("键盘：方向键移准星 + 回车落点 + 退格撤销", () => {
    const onPointsChange = vi.fn();
    const { container } = render(
      <ClickCaptcha backgroundSrc="/bg.png" keyboardStep={0.1} onPointsChange={onPointsChange} />,
    );
    const el = area(container);
    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(container.querySelector('[data-slot="captcha-cursor"]')).toBeTruthy();
    fireEvent.keyDown(el, { key: "ArrowDown" });
    fireEvent.keyDown(el, { key: "Enter" });
    expect(onPointsChange).toHaveBeenCalledWith([{ x: 0.6, y: 0.6 }]);
    fireEvent.keyDown(el, { key: "Backspace" });
    expect(onPointsChange).toHaveBeenLastCalledWith([]);
  });

  it("点选区可聚焦并带 a11y 说明，disabled 时移出 tab 序", () => {
    const { container, rerender } = render(<ClickCaptcha backgroundSrc="/bg.png" />);
    const el = area(container);
    expect(el.getAttribute("tabindex")).toBe("0");
    expect(el.getAttribute("aria-label")).toContain("方向键");
    expect(el.getAttribute("aria-describedby")).toBeTruthy();
    rerender(<ClickCaptcha backgroundSrc="/bg.png" disabled />);
    expect(area(container).getAttribute("tabindex")).toBe("-1");
  });

  it("图片加载失败：出兜底文案而非空白", () => {
    const { container, getByText } = render(<ClickCaptcha backgroundSrc="/broken.png" />);
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    expect(getByText(/图片加载失败/)).toBeTruthy();
  });
});
