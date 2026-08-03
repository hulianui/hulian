import { describe, expect, it } from "vitest";
import {
  NESTED_BASE_PATH,
  NESTED_LOCALE,
  ROOT_LOCALE,
  basePathForLocale,
  canonicalPathForLocale,
  localeFromPath,
  stripDocsBasePath,
  switchLocaleUrl,
  withDocsBasePath,
} from "./docs-locale";

describe("docs locale URLs", () => {
  it("puts the root locale at the site root and the other one behind a prefix", () => {
    expect(basePathForLocale(ROOT_LOCALE)).toBe("");
    expect(basePathForLocale(NESTED_LOCALE)).toBe(NESTED_BASE_PATH);
    expect(withDocsBasePath("/components/button", ROOT_LOCALE)).toBe("/components/button");
    expect(withDocsBasePath("/components/button", NESTED_LOCALE)).toBe(
      `${NESTED_BASE_PATH}/components/button`,
    );
  });

  it("preserves query and hash while switching", () => {
    expect(switchLocaleUrl("/components/button?q=x#api", NESTED_LOCALE)).toBe(
      `${NESTED_BASE_PATH}/components/button?q=x#api`,
    );
    expect(
      switchLocaleUrl(`${NESTED_BASE_PATH}/components/button?q=x#api`, ROOT_LOCALE),
    ).toBe("/components/button?q=x#api");
  });

  it("does not double-prefix an already-prefixed path", () => {
    expect(withDocsBasePath(`${NESTED_BASE_PATH}/components/button`, NESTED_LOCALE)).toBe(
      `${NESTED_BASE_PATH}/components/button`,
    );
    expect(stripDocsBasePath(`${NESTED_BASE_PATH}/components/button`)).toBe("/components/button");
    expect(stripDocsBasePath(NESTED_BASE_PATH)).toBe("/");
    expect(stripDocsBasePath(`${NESTED_BASE_PATH}/`)).toBe("/");
  });

  it("tells which locale a path belongs to", () => {
    expect(localeFromPath("/components/button")).toBe(ROOT_LOCALE);
    expect(localeFromPath("/")).toBe(ROOT_LOCALE);
    expect(localeFromPath(NESTED_BASE_PATH)).toBe(NESTED_LOCALE);
    expect(localeFromPath(`${NESTED_BASE_PATH}/components/button`)).toBe(NESTED_LOCALE);
  });

  it("gives the nested home page a trailing slash for outward-facing URLs", () => {
    // 静态托管把无尾斜杠的 "/zh" 当目录并 308 到 "/zh/"。canonical / hreflang / sitemap
    // 指向会跳转的地址属于软错误，必须写最终可达形式；站内路由则仍用无尾斜杠那份。
    expect(canonicalPathForLocale("/", NESTED_LOCALE)).toBe(`${NESTED_BASE_PATH}/`);
    expect(withDocsBasePath("/", NESTED_LOCALE)).toBe(NESTED_BASE_PATH);
    expect(canonicalPathForLocale("/", ROOT_LOCALE)).toBe("/");
    // 非首页两者一致，不该凭空多出尾斜杠。
    expect(canonicalPathForLocale("/components/button", NESTED_LOCALE)).toBe(
      `${NESTED_BASE_PATH}/components/button`,
    );
  });

  it("keeps the TS mirror in sync with the .mjs layout SSOT", async () => {
    // docs-locale.ts 的常量是 scripts/docs-locale-layout.mjs 的镜像（后者要被 next.config.mjs
    // 与构建脚本直接 import，只能是 .mjs）。任一侧改了另一侧没跟，这条立刻红。
    const layout = await import("../../../scripts/docs-locale-layout.mjs");

    expect(layout.ROOT_LOCALE).toBe(ROOT_LOCALE);
    expect(layout.NESTED_LOCALE).toBe(NESTED_LOCALE);
    expect(layout.NESTED_BASE_PATH).toBe(NESTED_BASE_PATH);
  });
});
