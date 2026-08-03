import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CATEGORIES, componentMeta, manifest } from "../../lib/manifest";
import { ComponentDocNav, localizeComponentMarkdownLinks } from "./component-doc-nav";

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
    ).toBe(`/components/${previous.slug}`);
    expect(
      screen
        .getByRole("link", { name: new RegExp(`下一个.*${componentMeta(next).shortName}`) })
        .getAttribute("href"),
    ).toBe(`/components/${next.slug}`);
    expect(screen.getByRole("link", { name: /返回.*表单/ }).getAttribute("href")).toBe(
      "/components#forms",
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
    ).toBe(`/components/${firstTypography.slug}`);
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

    expect(html).toContain(`href="/components/${ordered[buttonIndex - 1].slug}"`);
    expect(html).toContain('href="/components#forms"');
    expect(html).toContain(`href="/components/${ordered[buttonIndex + 1].slug}"`);
  });

  it("keeps rendered and copied Markdown links in the English language tree", () => {
    expect(
      localizeComponentMarkdownLinks(
        "[Related](/components/dialog) [Start](https://hulianui.haloritual.com/start)",
        "en",
      ),
    ).toBe("[Related](/en/components/dialog) [Start](https://hulianui.haloritual.com/en/start)");
  });

  it("renders English sibling and category links from a fresh locale module graph", async () => {
    vi.resetModules();
    vi.stubEnv("DOCS_LOCALE", "en");
    try {
      const { ComponentDocNav: EnglishComponentDocNav } = await import("./component-doc-nav");
      const html = renderToStaticMarkup(<EnglishComponentDocNav slug="button" />);

      expect(html).toContain('href="/en/components/variable-proximity"');
      expect(html).toContain('href="/en/components#forms"');
      expect(html).toContain('href="/en/components/shimmer-button"');
      expect(html).not.toContain('href="/en/en/');
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
