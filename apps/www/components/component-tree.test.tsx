import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ComponentTree } from "./component-tree";

vi.mock("next/navigation", () => ({
  // 英文站挂**根路径**（见 scripts/docs-locale-layout.mjs），所以英文下的组件页
  // pathname 就是裸路径。写成 /en/... 的话 stripDocsBasePath 剥不掉前缀，
  // activeCat 解析不出来 → 所有大类默认收起 → 一个链接都不渲染，测试会以
  // 「找不到 role=link」的形式失败，而不是以 href 不对的形式失败。
  usePathname: () => "/components/button",
}));
vi.mock("../lib/docs-locale", async () => {
  const actual = await vi.importActual<typeof import("../lib/docs-locale")>("../lib/docs-locale");
  return {
    ...actual,
    DOCS_LOCALE: "en" as const,
    withDocsBasePath: (path: string) => {
      const bare = actual.stripDocsBasePath(path.startsWith("/") ? path : `/${path}`);
      return `/en${bare === "/" ? "" : bare}`;
    },
  };
});

describe("ComponentTree English chrome", () => {
  it("localizes filter controls and the empty-state escape hatch", () => {
    render(<ComponentTree />);

    const filter = screen.getByRole("textbox", { name: "Filter components in navigation" });
    expect(filter.getAttribute("placeholder")).toBe("Filter components…");
    expect(screen.getByRole("button", { name: "Animated" })).toBeTruthy();

    fireEvent.change(filter, { target: { value: "no-such-component" } });

    expect(screen.getByText("No matching components in this navigation.")).toBeTruthy();
    // href 是**裸路径**：导航链接走 next/link，basePath（/en）由 Next 在构建时注入，
    // 组件不再手工拼。jsdom 里没有 Next router 上下文，所以这里看到的就是裸路径；
    // 英文产物真带 /en 前缀由 `pnpm --filter www build` 的 out/en/*.html 保证
    // （同一写法的 site-navbar 产出的就是 href="/en/components"）。
    expect(
      screen
        .getByRole("link", { name: "Search the whole site (pages, blocks, and templates)" })
        .getAttribute("href"),
    ).toBe("/search?q=no-such-component");
  }, 30_000);

  it("does not repeat an export name identical to the English short name", () => {
    render(<ComponentTree />);

    const buttonLink = screen
      .getAllByRole("link")
      .find((link) => link.getAttribute("href") === "/components/button");

    expect(buttonLink).toBeDefined();
    expect(buttonLink?.textContent).toBe("Button");
  }, 30_000);
});
