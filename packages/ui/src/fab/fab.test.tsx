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

  it("draggable 时按住拖动写入根节点 inline transform", () => {
    const { getByLabelText } = render(<Fab draggable aria-label="新建" />);
    const main = getByLabelText("新建");
    // 偏移落在根容器（fixed 定位层）而非主钮自身，主钮的 transform 留给 active 缩放。
    const root = main.parentElement!;
    const before = root.style.transform;
    fireEvent.pointerDown(main, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(main, { clientX: 140, clientY: 130 });
    expect(root.style.transform).not.toBe(before);
    expect(root.style.transform).toContain("translate3d(40px, 30px, 0)");
  });

  it("draggable 时拖拽越过 3px 阈值后本次抬手不触发 onClick", () => {
    const onClick = vi.fn();
    const { getByLabelText } = render(<Fab draggable onClick={onClick} aria-label="新建" />);
    const main = getByLabelText("新建");
    fireEvent.pointerDown(main, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(main, { clientX: 20, clientY: 0 });
    fireEvent.pointerUp(main);
    // 指针抬起后浏览器仍会补发 click，组件须把这次吞掉，否则拖完必误触。
    fireEvent.click(main);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("未开 draggable 时 pointerMove 不产生任何位移", () => {
    const { getByLabelText } = render(<Fab aria-label="新建" />);
    const main = getByLabelText("新建");
    const root = main.parentElement!;
    fireEvent.pointerDown(main, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(main, { clientX: 200, clientY: 200 });
    // draggable=false 连 inline style 都不该挂上，拖不动是预期行为
    expect(root.style.transform).toBe("");
  });

  it("拖拽期间关掉按压缩放，抬手后恢复", () => {
    const { getByLabelText } = render(<Fab draggable aria-label="新建" />);
    const main = getByLabelText("新建");
    // 静息态挂 active:scale-[0.97]（按下去才缩），拖拽态换成常驻 scale-100。
    // 缩小表达「被按进平面」，与拖拽的「拿起来移动」语义相反，故拖动中必须让位。
    expect(main.className).toContain("active:scale-[0.97]");

    fireEvent.pointerDown(main, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(main, { clientX: 20, clientY: 0 }); // 越过 3px 阈值
    expect(main.className).toContain("scale-100");
    expect(main.className).not.toContain("active:scale-[0.97]");

    fireEvent.pointerUp(main);
    expect(main.className).toContain("active:scale-[0.97]");
  });

  it("pointerCancel 与 pointerUp 同样重置拖拽态", () => {
    const { getByLabelText } = render(<Fab draggable aria-label="新建" />);
    const main = getByLabelText("新建");
    fireEvent.pointerDown(main, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(main, { clientX: 20, clientY: 0 });
    expect(main.className).toContain("scale-100");

    // 真机上手势被系统打断（来电、手势冲突）时只派发 cancel 不派发 up，
    // 不接就会永久卡在拖拽态。
    fireEvent.pointerCancel(main);
    expect(main.className).toContain("active:scale-[0.97]");
  });
});
