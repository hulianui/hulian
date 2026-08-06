import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Dossier } from "./dossier";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const sections = [
  { key: "basic", label: "基本信息", status: "done" as const, summary: "林晚晴 · 138-xxxx" },
  { key: "intent", label: "求职意向", status: "partial" as const, active: true },
  { key: "edu", label: "教育背景", status: "empty" as const },
  { key: "extra", label: "可选补充", status: "empty" as const, optional: true },
];

describe("Dossier", () => {
  // 护栏套在整棵案卷树上（4 个域行 × StatusIcon），只有整树跳过才过。
  it("稳定父更新时跳过案卷子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <Dossier sections={sections} title="案卷" archivedLabel="已归档" optionalLabel="可选" />
    ));
  });

  it("渲染全部域 label 与 summary", () => {
    const { container } = render(<Dossier sections={sections} />);
    expect(container.textContent).toContain("基本信息");
    expect(container.textContent).toContain("林晚晴 · 138-xxxx");
    expect(container.textContent).toContain("可选补充");
  });
  it("默认进度 = done 数 / 非 optional 总数", () => {
    const { container } = render(<Dossier sections={sections} />);
    expect(container.textContent).toContain("1/3");
  });
  it("optional 空域显示「可选」标注", () => {
    const { container } = render(<Dossier sections={sections} />);
    expect(container.textContent).toContain("可选");
  });
  it("active 域有高亮容器（data-active）", () => {
    const { container } = render(<Dossier sections={sections} />);
    expect(container.querySelector('[data-active="true"]')).toBeTruthy();
  });
  it("bare 模式无外框", () => {
    const { container } = render(<Dossier sections={sections} bare />);
    expect((container.firstElementChild as HTMLElement).className).not.toContain("border-border");
  });
});
