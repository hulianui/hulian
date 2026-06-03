import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import {
  applyResize,
  splitEqually,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./resizable";

const C = (min: number, max: number) => ({ min, max });

describe("applyResize 纯函数（相邻两面板转移点数 + 双向钳制）", () => {
  it("基础：正 delta 把点数从右面板转给左面板", () => {
    const next = applyResize([50, 50], 0, 10, [C(10, 100), C(10, 100)]);
    expect(next).toEqual([60, 40]);
  });

  it("负 delta：从左面板转给右面板", () => {
    const next = applyResize([50, 50], 0, -20, [C(10, 100), C(10, 100)]);
    expect(next).toEqual([30, 70]);
  });

  it("左面板撞自身 max 时只取能取的量（总和不变）", () => {
    const next = applyResize([50, 50], 0, 30, [C(10, 70), C(10, 100)]);
    expect(next).toEqual([70, 30]);
  });

  it("右邻面板撞自身 min 时被它卡住（总和不变）", () => {
    const next = applyResize([50, 50], 0, 60, [C(10, 100), C(20, 100)]);
    // 右面板最低到 20 → 左面板最多 80
    expect(next).toEqual([80, 20]);
  });

  it("只改相邻两项，其余面板不动", () => {
    const next = applyResize([30, 40, 30], 1, 10, [C(10, 100), C(10, 100), C(10, 100)]);
    expect(next).toEqual([30, 50, 20]);
  });

  it("不修改入参（返回新数组）", () => {
    const base = [50, 50];
    applyResize(base, 0, 10, [C(10, 100), C(10, 100)]);
    expect(base).toEqual([50, 50]);
  });
});

describe("splitEqually", () => {
  it("均分为 n 等份", () => {
    expect(splitEqually(2)).toEqual([50, 50]);
    expect(splitEqually(4)).toEqual([25, 25, 25, 25]);
  });
});

function Group(props: { direction?: "horizontal" | "vertical"; sizes?: number[]; onSizesChange?: (s: number[]) => void; defaultSizes?: number[] }) {
  return (
    <ResizablePanelGroup
      direction={props.direction}
      sizes={props.sizes}
      defaultSizes={props.defaultSizes}
      onSizesChange={props.onSizesChange}
    >
      <ResizablePanel>左</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>右</ResizablePanel>
    </ResizablePanelGroup>
  );
}

describe("Resizable 结构与几何样式", () => {
  it("组容器：横向用 flex-row，纵向用 flex-col", () => {
    const { container, rerender } = render(<Group direction="horizontal" />);
    const group = container.firstElementChild as HTMLElement;
    expect(group.className).toContain("flex-row");
    rerender(<Group direction="vertical" />);
    expect((container.firstElementChild as HTMLElement).className).toContain("flex-col");
  });

  it("面板按 sizes 设 flexGrow 比例 + flexBasis 0", () => {
    const { container } = render(<Group defaultSizes={[70, 30]} />);
    const panels = container.querySelectorAll<HTMLElement>("[data-panel]");
    expect(panels.length).toBe(2);
    expect(panels[0].style.flexGrow).toBe("70");
    expect(panels[1].style.flexGrow).toBe("30");
    expect(panels[0].style.flexBasis).toBe("0%");
  });
});

describe("ResizableHandle a11y（role=separator）", () => {
  it("横向组：分隔符 aria-orientation=vertical + tabindex 0 + value 三件", () => {
    const { getByRole } = render(<Group direction="horizontal" defaultSizes={[40, 60]} />);
    const sep = getByRole("separator");
    expect(sep.getAttribute("aria-orientation")).toBe("vertical");
    expect(sep.getAttribute("tabindex")).toBe("0");
    expect(sep.getAttribute("aria-valuenow")).toBe("40");
    expect(sep.getAttribute("aria-valuemin")).toBe("10");
    expect(sep.getAttribute("aria-valuemax")).toBe("100");
  });

  it("纵向组：分隔符 aria-orientation=horizontal", () => {
    const { getByRole } = render(<Group direction="vertical" />);
    expect(getByRole("separator").getAttribute("aria-orientation")).toBe("horizontal");
  });
});

describe("键盘微调（无需几何，走纯 applyResize）", () => {
  it("受控：横向 ArrowRight 增大左面板，onSizesChange 收到新数组", () => {
    const onSizesChange = vi.fn();
    const { getByRole } = render(<Group direction="horizontal" sizes={[50, 50]} onSizesChange={onSizesChange} />);
    fireEvent.keyDown(getByRole("separator"), { key: "ArrowRight" });
    expect(onSizesChange).toHaveBeenCalledWith([55, 45]);
  });

  it("受控：ArrowLeft 减小左面板", () => {
    const onSizesChange = vi.fn();
    const { getByRole } = render(<Group direction="horizontal" sizes={[50, 50]} onSizesChange={onSizesChange} />);
    fireEvent.keyDown(getByRole("separator"), { key: "ArrowLeft" });
    expect(onSizesChange).toHaveBeenCalledWith([45, 55]);
  });

  it("非受控：ArrowRight 后 aria-valuenow 增大", () => {
    const { getByRole } = render(<Group direction="horizontal" defaultSizes={[50, 50]} />);
    const sep = getByRole("separator");
    fireEvent.keyDown(sep, { key: "ArrowRight" });
    expect(sep.getAttribute("aria-valuenow")).toBe("55");
  });

  it("Home/End 把左面板推到 min/max", () => {
    const onSizesChange = vi.fn();
    const { getByRole } = render(<Group direction="horizontal" sizes={[50, 50]} onSizesChange={onSizesChange} />);
    const sep = getByRole("separator");
    fireEvent.keyDown(sep, { key: "Home" });
    expect(onSizesChange).toHaveBeenCalledWith([10, 90]);
    fireEvent.keyDown(sep, { key: "End" });
    // End: 左面板到 max 100，但右面板 min 10 卡住 → 左 90
    expect(onSizesChange).toHaveBeenLastCalledWith([90, 10]);
  });

  it("纵向组用 ArrowDown/ArrowUp", () => {
    const onSizesChange = vi.fn();
    const { getByRole } = render(<Group direction="vertical" sizes={[50, 50]} onSizesChange={onSizesChange} />);
    fireEvent.keyDown(getByRole("separator"), { key: "ArrowDown" });
    expect(onSizesChange).toHaveBeenCalledWith([55, 45]);
  });
});
