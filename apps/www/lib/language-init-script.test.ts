import { describe, expect, it, vi } from "vitest";
import type { DocsLocale } from "./docs-locale";
import { createLanguageInitScript } from "./language-init-script";

type BootOptions = {
  locale: DocsLocale;
  hostname: string;
  pathname?: string;
  search?: string;
  hash?: string;
  stored?: string | null;
  storageError?: boolean;
};

function boot({
  locale,
  hostname,
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
  it("defaults the main host to English when there is no stored choice", () => {
    const { replace } = boot({
      locale: "zh-CN",
      hostname: "hulianui.haloritual.com",
    });

    expect(replace).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledWith("/en/components/button");
  });

  it("defaults the Chinese mirror to Chinese when there is no stored choice", () => {
    const { replace } = boot({
      locale: "zh-CN",
      hostname: "hulianui-zh.haloritual.com",
    });

    expect(replace).not.toHaveBeenCalled();
  });

  it("keeps the current build locale on local and unknown hosts", () => {
    expect(
      boot({ locale: "zh-CN", hostname: "localhost" }).replace,
    ).not.toHaveBeenCalled();
    expect(
      boot({ locale: "en", hostname: "preview.example.com", pathname: "/en/components/button" })
        .replace,
    ).not.toHaveBeenCalled();
  });

  it("lets a valid stored choice override either host default", () => {
    const chinese = boot({
      locale: "en",
      hostname: "hulianui.haloritual.com",
      pathname: "/en/components/button",
      stored: "zh-CN",
    });
    const english = boot({
      locale: "zh-CN",
      hostname: "hulianui-zh.haloritual.com",
      stored: "en",
    });

    expect(chinese.replace).toHaveBeenCalledWith("/components/button");
    expect(english.replace).toHaveBeenCalledWith("/en/components/button");
  });

  it("preserves query and hash in both redirect directions", () => {
    const english = boot({
      locale: "zh-CN",
      hostname: "hulianui.haloritual.com",
      pathname: "/components/button",
      search: "?q=x",
      hash: "#api",
    });
    const chinese = boot({
      locale: "en",
      hostname: "hulianui.haloritual.com",
      pathname: "/en/components/button",
      search: "?q=x",
      hash: "#api",
      stored: "zh-CN",
    });

    expect(english.replace).toHaveBeenCalledWith("/en/components/button?q=x#api");
    expect(chinese.replace).toHaveBeenCalledWith("/components/button?q=x#api");
  });

  it("does not redirect an English path to itself", () => {
    const { replace } = boot({
      locale: "en",
      hostname: "hulianui.haloritual.com",
      pathname: "/en/components/button",
    });

    expect(replace).not.toHaveBeenCalled();
  });

  it("catches storage access failures and still applies the host default", () => {
    const { replace } = boot({
      locale: "zh-CN",
      hostname: "hulianui.haloritual.com",
      search: "?q=x",
      hash: "#api",
      storageError: true,
    });

    expect(replace).toHaveBeenCalledWith("/en/components/button?q=x#api");
  });
});
