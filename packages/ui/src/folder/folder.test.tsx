import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Folder } from "./folder";

describe("Folder", () => {
  it("渲染根容器 + 文件夹按钮（默认收起）", () => {
    const { container, getByRole } = render(<Folder />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("inline-block");
    // size=1 → scale(1)
    expect(root.style.transform).toBe("scale(1)");
    const btn = getByRole("button");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("color/size 落 CSS 变量与缩放（token 默认 var(--color-primary)）", () => {
    const { container, getByRole } = render(<Folder size={1.5} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.transform).toBe("scale(1.5)");
    const btn = getByRole("button");
    expect(btn.style.getPropertyValue("--hl-folder-color")).toBe(
      "var(--color-primary)",
    );
    // 派生变量用 color-mix 而非硬编码 hex
    expect(btn.style.getPropertyValue("--hl-folder-back")).toContain(
      "color-mix",
    );
  });

  it("点击切换展开态 + 触发 onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { getByRole } = render(<Folder onOpenChange={onOpenChange} />);
    const btn = getByRole("button");
    fireEvent.click(btn);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(btn);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("受控 open 模式：内部不自行切换，仅回调", () => {
    const onOpenChange = vi.fn();
    const { getByRole, rerender } = render(
      <Folder open={false} onOpenChange={onOpenChange} />,
    );
    const btn = getByRole("button");
    fireEvent.click(btn);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // 受控未回写 → 仍 false
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    rerender(<Folder open onOpenChange={onOpenChange} />);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("items 渲染 + motion-reduce 过渡停 + className/props 透传", () => {
    const { container, getByText } = render(
      <Folder
        items={[<span key="a">甲</span>, <span key="b">乙</span>]}
        className="my-folder"
        data-testid="fd"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("my-folder");
    expect(root.getAttribute("data-testid")).toBe("fd");
    expect(getByText("甲")).toBeTruthy();
    expect(getByText("乙")).toBeTruthy();
    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("class")).toContain("motion-reduce:transition-none");
  });
});
// 见 hulianui/hulian#107：解构默认只认 undefined，null 须显式回落。
describe("Folder · null 回落", () => {
  it("items 传 null 不抛错，按空槽渲染", () => {
    const { container } = render(<Folder items={null as never} />);
    expect(container.firstElementChild).not.toBeNull();
  });
});
