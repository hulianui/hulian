import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Sortable } from "./sortable";

afterEach(cleanup);

interface Row {
  id: string;
  label: string;
}
const rows: Row[] = [
  { id: "a", label: "甲" },
  { id: "b", label: "乙" },
  { id: "c", label: "丙" },
];

describe("Sortable 渲染", () => {
  it("用 renderItem 渲染全部项，顺序与 items 一致", () => {
    const { container } = render(
      <Sortable items={rows} onChange={() => {}} renderItem={(r) => <span>{r.label}</span>} />,
    );
    const lis = container.querySelectorAll("li");
    expect(lis.length).toBe(3);
    expect(Array.from(lis).map((li) => li.textContent)).toEqual(["甲", "乙", "丙"]);
  });

  it("handle 模式：每项渲染可聚焦拖拽手柄（aria-label）", () => {
    const { getAllByLabelText } = render(
      <Sortable items={rows} handle onChange={() => {}} renderItem={(r) => <span>{r.label}</span>} />,
    );
    expect(getAllByLabelText("拖拽排序").length).toBe(3);
  });

  it("整项可拖模式：activator 落在 li 上（aria-roledescription=sortable），无独立手柄", () => {
    const { container, queryByLabelText } = render(
      <Sortable items={rows} onChange={() => {}} renderItem={(r) => <span>{r.label}</span>} />,
    );
    const li = container.querySelector("li")!;
    expect(li.getAttribute("aria-roledescription")).toBe("sortable");
    expect(queryByLabelText("拖拽排序")).toBeNull();
  });

  it("getId 自定义：不依赖 item.id 字段也能渲染", () => {
    const data = [{ key: "x", label: "X" }, { key: "y", label: "Y" }];
    const { container } = render(
      <Sortable
        items={data}
        getId={(d) => d.key}
        onChange={() => {}}
        renderItem={(d) => <span>{d.label}</span>}
      />,
    );
    expect(container.querySelectorAll("li").length).toBe(2);
  });

  it("挂载时不触发 onChange（仅拖拽/键盘移动后才触发）", () => {
    const onChange = vi.fn();
    render(<Sortable items={rows} onChange={onChange} renderItem={(r) => <span>{r.label}</span>} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("横向：容器用 flex 布局", () => {
    const { container } = render(
      <Sortable
        items={rows}
        orientation="horizontal"
        onChange={() => {}}
        renderItem={(r) => <span>{r.label}</span>}
      />,
    );
    expect(container.querySelector("ul")!.className).toContain("flex");
  });
});
