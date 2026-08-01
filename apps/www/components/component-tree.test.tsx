import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/components/button",
}));

describe("ComponentTree English chrome", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("localizes filter controls and the empty-state escape hatch", async () => {
    vi.resetModules();
    vi.stubEnv("DOCS_LOCALE", "en");
    const { ComponentTree } = await import("./component-tree");
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

  it("does not repeat an export name identical to the English short name", async () => {
    vi.resetModules();
    vi.stubEnv("DOCS_LOCALE", "en");
    const { ComponentTree } = await import("./component-tree");
    render(<ComponentTree />);

    const buttonLink = screen
      .getAllByRole("link")
      .find((link) => link.getAttribute("href") === "/en/components/button");

    expect(buttonLink).toBeDefined();
    expect(buttonLink?.textContent).toBe("Button");
  }, 30_000);
});
