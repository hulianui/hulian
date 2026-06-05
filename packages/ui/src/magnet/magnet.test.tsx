import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Magnet } from "./magnet";

// jsdom 下 getBoundingClientRect 恒返回全 0：感应区判定 0 < 0 + padding 为真，
// 但中心同为 0、指针 clientX/Y 默认 0 → 位移 0/strength = 0，断言走「不抛错 + 结构正确」即可。
vi.mock("motion/react", () => ({ useReducedMotion: () => false }));

describe("Magnet", () => {
  it("渲染外层 relative inline-block 包裹 + 内层 will-change-transform", () => {
    const { container } = render(
      <Magnet>
        <button>磁吸按钮</button>
      </Magnet>,
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper.getAttribute("class")).toContain("relative");
    expect(wrapper.getAttribute("class")).toContain("inline-block");
    const inner = wrapper.firstElementChild!;
    expect(inner.getAttribute("class")).toContain("will-change-transform");
    expect(inner.textContent).toBe("磁吸按钮");
  });

  it("初始 transform 为原点 translate3d(0px,0px,0)", () => {
    const { container } = render(<Magnet>x</Magnet>);
    const inner = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe("translate3d(0px, 0px, 0)");
  });

  it("失活态使用 inactiveTransition，自定义可透传", () => {
    const { container } = render(
      <Magnet inactiveTransition="transform 1s linear">x</Magnet>,
    );
    const inner = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(inner.style.transition).toBe("transform 1s linear");
  });

  it("className/style/props 透传到外层根节点", () => {
    const { container } = render(
      <Magnet
        wrapperClassName="my-wrap"
        innerClassName="my-inner"
        style={{ width: 80 }}
        data-testid="mag"
      >
        x
      </Magnet>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.getAttribute("class")).toContain("my-wrap");
    expect(wrapper.getAttribute("data-testid")).toBe("mag");
    expect(wrapper.style.width).toBe("80px");
    expect(
      (wrapper.firstElementChild as HTMLElement).getAttribute("class"),
    ).toContain("my-inner");
  });

  it("disabled 不抛错且保持原点（鼠标移动不产生位移）", () => {
    const { container } = render(<Magnet disabled>x</Magnet>);
    fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
    const inner = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe("translate3d(0px, 0px, 0)");
  });
});
