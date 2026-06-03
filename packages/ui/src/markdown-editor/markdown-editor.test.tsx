import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MarkdownEditor } from "./markdown-editor";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

describe("MarkdownEditor", () => {
  it("渲染 contenteditable 编辑区并解析初值 markdown", async () => {
    render(<MarkdownEditor defaultValue={"# 你好\n\n正文"} aria-label="详情编辑器" />);
    const region = await screen.findByRole("textbox", { name: "详情编辑器" });
    expect(region).toBeTruthy();
    expect(region.querySelector("h1")?.textContent).toBe("你好");
  });
});
