import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Affix } from "./affix";

// rAF 同步化：让 scroll → measure → setState 在 act 内即时 flush（避免帧时序 flaky）。
beforeEach(() => {
  vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  }) as typeof requestAnimationFrame);
  vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// jsdom 无布局：getBoundingClientRect 恒 0、offsetHeight 恒 0。
// 行为测试 stub 占位元素几何 + 派发 scroll，再断言固定态样式/类/回调。
function rect(top: number, bottom: number, left = 0, width = 200): DOMRect {
  return { top, bottom, left, width, right: left + width, height: bottom - top, x: left, y: top, toJSON() {} } as DOMRect;
}

function stubGeometry(top: number, bottom: number, left = 0, width = 200, height = 40) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    return (this as HTMLElement).dataset?.role === "placeholder"
      ? rect(top, bottom, left, width)
      : rect(0, 0, 0, 0);
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(height);
}

// 标记占位元素（measure 仅读占位 rect），并触发一次 scroll 走判定。
function scrollWith(container: HTMLElement) {
  (container.firstElementChild as HTMLElement).dataset.role = "placeholder";
  act(() => {
    fireEvent.scroll(window);
  });
}

describe("Affix 固钉", () => {
  it("渲染 children（占位 + 内容双层）", () => {
    const { getByText, container } = render(<Affix>内容</Affix>);
    expect(getByText("内容").textContent).toBe("内容");
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.tagName).toBe("DIV");
    expect(outer.firstElementChild?.tagName).toBe("DIV");
  });

  it("className 落在内容元素（非占位），rest 透传到内容", () => {
    const { container } = render(
      <Affix className="bar" data-testid="c" role="navigation">
        x
      </Affix>,
    );
    const content = container.querySelector('[data-testid="c"]') as HTMLElement;
    expect(content.className).toContain("bar");
    expect(content.getAttribute("role")).toBe("navigation");
    expect(content.parentElement).toBe(container.firstElementChild);
  });

  it("初始未吸附：无 position:fixed、无 affixedClassName、不触发 onChange", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Affix affixedClassName="shadow-lg" data-testid="c" onChange={onChange}>
        x
      </Affix>,
    );
    const content = container.querySelector('[data-testid="c"]') as HTMLElement;
    expect(content.style.position).not.toBe("fixed");
    expect(content.className).not.toContain("shadow-lg");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("offsetTop：占位顶滚过阈值 → fixed + affixedClassName + onChange(true) + 占位冻结高度", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Affix offsetTop={10} affixedClassName="shadow-lg" data-testid="c" onChange={onChange}>
        x
      </Affix>,
    );
    stubGeometry(-5, 35, 12, 200, 40); // 占位顶 -5 < 0+10 → 吸附
    scrollWith(container);

    const content = container.querySelector('[data-testid="c"]') as HTMLElement;
    expect(content.style.position).toBe("fixed");
    expect(content.style.top).toBe("10px");
    expect(content.style.left).toBe("12px");
    expect(content.style.width).toBe("200px");
    expect(content.className).toContain("shadow-lg");
    expect(onChange).toHaveBeenCalledWith(true);
    expect((container.firstElementChild as HTMLElement).style.height).toBe("40px");
  });

  it("offsetBottom：占位底超过容器底阈值 → fixed 钉到底部", () => {
    const { container } = render(
      <Affix offsetBottom={20} data-testid="c">
        x
      </Affix>,
    );
    // window.innerHeight 默认 768；占位底 800 > 768-20 → 吸底
    stubGeometry(760, 800, 0, 150, 40);
    scrollWith(container);

    const content = container.querySelector('[data-testid="c"]') as HTMLElement;
    expect(content.style.position).toBe("fixed");
    // top = 768 - 20 - 40 = 708
    expect(content.style.top).toBe("708px");
  });

  it("脱附：滚回阈值内 → 恢复非 fixed + onChange(false) + 清占位高度", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Affix offsetTop={10} data-testid="c" onChange={onChange}>
        x
      </Affix>,
    );
    const placeholder = container.firstElementChild as HTMLElement;

    stubGeometry(-5, 35, 0, 200, 40); // 吸附
    scrollWith(container);
    expect((container.querySelector('[data-testid="c"]') as HTMLElement).style.position).toBe("fixed");

    vi.restoreAllMocks();
    // 还原后需重置 rAF 同步桩（restoreAllMocks 也清了它）
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    }) as typeof requestAnimationFrame);
    stubGeometry(50, 90, 0, 200, 40); // 占位顶 50 > 10 → 脱附
    act(() => {
      fireEvent.scroll(window);
    });

    const c2 = container.querySelector('[data-testid="c"]') as HTMLElement;
    expect(c2.style.position).not.toBe("fixed");
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(placeholder.style.height).toBe("");
  });

  it("target getter 被采用：自定义容器边界参与判定", () => {
    const fakeContainer = document.createElement("div");
    vi.spyOn(fakeContainer, "getBoundingClientRect").mockReturnValue(rect(100, 500, 0, 300));
    const { container } = render(
      <Affix target={() => fakeContainer} data-testid="c">
        x
      </Affix>,
    );
    // 容器顶 100；占位顶 95 < 100+0 → 吸附，fixed top = 100
    stubGeometry(95, 135, 0, 200, 40);
    scrollWith(container);

    const content = container.querySelector('[data-testid="c"]') as HTMLElement;
    expect(content.style.position).toBe("fixed");
    expect(content.style.top).toBe("100px");
  });
});
