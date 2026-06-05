import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Fab } from "./fab";

afterEach(cleanup);

const actions = [
  { key: "a", icon: <span>A</span>, label: "动作A", onClick: vi.fn() },
  { key: "b", icon: <span>B</span>, label: "动作B" },
];

describe("Fab", () => {
  it("无 actions 时点击主钮直接触发 onClick", () => {
    const onClick = vi.fn();
    const { getByLabelText } = render(<Fab onClick={onClick} aria-label="新建" />);
    fireEvent.click(getByLabelText("新建"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("无 actions 时主钮不带 aria-expanded", () => {
    const { getByLabelText } = render(<Fab aria-label="新建" />);
    expect(getByLabelText("新建").getAttribute("aria-expanded")).toBeNull();
  });

  it("有 actions 时点击主钮切换 aria-expanded", () => {
    const { getByLabelText } = render(<Fab actions={actions} aria-label="菜单" />);
    const main = getByLabelText("菜单");
    expect(main.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(main);
    expect(main.getAttribute("aria-expanded")).toBe("true");
  });

  it("点击子动作触发其 onClick 并收起", () => {
    const { getByLabelText } = render(<Fab actions={actions} aria-label="菜单" />);
    fireEvent.click(getByLabelText("菜单"));
    fireEvent.click(getByLabelText("动作A"));
    expect(actions[0].onClick).toHaveBeenCalledOnce();
    expect(getByLabelText("菜单").getAttribute("aria-expanded")).toBe("false");
  });

  it("子动作以 label 作 aria-label", () => {
    const { getByLabelText } = render(<Fab actions={actions} aria-label="菜单" />);
    expect(getByLabelText("动作B")).toBeTruthy();
  });

  it("label 渲染 extended 胶囊：显示文字且默认作 aria-label", () => {
    const { getByText, getByLabelText } = render(
      <Fab label="返回示例库" icon={<span>I</span>} onClick={vi.fn()} />,
    );
    expect(getByText("返回示例库")).toBeTruthy();
    // 未显式给 aria-label 时回落到 label
    expect(getByLabelText("返回示例库")).toBeTruthy();
  });

  it("显式 aria-label 优先于 label", () => {
    const { getByLabelText } = render(<Fab label="返回示例库" aria-label="回到画廊" />);
    expect(getByLabelText("回到画廊")).toBeTruthy();
  });
});
