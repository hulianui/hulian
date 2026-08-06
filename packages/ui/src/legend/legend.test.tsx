import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Legend } from "./legend";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const items = [{ label: "Opened" }, { label: "Closed" }];

describe("Legend", () => {
  it("稳定父更新时跳过图例子树", async () => {
    await expectMemoSkipsSubtree(() => <Legend items={items} />);
  });

  it("逐条渲染标签", () => {
    const { getByText } = render(<Legend items={items} />);
    expect(getByText("Opened")).toBeTruthy();
    expect(getByText("Closed")).toBeTruthy();
  });

  it("缺省色按序取 chart-1..6", () => {
    const { container } = render(<Legend items={items} />);
    const marks = container.querySelectorAll("[aria-hidden]");
    expect((marks[0] as HTMLElement).style.backgroundColor).toContain("--color-chart-1");
    expect((marks[1] as HTMLElement).style.backgroundColor).toContain("--color-chart-2");
  });

  it("显式 color 覆盖缺省色（语义名走 token）", () => {
    const { container } = render(<Legend items={[{ label: "Pushes", color: "warning" }]} />);
    const mark = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(mark.style.backgroundColor).toContain("--color-warning");
  });

  it("value 槽渲染在标签右侧", () => {
    const { getByText } = render(<Legend items={[{ label: "Opened", value: "42" }]} />);
    expect(getByText("42")).toBeTruthy();
  });

  it("hidden 置灰但不删条目", () => {
    const { getByText } = render(<Legend items={[{ label: "Closed", hidden: true }]} />);
    expect(getByText("Closed").parentElement?.className).toContain("opacity-45");
  });

  it("不传 onItemClick 时不渲染按钮", () => {
    const { container } = render(<Legend items={items} />);
    expect(container.querySelector("button")).toBeNull();
  });

  it("onItemClick 时条目成按钮并回传 item 与下标", () => {
    const onItemClick = vi.fn();
    const { container } = render(<Legend items={items} onItemClick={onItemClick} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
    (buttons[1] as HTMLButtonElement).click();
    expect(onItemClick).toHaveBeenCalledWith(items[1], 1);
  });

  it("按钮用 aria-pressed 表达系列开关态", () => {
    const { container } = render(
      <Legend items={[{ label: "Closed", hidden: true }]} onItemClick={() => {}} />,
    );
    expect(container.querySelector("button")?.getAttribute("aria-pressed")).toBe("false");
  });

  it("marker 换形状：line 是短横线，square 是小方块", () => {
    const { container: line } = render(<Legend items={items} marker="line" />);
    expect((line.querySelector("[aria-hidden]") as HTMLElement).className).toContain("h-0.5");
    const { container: square } = render(<Legend items={items} marker="square" />);
    expect((square.querySelector("[aria-hidden]") as HTMLElement).className).toContain("rounded-[2px]");
  });

  it("column 布局竖排", () => {
    const { container } = render(<Legend items={items} layout="column" />);
    expect((container.firstElementChild as HTMLElement).className).toContain("flex-col");
  });
});
