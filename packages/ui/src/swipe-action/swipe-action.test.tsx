import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SwipeAction } from "./swipe-action";

afterEach(cleanup);

function content(c: HTMLElement) {
  // 内容层是带 transform 的那个 div（动作面板用 absolute）。
  return c.querySelector('[style*="translateX"]') as HTMLElement;
}

describe("SwipeAction", () => {
  it("渲染内容与左右动作按钮", () => {
    const { getByText } = render(
      <SwipeAction left={[{ key: "l", label: "已读" }]} right={[{ key: "r", label: "删除", tone: "danger" }]}>
        <div>会话</div>
      </SwipeAction>,
    );
    expect(getByText("会话")).toBeTruthy();
    expect(getByText("已读")).toBeTruthy();
    expect(getByText("删除")).toBeTruthy();
  });

  it("danger 动作带对应色调 class", () => {
    const { getByText } = render(
      <SwipeAction right={[{ key: "r", label: "删除", tone: "danger" }]}>
        <div>x</div>
      </SwipeAction>,
    );
    expect(getByText("删除").className).toContain("bg-danger");
  });

  it("点击动作触发 onClick", () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <SwipeAction right={[{ key: "r", label: "删除", onClick }]}>
        <div>x</div>
      </SwipeAction>,
    );
    fireEvent.click(getByText("删除"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("横向拖过阈值吸附全开（mock offsetWidth）", () => {
    // jsdom 无布局 → offsetWidth 恒 0，手动注入右动作面板宽度 80。
    const spy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockReturnValue(80);
    const { container } = render(
      <SwipeAction right={[{ key: "r", label: "删除", tone: "danger" }]}>
        <div>x</div>
      </SwipeAction>,
    );
    const el = content(container);
    fireEvent.pointerDown(el, { clientX: 200, clientY: 10, pointerType: "touch" });
    fireEvent.pointerMove(el, { clientX: 130, clientY: 10 }); // dx=-70，横向，超 80*0.5=40
    fireEvent.pointerUp(el);
    expect(el.style.transform).toBe("translateX(-80px)"); // 吸附到右全开
    spy.mockRestore();
  });

  it("纵向手势不接管（保持关闭）", () => {
    const spy = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(80);
    const { container } = render(
      <SwipeAction right={[{ key: "r", label: "删除" }]}>
        <div>x</div>
      </SwipeAction>,
    );
    const el = content(container);
    fireEvent.pointerDown(el, { clientX: 200, clientY: 10, pointerType: "touch" });
    fireEvent.pointerMove(el, { clientX: 196, clientY: 90 }); // 纵向为主
    fireEvent.pointerUp(el);
    expect(el.style.transform).toBe("translateX(0px)");
    spy.mockRestore();
  });
});
