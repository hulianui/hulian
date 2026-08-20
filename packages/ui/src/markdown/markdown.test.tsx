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
});
