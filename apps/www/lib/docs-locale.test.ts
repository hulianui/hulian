import { describe, expect, it } from "vitest";
import {
  defaultLocaleForHost,
  stripDocsBasePath,
  switchLocaleUrl,
  withDocsBasePath,
} from "./docs-locale";

describe("docs locale URLs", () => {
  it("preserves query and hash while switching", () => {
    expect(switchLocaleUrl("/components/button?q=x#api", "en")).toBe(
      "/en/components/button?q=x#api",
    );
    expect(switchLocaleUrl("/en/components/button?q=x#api", "zh-CN")).toBe(
      "/components/button?q=x#api",
    );
  });

  it("does not double-prefix English paths", () => {
    expect(withDocsBasePath("/en/components/button", "en")).toBe(
      "/en/components/button",
    );
    expect(stripDocsBasePath("/en/components/button")).toBe(
      "/components/button",
    );
  });

  it("uses host defaults only when there is no stored choice", () => {
    expect(defaultLocaleForHost("hulianui.haloritual.com", null)).toBe("en");
    expect(defaultLocaleForHost("hulianui-zh.haloritual.com", null)).toBe(
      "zh-CN",
    );
    expect(defaultLocaleForHost("hulianui.haloritual.com", "zh-CN")).toBe(
      "zh-CN",
    );
  });
});
