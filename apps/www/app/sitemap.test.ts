import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { SITE_URL } from "../lib/site";
import { NESTED_BASE_PATH, ROOT_LOCALE, canonicalPathForLocale } from "../lib/docs-locale";

const entries = sitemap();
const urls = entries.map((entry) => entry.url);
const nestedPrefix = `${SITE_URL}${NESTED_BASE_PATH}/`;

describe("sitemap", () => {
  it("submits every route in both locales", () => {
    // 上一版只提交了单一语种，另一语种从没进过 sitemap，只能靠 hreflang 被动发现。
    const nested = urls.filter((url) => url.startsWith(nestedPrefix));
    expect(nested).toHaveLength(entries.length / 2);
    expect(new Set(urls).size).toBe(entries.length);
    expect(entries.length).toBeGreaterThan(800);
  });

  it("never submits a URL that redirects", () => {
    // 静态托管把 "/zh" 当目录并 308 到 "/zh/"。sitemap 里放会跳转的地址，
    // Google 会判成「带重定向的网页」而不予收录 —— 整份 sitemap 就白提交了。
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(nestedPrefix);
    expect(urls).not.toContain(`${SITE_URL}${NESTED_BASE_PATH}`);
  });

  it("gives every entry the full hreflang set with x-default on the root locale", () => {
    for (const entry of entries) {
      const languages = entry.alternates?.languages;
      expect(languages).toBeDefined();
      expect(languages?.["x-default"]).toBe(languages?.[ROOT_LOCALE]);
      // 两个语种互指，且指向的都是最终可达形式。
      expect(languages?.["zh-CN"]).toMatch(
        new RegExp(`^${SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${NESTED_BASE_PATH}/`),
      );
      expect(languages?.en?.startsWith(`${SITE_URL}${NESTED_BASE_PATH}/`)).toBe(false);
    }
  });

  it("keeps the home page at top priority in both locales", () => {
    const homes = entries.filter(
      (entry) =>
        entry.url === `${SITE_URL}${canonicalPathForLocale("/", "en")}` ||
        entry.url === `${SITE_URL}${canonicalPathForLocale("/", "zh-CN")}`,
    );
    expect(homes).toHaveLength(2);
    for (const home of homes) expect(home.priority).toBe(1);
  });
});
