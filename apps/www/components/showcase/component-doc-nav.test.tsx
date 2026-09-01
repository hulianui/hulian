import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CATEGORIES, componentMeta, manifest } from "../../lib/manifest";
import { ComponentDocNav, localizeComponentMarkdownLinks } from "./component-doc-nav";
import { basePathForLocale } from "../../lib/docs-locale";

// 语言前缀取自 SSOT：根语言为空串，嵌套语言带前缀。不写字面量。
const EN = basePathForLocale("en");
const ZH = basePathForLocale("zh-CN");

describe("ComponentDocNav", () => {
  it("links the previous and next components in canonical category order", () => {
    const ordered = CATEGORIES.flatMap((category) =>
      manifest.filter((item) => item.category === category.key),
    );
    const buttonIndex = ordered.findIndex((item) => item.slug === "button");
    const previous = ordered[buttonIndex - 1];
    const next = ordered[buttonIndex + 1];
    render(<ComponentDocNav slug="button" />);

    expect(
      screen
        .getByRole("link", { name: new RegExp(`上一个.*${componentMeta(previous).shortName}`) })
        .getAttribute("href"),
    ).toBe(`${ZH}/components/${previous.slug}`);
    expect(
      screen
        .getByRole("link", { name: new RegExp(`下一个.*${componentMeta(next).shortName}`) })
        .getAttribute("href"),
    ).toBe(`${ZH}/components/${next.slug}`);
    expect(screen.getByRole("link", { name: /返回.*表单/ }).getAttribute("href")).toBe(
      `${ZH}/components#forms`,
    );
  });

  it("crosses category boundaries after the last item in a category", () => {
    const layoutItems = manifest.filter((item) => item.category === "layout");
    const lastLayout = layoutItems.at(-1)!;
    const firstTypography = manifest.find((item) => item.category === "typography")!;

    render(<ComponentDocNav slug={lastLayout.slug} />);

    expect(
      screen
        .getByRole("link", {
          name: new RegExp(`下一个.*${componentMeta(firstTypography).shortName}`),
        })
        .getAttribute("href"),
    ).toBe(`${ZH}/components/${firstTypography.slug}`);
  });

  it("does not wrap past the first or final canonical component", () => {
    const ordered = CATEGORIES.flatMap((category) =>
      manifest.filter((item) => item.category === category.key),
    );
    const { rerender } = render(<ComponentDocNav slug={ordered[0].slug} />);
    expect(screen.queryByRole("link", { name: /上一个/ })).toBeNull();

    rerender(<ComponentDocNav slug={ordered.at(-1)!.slug} />);
    expect(screen.queryByRole("link", { name: /下一个/ })).toBeNull();
  });

  it("puts language-preserving category and sibling hrefs in static HTML", () => {
    const ordered = CATEGORIES.flatMap((category) =>
      manifest.filter((item) => item.category === category.key),
    );
    const buttonIndex = ordered.findIndex((item) => item.slug === "button");
    const html = renderToStaticMarkup(<ComponentDocNav slug="button" />);

    expect(html).toContain(`href="${ZH}/components/${ordered[buttonIndex - 1].slug}"`);
    expect(html).toContain(`href="${ZH}/components#forms"`);
    expect(html).toContain(`href="${ZH}/components/${ordered[buttonIndex + 1].slug}"`);
  });

  it("keeps rendered and copied Markdown links in the English language tree", () => {
    expect(
      localizeComponentMarkdownLinks(
        "[Related](/components/dialog) [Start](https://hulianui.haloritual.com/start)",
        "en",
      ),
    ).toBe(
      `[Related](${EN}/components/dialog) [Start](https://hulianui.haloritual.com${EN}/start)`,
    );
  });

  it("renders English sibling and category links from a fresh locale module graph", async () => {
    vi.resetModules();
    vi.stubEnv("DOCS_LOCALE", "en");
    try {
      const { ComponentDocNav: EnglishComponentDocNav } = await import("./component-doc-nav");
      // 邻居按规范顺序动态取（与上面中文用例同款）：写死 slug 会让每次新增组件都翻红一次。
      const ordered = CATEGORIES.flatMap((category) =>
        manifest.filter((item) => item.category === category.key),
      );
      const buttonIndex = ordered.findIndex((item) => item.slug === "button");
      const html = renderToStaticMarkup(<EnglishComponentDocNav slug="button" />);

      expect(html).toContain(`href="${EN}/components/${ordered[buttonIndex - 1].slug}"`);
      expect(html).toContain(`href="${EN}/components#forms"`);
      expect(html).toContain(`href="${EN}/components/${ordered[buttonIndex + 1].slug}"`);
      // 双前缀防回归。根语言前缀是空串时 `${EN}${EN}/` 会退化成 `/`，而页面上必然有
      // 指向首页的 href="/"，直接断言就成了必然误报 —— 故仅在前缀非空时检查。
      if (EN) expect(html).not.toContain(`href="${EN}${EN}/`);
      // 英文产物里不该混进另一个语种的地址（这条与谁挂根路径无关，恒有效）。
      expect(html).not.toContain(`href="${ZH}/`);
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
