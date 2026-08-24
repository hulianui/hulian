import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text } from "./text";
import { textShowcase } from "./text.showcase";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Text", () => {
  it("默认渲染 <p>", () => {
    const { getByText } = render(<Text>正文</Text>);
    expect(getByText("正文").tagName).toBe("P");
  });

  it("as 覆盖渲染标签", () => {
    const { getByText } = render(<Text as="span">行内</Text>);
    expect(getByText("行内").tagName).toBe("SPAN");
  });

  it("size 映射字号类，默认 base", () => {
    const { getByText, rerender } = render(<Text>默认</Text>);
    expect(getByText("默认").className).toContain("text-base");
    rerender(<Text size="sm">小</Text>);
    expect(getByText("小").className).toContain("text-sm");
  });

  it("tone 映射语义色 token，默认 foreground", () => {
    const { getByText } = render(
      <>
        <Text>默认</Text>
        <Text tone="muted">弱</Text>
        <Text tone="primary">主</Text>
        <Text tone="success">成</Text>
        <Text tone="warning">警</Text>
        <Text tone="danger">险</Text>
      </>,
    );
    expect(getByText("默认").className).toContain("text-foreground");
    expect(getByText("弱").className).toContain("text-muted-foreground");
    expect(getByText("主").className).toContain("text-primary");
    expect(getByText("成").className).toContain("text-success");
    expect(getByText("警").className).toContain("text-warning");
    expect(getByText("险").className).toContain("text-danger");
  });

  it("weight 映射字重类，默认 normal", () => {
    const { getByText, rerender } = render(<Text>常规</Text>);
    expect(getByText("常规").className).toContain("font-normal");
    rerender(<Text weight="semibold">半粗</Text>);
    expect(getByText("半粗").className).toContain("font-semibold");
  });

  it("truncate 添加单行省略类", () => {
    const { getByText } = render(<Text truncate>很长很长的文本</Text>);
    expect(getByText("很长很长的文本").className).toContain("truncate");
  });

  it("lineClamp 走 inline style，且不应用 truncate（优先级高于 truncate）", () => {
    const { getByText } = render(
      <Text truncate lineClamp={3}>
        多行截断文本
      </Text>,
    );
    const el = getByText("多行截断文本") as HTMLElement;
    expect(el.className).not.toContain("truncate");
    expect(el.style.getPropertyValue("-webkit-line-clamp")).toBe("3");
    expect(el.style.display).toBe("-webkit-box");
    expect(el.style.overflow).toBe("hidden");
  });

  it("透传 className 与 style（不覆盖 clamp 关键属性）", () => {
    const { getByText } = render(
      <Text className="mt-1" style={{ color: "red" }} lineClamp={2}>
        透传
      </Text>,
    );
    const el = getByText("透传") as HTMLElement;
    expect(el.className).toContain("mt-1");
    expect(el.style.color).toBe("red");
    expect(el.style.getPropertyValue("-webkit-line-clamp")).toBe("2");
  });

  it("本体不含 \"use client\"（保持可 RSC）", () => {
    const src = readFileSync(`${process.cwd()}/src/text/text.tsx`, "utf8");
    // 只看「指令行」（行首引号包裹），注释里出现的字面量不算
    expect(/^\s*["']use client["']/m.test(src)).toBe(false);
  });
});

describe("Text typography (#326)", () => {
  it("family 映射 sans 与 mono", () => {
    render(
      <>
        <Text family="sans">正文</Text>
        <Text family="mono">代码</Text>
      </>,
    );
    expect(screen.getByText("正文").className).toContain("font-sans");
    expect(screen.getByText("代码").className).toContain("font-mono");
  });

  it("family 缺省时不抢祖先字族", () => {
    render(<Text>继承</Text>);
    const cls = screen.getByText("继承").className;
    expect(cls).not.toContain("font-sans");
    expect(cls).not.toContain("font-mono");
  });

  it("numeric 只在 true 时添加 tabular-nums", () => {
    const { rerender } = render(<Text numeric>1024.50</Text>);
    expect(screen.getByText("1024.50").className).toContain("tabular-nums");
    rerender(<Text numeric={false}>1024.50</Text>);
    expect(screen.getByText("1024.50").className).not.toContain("tabular-nums");
  });

  it("family/numeric 与现有排版 prop 可组合", () => {
    render(
      <Text family="mono" numeric size="sm" weight="semibold">
        42
      </Text>,
    );
    const cls = screen.getByText("42").className;
    expect(cls).toContain("font-mono");
    expect(cls).toContain("tabular-nums");
    expect(cls).toContain("text-sm");
    expect(cls).toContain("font-semibold");
  });

  it("playground 默认继承字族且生成代码省略 family", () => {
    const family = textShowcase.controls.find((control) => control.prop === "family");
    expect(family?.defaultValue).toBe("inherit");

    const props = {
      tone: "default",
      size: "base",
      weight: "normal",
      family: "inherit",
      numeric: false,
      truncate: false,
    };
    expect(textShowcase.toCode(props)).toBe("<Text>瑚琏 Text 多态文本原语</Text>");

    render(<>{textShowcase.renderWithProps(props)}</>);
    const cls = screen.getByText("瑚琏 Text 多态文本原语").className;
    expect(cls).not.toContain("font-sans");
    expect(cls).not.toContain("font-mono");
  });
});

// 见 hulianui/hulian#89：稳定父更新时整棵子树必须 bail out。
describe("Text · memo", () => {
  it("稳定父更新时跳过文本子树", async () => {
    await expectMemoSkipsSubtree(() => <Text>稳定文本</Text>);
  });
});
