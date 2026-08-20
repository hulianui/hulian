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

  it("折叠块 details/summary 有排版规则，且与 pre 同一视觉家族", () => {
    const { container } = render(
      <Prose>
        <details>
          <summary>展开看答案</summary>
          <p>答案正文</p>
        </details>
      </Prose>,
    );
    const cls = container.firstElementChild!.className;
    // 容器：圆角 + border + surface 底，与 [&_pre] 取值一致
    expect(cls).toContain("[&_details]:rounded-[var(--radius)]");
    expect(cls).toContain("[&_details]:border-border");
    expect(cls).toContain("[&_details]:bg-surface");
    expect(cls).toContain("[&_details]:my-4");
    // summary 是连点目标：可点 + 不可选中
    expect(cls).toContain("[&_summary]:cursor-pointer");
    expect(cls).toContain("[&_summary]:select-none");
    expect(cls).toContain("[&_summary]:font-semibold");
    expect(cls).toContain("[&_summary:hover]:text-primary");
    // 首个内容块与 summary 留一档、末元素外边距收敛
    expect(cls).toContain("[&_details>summary+*]:mt-3");
    expect(cls).toContain("[&_details>:last-child]:mb-0");
    // 内容本身照常渲染
    expect(container.querySelector("details > summary")!.textContent).toBe("展开看答案");
  });

  it("嵌套 details 落弱背景，与外层的 surface 区分开", () => {
    const { container } = render(
      <Prose>
        <details>
          <summary>外层</summary>
          <details>
            <summary>内层</summary>
            <p>内层正文</p>
          </details>
        </details>
      </Prose>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("[&_details_details]:bg-subtle");
    // 后代选择器比 [&_details] 多一层元素，特异性更高，内层才吃得到 bg-subtle
    expect(cls.indexOf("[&_details_details]:bg-subtle")).toBeGreaterThan(cls.indexOf("[&_details]:bg-surface"));
    expect(container.querySelector("details details")).toBeTruthy();
  });

  it("scrollableTables 把 table 变成横向滚动容器，默认不开", () => {
    const table = (
      <table>
        <thead>
          <tr>
            <th>列</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>值</td>
          </tr>
        </tbody>
      </table>
    );
    const { container, rerender } = render(<Prose>{table}</Prose>);
    const off = container.firstElementChild!.className;
    expect(off).toContain("[&_table]:w-full");
    expect(off).not.toContain("[&_table]:overflow-x-auto");

    rerender(<Prose scrollableTables>{table}</Prose>);
    const on = container.firstElementChild!.className;
    expect(on).toContain("[&_table]:overflow-x-auto");
    expect(on).toContain("[&_table]:block");
    expect(on).toContain("[&_table]:max-w-full");
    // 表头不换行是滚动成立的前提：只给 overflow 时列会被压到 min-content，永远不溢出也就不滚
    expect(on).toContain("[&_th]:whitespace-nowrap");
    // w-max 顶掉基线的 w-full（同属性冲突交给 tailwind-merge，不能两条并存）
    expect(on).toContain("[&_table]:w-max");
    expect(on).not.toContain("[&_table]:w-full");
    // scrollableTables 不落到 DOM 属性上
    expect(container.querySelector("article")!.hasAttribute("scrollabletables")).toBe(false);
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

  // 引用块不许强制 italic：中文字体（PingFang SC / 微软雅黑）没有真正的意大利体字形，
  // font-style: italic 会让浏览器合成伪斜体，笔画倾斜变形、可读性明显下降。
  // 引用的语义由左边线 + 弱化文字色表达，倾斜不承担任何语义。
  // <em> 的 italic 保留：那是作者显式写的强调，属于内容语义，不是容器强加的装饰。
  it("引用块不带 italic（中文伪斜体），但 em 的 italic 保留", () => {
    const { container } = render(
      <Prose>
        <p>x</p>
      </Prose>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).not.toContain("[&_blockquote]:italic");
    expect(cls).toContain("[&_em]:italic");
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
