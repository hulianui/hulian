import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Prose } from "./prose";

describe("Prose", () => {
  it("默认渲染 <article> 容器", () => {
    const { container } = render(
      <Prose>
        <p>段落</p>
      </Prose>,
    );
    expect(container.querySelector("article")).toBeTruthy();
  });

  it("as 覆盖容器标签", () => {
    const { container } = render(
      <Prose as="div">
        <p>段落</p>
      </Prose>,
    );
    expect(container.querySelector("div")).toBeTruthy();
    expect(container.querySelector("article")).toBeNull();
  });

  it("把富文本子节点渲染进容器", () => {
    const { getByText, container } = render(
      <Prose>
        <h1>标题</h1>
        <p>
          一段含 <a href="/x">链接</a> 与 <code>code</code> 的正文。
        </p>
        <ul>
          <li>列表项</li>
        </ul>
      </Prose>,
    );
    expect(getByText("标题").tagName).toBe("H1");
    expect(container.querySelector("a")!.getAttribute("href")).toBe("/x");
    expect(container.querySelector("li")).toBeTruthy();
  });

  it("容器 className 含后代排版钩子（标题/段落/列表/代码/引用）", () => {
    const { container } = render(
      <Prose>
        <p>x</p>
      </Prose>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("[&_h1]:font-bold");
    expect(cls).toContain("[&_p]:my-4");
    expect(cls).toContain("[&_ul]:list-disc");
    expect(cls).toContain("[&_blockquote]:border-l-2");
    // 行内代码排除 pre 内 code
    expect(cls).toContain("[&_:not(pre)>code]");
  });

  it("size 映射基准字号，默认 base", () => {
    const { container, rerender } = render(
      <Prose>
        <p>x</p>
      </Prose>,
    );
    expect(container.firstElementChild!.className).toContain("text-base");
    rerender(
      <Prose size="sm">
        <p>x</p>
      </Prose>,
    );
    expect(container.firstElementChild!.className).toContain("text-sm");
  });

  it("只消费语义 token（foreground/muted/border/primary），不写死颜色", () => {
    const { container } = render(
      <Prose>
        <p>x</p>
      </Prose>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("text-foreground");
    expect(cls).toContain("[&_blockquote]:text-muted-foreground");
    expect(cls).toContain("[&_a]:text-primary");
    expect(cls).toContain("[&_pre]:border-border");
  });

  it("透传 className 到容器", () => {
    const { container } = render(
      <Prose className="max-w-prose">
        <p>x</p>
      </Prose>,
    );
    expect(container.firstElementChild!.className).toContain("max-w-prose");
  });

  it("本体不含 \"use client\"（保持可 RSC）", () => {
    const src = readFileSync(`${process.cwd()}/src/prose/prose.tsx`, "utf8");
    // 只看「指令行」（行首引号包裹），注释里出现的字面量不算
    expect(/^\s*["']use client["']/m.test(src)).toBe(false);
  });
});
