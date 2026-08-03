import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOCALE_STORAGE_KEY, basePathForLocale } from "../lib/docs-locale";

// 语言前缀取自 SSOT：根语言为空串，嵌套语言带前缀。断言只写前缀变量，不写字面量 ——
// 浏览器地址（history.replaceState 那几处）仍用裸路由，那是输入不是期望。
const EN = basePathForLocale("en");
const ZH = basePathForLocale("zh-CN");
import { LanguageSwitcher } from "./language-switcher";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/components/button?q=x#api");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.cookie = "hl_locale=; path=/; max-age=0";
  });

  it("links both languages to the same page while preserving query and hash", () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole("link", { name: "切换到中文" }).getAttribute("href")).toBe(
      `${ZH}/components/button?q=x#api`,
    );
    expect(
      screen.getByRole("link", { name: "Switch to English" }).getAttribute("href"),
    ).toBe(`${EN}/components/button?q=x#api`);
  });

  it("keeps the current pathname in the server-rendered raw anchors", () => {
    const html = renderToStaticMarkup(
      <LanguageSwitcher pathname="/components/button" />,
    );

    expect(html).toContain(`href="${ZH}/components/button"`);
    expect(html).toContain(`href="${EN}/components/button"`);
  });

  it("refreshes both destinations when the hash changes after render", () => {
    render(<LanguageSwitcher />);

    window.history.replaceState({}, "", "/components/button?q=x#examples");
    fireEvent(window, new Event("hashchange"));

    expect(screen.getByRole("link", { name: "切换到中文" }).getAttribute("href")).toBe(
      `${ZH}/components/button?q=x#examples`,
    );
    expect(
      screen.getByRole("link", { name: "Switch to English" }).getAttribute("href"),
    ).toBe(`${EN}/components/button?q=x#examples`);
  });

  it("refreshes both destinations after query-only history navigation", () => {
    render(<LanguageSwitcher />);

    window.history.pushState({}, "", "/components/button?q=filters#api");
    fireEvent(window, new PopStateEvent("popstate"));

    expect(screen.getByRole("link", { name: "切换到中文" }).getAttribute("href")).toBe(
      `${ZH}/components/button?q=filters#api`,
    );
    expect(
      screen.getByRole("link", { name: "Switch to English" }).getAttribute("href"),
    ).toBe(`${EN}/components/button?q=filters#api`);
  });

  it("derives a modified-click destination from the live URL even without a history event", () => {
    render(<LanguageSwitcher />);
    const english = screen.getByRole("link", { name: "Switch to English" });
    english.addEventListener("click", (event) => event.preventDefault());

    window.history.replaceState({}, "", "/components/button?q=latest#usage");
    fireEvent.click(english, { metaKey: true });

    expect(english.getAttribute("href")).toBe(
      `${EN}/components/button?q=latest#usage`,
    );
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

  // The Chinese mirror's nginx reads this cookie to decide whether the root path still
  // redirects to /zh (deploy/nginx/hulianui-zh.haloritual.com.conf). The values below are
  // that config's `map` keys — changing either side alone silently re-breaks the switch to
  // English on the mirror's home page, and no type checks the two files against each other.
  it("writes the server-readable language cookie the mirror's nginx matches", () => {
    render(<LanguageSwitcher />);

    const english = screen.getByRole("link", { name: "Switch to English" });
    const chinese = screen.getByRole("link", { name: "切换到中文" });
    english.addEventListener("click", (event) => event.preventDefault());
    chinese.addEventListener("click", (event) => event.preventDefault());

    fireEvent.click(english);
    expect(document.cookie).toContain("hl_locale=en");

    fireEvent.click(chinese);
    expect(document.cookie).toContain("hl_locale=zh");
  });

  it("keeps navigation usable when preference storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    render(<LanguageSwitcher />);

    const english = screen.getByRole("link", { name: "Switch to English" });
    english.addEventListener("click", (event) => event.preventDefault());

    expect(() => fireEvent.click(english)).not.toThrow();
    // A dead localStorage must not take the cookie down with it: the cookie is what keeps
    // the mirror from bouncing this reader back to Chinese, and the two are written in
    // separate try blocks precisely so one failing cannot skip the other.
    expect(document.cookie).toContain("hl_locale=en");
  });
});
