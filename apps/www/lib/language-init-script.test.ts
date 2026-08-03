import { describe, expect, it, vi } from "vitest";
import { NESTED_BASE_PATH, type DocsLocale } from "./docs-locale";
import { createLanguageInitScript } from "./language-init-script";

type BootOptions = {
  locale: DocsLocale;
  hostname?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  stored?: string | null;
  storageError?: boolean;
};

function boot({
  locale,
  hostname = "hulianui.haloritual.com",
  pathname = "/components/button",
  search = "",
  hash = "",
  stored = null,
  storageError = false,
}: BootOptions) {
  const replace = vi.fn();
  const location = { hostname, pathname, search, hash, replace };
  const localStorage = {
    getItem: vi.fn(() => {
      if (storageError) throw new Error("storage disabled");
      return stored;
    }),
  };

  Function("window", createLanguageInitScript(locale))({ location, localStorage });

  return { replace, localStorage };
}

describe("languageInitScript", () => {
  it("never redirects a visitor who has not chosen a language", () => {
    // 这条是 SEO 底线。搜索引擎渲染 JS 时同样没有 localStorage，一旦这里按域名或浏览器语言
    // 自动跳转，爬虫就会把站内每个 URL 判成「带重定向的网页」，sitemap 提交的地址集体失效。
    for (const hostname of [
      "hulianui.haloritual.com",
      "hulianui-zh.haloritual.com",
      "localhost",
    ]) {
      expect(boot({ locale: "en", hostname }).replace).not.toHaveBeenCalled();
      expect(
        boot({ locale: "zh-CN", hostname, pathname: `${NESTED_BASE_PATH}/components/button` })
          .replace,
      ).not.toHaveBeenCalled();
    }
  });

  it("ignores a stored value it cannot use", () => {
    expect(boot({ locale: "en", stored: "fr" }).replace).not.toHaveBeenCalled();
    expect(boot({ locale: "en", stored: "" }).replace).not.toHaveBeenCalled();
    expect(boot({ locale: "en", storageError: true }).replace).not.toHaveBeenCalled();
  });

  it("honours an explicit stored choice in both directions", () => {
    expect(
      boot({ locale: "en", pathname: "/components/button", stored: "zh-CN" }).replace,
    ).toHaveBeenCalledWith(`${NESTED_BASE_PATH}/components/button`);

    expect(
      boot({
        locale: "zh-CN",
        pathname: `${NESTED_BASE_PATH}/components/button`,
        stored: "en",
      }).replace,
    ).toHaveBeenCalledWith("/components/button");
  });

  it("stays put when the stored choice already matches the current build", () => {
    expect(boot({ locale: "en", stored: "en" }).replace).not.toHaveBeenCalled();
    expect(
      boot({
        locale: "zh-CN",
        pathname: `${NESTED_BASE_PATH}/components/button`,
        stored: "zh-CN",
      }).replace,
    ).not.toHaveBeenCalled();
  });

  it("preserves query and hash across the switch", () => {
    expect(
      boot({
        locale: "en",
        pathname: "/components/button",
        search: "?q=x",
        hash: "#api",
        stored: "zh-CN",
      }).replace,
    ).toHaveBeenCalledWith(`${NESTED_BASE_PATH}/components/button?q=x#api`);

    expect(
      boot({
        locale: "zh-CN",
        pathname: `${NESTED_BASE_PATH}/components/button`,
        search: "?q=x",
        hash: "#api",
        stored: "en",
      }).replace,
    ).toHaveBeenCalledWith("/components/button?q=x#api");
  });

  it("targets the nested home page in its trailing-slash form", () => {
    // 直接跳 "/zh/"：跳到 "/zh" 会再吃一次静态托管的 308。
    expect(boot({ locale: "en", pathname: "/", stored: "zh-CN" }).replace).toHaveBeenCalledWith(
      `${NESTED_BASE_PATH}/`,
    );
    expect(
      boot({ locale: "zh-CN", pathname: `${NESTED_BASE_PATH}/`, stored: "en" }).replace,
    ).toHaveBeenCalledWith("/");
  });
});
