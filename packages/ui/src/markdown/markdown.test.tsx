import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Markdown } from "./markdown";
import { extractHeadings } from "./headings";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

describe("Markdown", () => {
  it("横向可滚动表格容器可用键盘聚焦", () => {
    const { container } = render(<Markdown>{"| A | B |\n| --- | --- |\n| 1 | 2 |"}</Markdown>);
    expect(container.querySelector(".overflow-x-auto")?.getAttribute("tabindex")).toBe("0");
  });

  it("默认不给标题挂 id —— 免得存量调用点升级后凭空多出 id 与页面已有的撞", () => {
    const { container } = render(<Markdown>{"## 安装\n\n正文"}</Markdown>);
    expect(container.querySelector("h2")?.hasAttribute("id")).toBe(false);
  });

  it("headingIds 挂出的 id 与 extractHeadings 抽出的逐字相同（含去重后缀）", () => {
    const src = "## 安装\n\n```bash\npnpm add x\n```\n\n## 安装\n\n### Getting Started";
    const { container } = render(<Markdown headingIds>{src}</Markdown>);
    const rendered = [...container.querySelectorAll("h1, h2, h3")].map((el) => el.id);
    expect(rendered).toEqual(extractHeadings(src).map((h) => h.id));
    // 围栏代码块会把标题打散进两个 Prose，去重后缀仍按文档顺序算
    expect(rendered).toEqual(["安装", "安装-1", "getting-started"]);
  });

  it("headingIds 传字符串即开启并作 id 前缀，与 extractHeadings 的同名参数对齐", () => {
    const src = "## Props\n\n## 示例";
    const { container } = render(<Markdown headingIds="doc-">{src}</Markdown>);
    const rendered = [...container.querySelectorAll("h2")].map((el) => el.id);
    expect(rendered).toEqual(["doc-props", "doc-示例"]);
    expect(rendered).toEqual(extractHeadings(src, "doc-").map((h) => h.id));
  });

  it("enUS exposes an English table label", () => {
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <Markdown>{"| A | B |\n| --- | --- |\n| 1 | 2 |"}</Markdown>
      </ConfigProvider>,
    );
    expect(getByLabelText("Data table")).toBeTruthy();
  });

  it("多反引号围栏里的 Markdown 语法原样保留，不再被二次解析", () => {
    // 「用 Markdown 讲 Markdown 语法」的文档必踩：`` `x` `` 若被单反引号分支从第一个
    // 反引号切开，围栏错位会让后面整行的标记跟着错 —— 本库 markdown.md 里那句
    // 「剥掉行内标记（…）」曾因此产出 <a href="链接">，静态导出后才被链接门禁抓到。
    const { container } = render(
      <Markdown>{"剥掉行内标记（`` `代码` `` / `**粗**` / `[文字](链接)`）"}</Markdown>,
    );

    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(container.querySelectorAll("strong")).toHaveLength(0);
    const codes = [...container.querySelectorAll("code")].map((el) => el.textContent);
    expect(codes).toEqual(["`代码`", "**粗**", "[文字](链接)"]);
  });

  it("行内代码照常解析，不因多反引号支持而回归", () => {
    const { container } = render(
      <Markdown>{"普通 `code` 与 **粗** 与 [链接](https://example.com/a) 混排"}</Markdown>,
    );

    expect(container.querySelector("code")?.textContent).toBe("code");
    expect(container.querySelector("strong")?.textContent).toBe("粗");
    expect(container.querySelector("a")?.getAttribute("href")).toBe("https://example.com/a");
  });
});
