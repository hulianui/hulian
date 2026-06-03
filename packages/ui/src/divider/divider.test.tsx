import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Divider } from "./divider";

afterEach(cleanup);

describe("Divider", () => {
  it("纯线（无文字）渲 role=separator", () => {
    const { container } = render(<Divider />);
    const sep = container.querySelector('[role="separator"]') as HTMLElement;
    expect(sep).not.toBeNull();
    expect(sep.className).toContain("border-t");
  });

  it("带文字时渲出文字且文字非 separator 角色（separator 子内容会被忽略）", () => {
    render(<Divider>分隔标题</Divider>);
    expect(screen.getByText("分隔标题")).toBeTruthy();
    // 带文字变体不套 role=separator（避免文字被无障碍树忽略）
    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("dashed 追加 border-dashed", () => {
    const { container } = render(<Divider dashed />);
    const sep = container.querySelector('[role="separator"]') as HTMLElement;
    expect(sep.className).toContain("border-dashed");
  });

  it("type=vertical 渲行内 separator 且 aria-orientation=vertical", () => {
    render(<Divider type="vertical" />);
    const sep = screen.getByRole("separator");
    expect(sep.getAttribute("aria-orientation")).toBe("vertical");
    expect(sep.className).toContain("inline-block");
  });

  it("plain 文字常规字重，默认加粗", () => {
    const { rerender, container } = render(<Divider>标题</Divider>);
    expect(container.querySelector(".font-medium")).not.toBeNull();
    rerender(<Divider plain>标题</Divider>);
    expect(container.querySelector(".font-normal")).not.toBeNull();
  });

  it("orientation=left 时左段为定宽短线、右段 flex-1", () => {
    const { container } = render(<Divider orientation="left">左</Divider>);
    const segs = container.querySelectorAll('[aria-hidden="true"]');
    expect(segs.length).toBe(2);
    expect((segs[0] as HTMLElement).className).toContain("w-5");
    expect((segs[1] as HTMLElement).className).toContain("flex-1");
  });
});
