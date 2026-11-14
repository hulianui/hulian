import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "@hulianui/ui";
import { linkifyComponentMentions } from "./component-links";
import { basePathForLocale } from "./docs-locale";
import { manifest } from "./manifest";

const ZH = basePathForLocale("zh-CN");

// 纯函数测试只证明「字符串里有链接语法」，这里再走一遍真正的渲染器：
// 生成的 Markdown 链接必须能被站点实际使用的 <Markdown> 解析成可点 <a>。
describe("更新日志正文渲染", () => {
  it("组件名渲染成指向文档页的链接", () => {
    const md = linkifyComponentMentions("修复 Button 的焦点环。", "zh-CN");
    const { container } = render(<Markdown size="sm">{md}</Markdown>);
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe(`${ZH}/components/button`);
    expect(link?.textContent).toBe("Button");
  });

  it("代码块里的标识符仍然只是代码", () => {
    const md = linkifyComponentMentions(
      ["```tsx", 'import { Button } from "@hulianui/ui";', "```"].join("\n"),
      "zh-CN",
    );
    const { container } = render(<Markdown size="sm">{md}</Markdown>);
    expect(container.querySelector("a")).toBeNull();
  });
});
