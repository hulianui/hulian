import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { diffLines, diffStat } from "./code-diff.diff";
import { CodeDiff } from "./code-diff";

describe("diffLines", () => {
  it("无变化 → 全 context", () => {
    const rows = diffLines("a\nb\nc", "a\nb\nc");
    expect(rows.every((r) => r.type === "context")).toBe(true);
    expect(rows.length).toBe(3);
  });
  it("纯新增", () => {
    const rows = diffLines("a\nb", "a\nx\nb");
    expect(rows.map((r) => r.type)).toEqual(["context", "add", "context"]);
    expect(rows[1]).toMatchObject({ type: "add", oldNo: null, newNo: 2, text: "x" });
  });
  it("纯删除", () => {
    const rows = diffLines("a\nx\nb", "a\nb");
    expect(rows.map((r) => r.type)).toEqual(["context", "del", "context"]);
    expect(rows[1]).toMatchObject({ type: "del", oldNo: 2, newNo: null, text: "x" });
  });
  it("修改 = 删 + 增", () => {
    const rows = diffLines("a\nb\nc", "a\nB\nc");
    const types = rows.map((r) => r.type);
    expect(types).toContain("del");
    expect(types).toContain("add");
    expect(types.filter((t) => t === "context").length).toBe(2);
  });
  it("空旧文本 → 全 add（不产生空 del）", () => {
    const rows = diffLines("", "a\nb");
    expect(rows.map((r) => r.type)).toEqual(["add", "add"]);
  });
  it("空新文本 → 全 del", () => {
    const rows = diffLines("a\nb", "");
    expect(rows.map((r) => r.type)).toEqual(["del", "del"]);
  });
  it("diffStat 计增删", () => {
    const rows = diffLines("a\nb\nc", "a\nB\nc\nd");
    expect(diffStat(rows)).toEqual({ added: 2, removed: 1 });
  });
});

describe("CodeDiff 组件", () => {
  it("unified：渲染增删行 + 摘要", () => {
    const { getByText, container } = render(
      <CodeDiff oldText={"const a = 1\nconst b = 2"} newText={"const a = 1\nconst b = 3"} />,
    );
    expect(getByText("const b = 2")).toBeTruthy();
    expect(getByText("const b = 3")).toBeTruthy();
    // 删行带 danger 底色
    expect(container.querySelector(".bg-danger\\/10")).toBeTruthy();
    expect(container.querySelector(".bg-success\\/10")).toBeTruthy();
  });
  it("split：双栏 grid", () => {
    const { container } = render(
      <CodeDiff mode="split" oldText={"a\nb"} newText={"a\nc"} />,
    );
    expect(container.querySelector(".grid-cols-2")).toBeTruthy();
  });
  it("filename 渲染头部", () => {
    const { getByText } = render(
      <CodeDiff filename="app.tsx" oldText="a" newText="b" />,
    );
    expect(getByText("app.tsx")).toBeTruthy();
  });
});
