import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ThreadList } from "./thread-list";

const items = [
  { id: "a", title: "云栖科技 · 总裁私人秘书", meta: "3 分钟前", active: true },
  { id: "b", title: "新的简历对话", meta: "昨天" },
];

describe("ThreadList", () => {
  it("渲染标题/条目/meta", () => {
    const { container } = render(<ThreadList items={items} />);
    expect(container.textContent).toContain("历史");
    expect(container.textContent).toContain("云栖科技 · 总裁私人秘书");
    expect(container.textContent).toContain("昨天");
  });
  it("active 项带 data-active", () => {
    const { container } = render(<ThreadList items={items} />);
    expect(container.querySelector('[data-active="true"]')?.textContent).toContain("云栖科技");
  });
  it("点击条目触发 onSelect", () => {
    const onSelect = vi.fn();
    const { getByText } = render(<ThreadList items={items} onSelect={onSelect} />);
    fireEvent.click(getByText("新的简历对话"));
    expect(onSelect).toHaveBeenCalledWith("b");
  });
  it("onDelete 提供时渲染删除钮，点击只触发 onDelete 不触发 onSelect", () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    const { container } = render(<ThreadList items={items} onSelect={onSelect} onDelete={onDelete} />);
    const del = container.querySelector('[aria-label="删除会话"]') as HTMLElement;
    fireEvent.click(del);
    expect(onDelete).toHaveBeenCalledWith("a");
    expect(onSelect).not.toHaveBeenCalled();
  });
  it("空列表显示占位", () => {
    const { container } = render(<ThreadList items={[]} />);
    expect(container.textContent).toContain("暂无历史");
  });
});
