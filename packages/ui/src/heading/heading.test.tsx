import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Heading } from "./heading";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Heading", () => {
  it("默认 level=2 → 渲染 <h2>", () => {
    const { getByText } = render(<Heading>标题</Heading>);
    expect(getByText("标题").tagName).toBe("H2");
  });

  it("level 决定语义标签 h{level}", () => {
    const { getByText } = render(<Heading level={4}>四级</Heading>);
    expect(getByText("四级").tagName).toBe("H4");
  });

  it("as 覆盖渲染标签（视觉/语义解耦）", () => {
    const { getByText } = render(
      <Heading level={1} as="div">
        伪标题
      </Heading>,
    );
    const el = getByText("伪标题");
    expect(el.tagName).toBe("DIV");
    // 仍应带 level=1 的默认视觉尺寸
    expect(el.className).toContain("text-4xl");
  });

  it("默认视觉尺寸按 level 派生（level=1 → text-4xl）", () => {
    const { getByText } = render(<Heading level={1}>大</Heading>);
    expect(getByText("大").className).toContain("text-4xl");
  });

  it("size 覆盖默认视觉尺寸（独立于 level）", () => {
    const { getByText } = render(
      <Heading level={2} size="sm">
        小标题
      </Heading>,
    );
    const el = getByText("小标题");
    expect(el.className).toContain("text-sm");
    expect(el.className).not.toContain("text-3xl");
  });

  it("weight 映射字重类，默认 semibold", () => {
    const { getByText, rerender } = render(<Heading>默认</Heading>);
    expect(getByText("默认").className).toContain("font-semibold");
    rerender(<Heading weight="bold">粗</Heading>);
    expect(getByText("粗").className).toContain("font-bold");
  });

  it("balance 启用 text-balance", () => {
    const { getByText } = render(<Heading balance>平衡换行</Heading>);
    expect(getByText("平衡换行").className).toContain("text-balance");
  });

  it("消费 text-foreground 语义 token", () => {
    const { getByText } = render(<Heading>token</Heading>);
    expect(getByText("token").className).toContain("text-foreground");
  });

  it("透传 className 与原生属性", () => {
    const { getByText } = render(
      <Heading className="mb-2" id="h" data-x="1">
        透传
      </Heading>,
    );
    const el = getByText("透传");
    expect(el.className).toContain("mb-2");
    expect(el.id).toBe("h");
    expect(el.getAttribute("data-x")).toBe("1");
  });

  it("本体不含 \"use client\"（保持可 RSC）", () => {
    const src = readFileSync(`${process.cwd()}/src/heading/heading.tsx`, "utf8");
    // 只看「指令行」（行首引号包裹），注释里出现的字面量不算
    expect(/^\s*["']use client["']/m.test(src)).toBe(false);
  });
});

// 见 hulianui/hulian#89：稳定父更新时整棵子树必须 bail out。
describe("Heading · memo", () => {
  it("稳定父更新时跳过标题子树", async () => {
    await expectMemoSkipsSubtree(() => <Heading level={2}>稳定标题</Heading>);
  });
});
