import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackTop } from "./back-top";

afterEach(cleanup);

function makeBox() {
  const box = document.createElement("div");
  document.body.appendChild(box);
  return box;
}

// 隐藏态按钮带 aria-hidden=true（移出无障碍树，getByRole 会排除）→ 统一用 querySelector 定位。
function getBtn(c: HTMLElement) {
  return c.querySelector('button[aria-label="回到顶部"]') as HTMLButtonElement;
}

describe("BackTop", () => {
  it("默认渲上箭头图标 + aria-label 回到顶部", () => {
    const { container } = render(<BackTop />);
    const btn = getBtn(container);
    expect(btn).not.toBeNull();
    expect(btn.querySelector("svg")).not.toBeNull();
  });

  it("初始未超阈值时隐藏（aria-hidden + opacity-0 + tabIndex -1）", () => {
    const box = makeBox();
    const { container } = render(<BackTop target={() => box} visibilityHeight={100} />);
    const btn = getBtn(container);
    expect(btn.getAttribute("aria-hidden")).toBe("true");
    expect(btn.getAttribute("tabindex")).toBe("-1");
    expect(btn.className).toContain("opacity-0");
  });

  it("滚动超过 visibilityHeight 后淡入显示", () => {
    const box = makeBox();
    const { container } = render(<BackTop target={() => box} visibilityHeight={100} />);
    const btn = getBtn(container);
    Object.defineProperty(box, "scrollTop", { value: 200, configurable: true });
    fireEvent.scroll(box);
    expect(btn.getAttribute("aria-hidden")).toBe("false");
    expect(btn.className).toContain("opacity-100");
  });

  it("点击调用目标 scrollTo({top:0,behavior:smooth}) 并触发 onClick", () => {
    const box = makeBox();
    const scrollTo = vi.fn();
    box.scrollTo = scrollTo as unknown as typeof box.scrollTo;
    const onClick = vi.fn();
    const { container } = render(<BackTop target={() => box} visibilityHeight={50} onClick={onClick} />);
    Object.defineProperty(box, "scrollTop", { value: 300, configurable: true });
    fireEvent.scroll(box);
    fireEvent.click(getBtn(container));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("prefers-reduced-motion 时 behavior:auto", () => {
    const box = makeBox();
    const scrollTo = vi.fn();
    box.scrollTo = scrollTo as unknown as typeof box.scrollTo;
    const mql = vi.fn().mockReturnValue({ matches: true });
    window.matchMedia = mql as unknown as typeof window.matchMedia;
    const { container } = render(<BackTop target={() => box} />);
    fireEvent.click(getBtn(container));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
    // @ts-expect-error 清理，避免污染后续用例
    delete window.matchMedia;
  });

  it("children 自定义内容", () => {
    const { container } = render(<BackTop>顶部</BackTop>);
    expect(getBtn(container).textContent).toContain("顶部");
  });
});
