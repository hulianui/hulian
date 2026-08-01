import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  COMPONENT_RECENT_STORAGE_KEY,
  ComponentQuickJump,
  findExactComponent,
} from "./component-quick-jump";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("findExactComponent", () => {
  it.each(["Button", "按钮", "button", "BuTtOn"])(
    "resolves the unique exact component identity %s",
    (query) => {
      expect(findExactComponent(query)?.id).toBe("component:button");
    },
  );

  it("does not call an ambiguous alias an exact result", () => {
    expect(findExactComponent("animated")).toBeNull();
  });

  it("does not treat a unique group label as an exact component identity", () => {
    expect(findExactComponent("引导")).toBeNull();
  });
});

describe("ComponentQuickJump", () => {
  beforeEach(() => {
    push.mockReset();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates a unique exact name on Enter without requiring a highlighted row", () => {
    render(<ComponentQuickJump placement="catalog" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.change(input, { target: { value: "BuTtOn" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(push).toHaveBeenCalledWith("/components/button");
  });

  it("requires a highlighted result for ambiguous fuzzy input", () => {
    render(<ComponentQuickJump placement="home" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.change(input, { target: { value: "animated" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(push).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const highlighted = screen
      .getAllByRole("option")
      .find((option) => option.getAttribute("aria-selected") === "true");
    expect(highlighted).toBeDefined();

    const href = highlighted?.getAttribute("href");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(push).toHaveBeenCalledWith(href);
  });

  it("does not immediately navigate a unique generic group match on Enter", () => {
    render(<ComponentQuickJump placement="home" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.change(input, { target: { value: "引导" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("option", { name: /漫游引导.*tour/i })).toBeTruthy();
  });

  it("supports ArrowDown and Escape while retaining combobox semantics", () => {
    render(<ComponentQuickJump placement="catalog" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "button" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input.getAttribute("aria-activedescendant")).toBeTruthy();
    expect(screen.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("teaches the empty state with popular and safely stored recent shortcuts", () => {
    window.localStorage.setItem(COMPONENT_RECENT_STORAGE_KEY, JSON.stringify(["input", "button"]));

    render(<ComponentQuickJump placement="catalog" />);

    expect(screen.getByText("最近访问")).toBeTruthy();
    expect(screen.getByText("常用组件")).toBeTruthy();
    expect(screen.getAllByRole("option").length).toBeGreaterThanOrEqual(3);
    expect(
      screen
        .getAllByRole("option")
        .some((option) => option.getAttribute("href") === "/components/input"),
    ).toBe(true);
  });

  it("does not let storage failures block component navigation", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    render(<ComponentQuickJump placement="catalog" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.change(input, { target: { value: "button" } });
    expect(() => fireEvent.keyDown(input, { key: "Enter" })).not.toThrow();
    expect(push).toHaveBeenCalledWith("/components/button");
  });

  it("emits localized component hrefs in server-rendered markup", () => {
    const html = renderToStaticMarkup(<ComponentQuickJump placement="catalog" />);

    expect(html).toContain('href="/components/button"');
    expect(html).not.toContain('href="/en/en/');
  });

  it("renders exactly one English base path from a fresh locale module graph", async () => {
    vi.resetModules();
    vi.stubEnv("DOCS_LOCALE", "en");
    try {
      const { ComponentQuickJump: EnglishQuickJump } = await import("./component-quick-jump");
      const html = renderToStaticMarkup(<EnglishQuickJump placement="catalog" />);

      expect(html).toContain('href="/en/components/button"');
      expect(html).not.toContain('href="/en/en/');
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
