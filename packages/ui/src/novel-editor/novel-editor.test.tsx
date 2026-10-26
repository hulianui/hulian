import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NovelEditor } from "./novel-editor";

const chapters = [{ id: "c1", title: "夜航", content: "河面暗下来。" }];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  if (!document.elementFromPoint) document.elementFromPoint = vi.fn(() => null);
});

afterEach(cleanup);

describe("NovelEditor", () => {
  it("改标题会交出新的章节，预览能看见正文", () => {
    const onChaptersChange = vi.fn();
    render(<NovelEditor defaultChapters={chapters} onChaptersChange={onChaptersChange} />);
    expect(screen.getAllByText("河面暗下来。").length).toBeGreaterThan(1);
    fireEvent.change(screen.getByRole("textbox", { name: "章节标题" }), { target: { value: "夜色" } });
    expect(onChaptersChange).toHaveBeenCalled();
    expect(onChaptersChange.mock.lastCall?.[0][0].title).toBe("夜色");
  });

  it("可以新建章节，也可以删除到空态", () => {
    render(<NovelEditor defaultChapters={chapters} />);
    fireEvent.click(screen.getByRole("button", { name: "新建章节" }));
    expect(screen.getByRole("button", { name: /未命名章节/ })).toBeTruthy();
    const deletes = screen.getAllByRole("button", { name: "删除" });
    fireEvent.click(deletes[0]);
    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    fireEvent.click(screen.getByRole("button", { name: "删除" }));
    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    expect(screen.getByText("还没有章节")).toBeTruthy();
  });

  it("工具栏把正文改成标题", async () => {
    const onChaptersChange = vi.fn();
    render(<NovelEditor defaultChapters={chapters} onChaptersChange={onChaptersChange} />);
    await screen.findByRole("textbox", { name: "正文" });
    fireEvent.click(screen.getByRole("button", { name: "标题 1" }));
    const markdown = onChaptersChange.mock.calls.at(-1)?.[0]?.[0]?.content as string | undefined;
    expect(markdown ?? "").toContain("#");
  });
});
