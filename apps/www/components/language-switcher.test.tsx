import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOCALE_STORAGE_KEY } from "../lib/docs-locale";
import { LanguageSwitcher } from "./language-switcher";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/components/button?q=x#api");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("links both languages to the same page while preserving query and hash", () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole("link", { name: "切换到中文" }).getAttribute("href")).toBe(
      "/components/button?q=x#api",
    );
    expect(
      screen.getByRole("link", { name: "Switch to English" }).getAttribute("href"),
    ).toBe("/en/components/button?q=x#api");
  });

  it("keeps the current pathname in the server-rendered raw anchors", () => {
    const html = renderToStaticMarkup(
      <LanguageSwitcher pathname="/components/button" />,
    );

    expect(html).toContain('href="/components/button"');
    expect(html).toContain('href="/en/components/button"');
  });

  it("marks the build locale as the current language", () => {
    render(<LanguageSwitcher />);

    expect(
      screen.getByRole("link", { name: "切换到中文" }).getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen.getByRole("link", { name: "Switch to English" }).getAttribute("aria-current"),
    ).toBeNull();
  });

  it("persists each explicit language choice before navigation", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    render(<LanguageSwitcher />);

    const english = screen.getByRole("link", { name: "Switch to English" });
    const chinese = screen.getByRole("link", { name: "切换到中文" });
    english.addEventListener("click", (event) => event.preventDefault());
    chinese.addEventListener("click", (event) => event.preventDefault());

    fireEvent.click(english);
    expect(setItem).toHaveBeenLastCalledWith(LOCALE_STORAGE_KEY, "en");

    fireEvent.click(chinese);
    expect(setItem).toHaveBeenLastCalledWith(LOCALE_STORAGE_KEY, "zh-CN");
  });

  it("keeps navigation usable when preference storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    render(<LanguageSwitcher />);

    const english = screen.getByRole("link", { name: "Switch to English" });
    english.addEventListener("click", (event) => event.preventDefault());

    expect(() => fireEvent.click(english)).not.toThrow();
  });
});
