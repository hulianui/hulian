import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ComponentTree } from "./component-tree";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/components/button",
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
    expect(
      screen
        .getByRole("link", { name: "Search the whole site (pages, blocks, and templates)" })
        .getAttribute("href"),
    ).toBe("/en/search?q=no-such-component");
  }, 30_000);

  it("does not repeat an export name identical to the English short name", () => {
    render(<ComponentTree />);

    const buttonLink = screen
      .getAllByRole("link")
      .find((link) => link.getAttribute("href") === "/en/components/button");

    expect(buttonLink).toBeDefined();
    expect(buttonLink?.textContent).toBe("Button");
  }, 30_000);
});
