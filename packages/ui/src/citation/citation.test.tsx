import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Citation } from "./citation";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Citation", () => {
  it("稳定父更新时跳过引用 chip 子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <Citation index={1} title="瑚琏文档" href="https://hulian.dev" source="hulian.dev" />
    ));
  });

  it("有 href 渲染外链 a + 新标签页", () => {
    const { getByText } = render(
      <Citation index={1} title="瑚琏文档" href="https://hulian.dev" source="hulian.dev" />,
    );
    const a = getByText("瑚琏文档").closest("a")!;
    expect(a.getAttribute("href")).toBe("https://hulian.dev");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
  });
  it("无 href 渲染 span（非链接）", () => {
    const { getByText } = render(<Citation title="本地笔记" />);
    expect(getByText("本地笔记").closest("a")).toBeNull();
  });
  it("渲染序号角标", () => {
    const { getByText } = render(<Citation index={3} title="来源" />);
    expect(getByText("3")).toBeTruthy();
  });
});
