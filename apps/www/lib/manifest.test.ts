import { describe, it, expect } from "vitest";
import { manifest, CATEGORIES } from "./manifest";
import { specBySlug } from "./registry";

describe("IA SSOT manifest↔registry 契约", () => {
  it("slug 唯一", () => {
    const slugs = manifest.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("每个 manifest 条目的 category 合法", () => {
    const keys = new Set(CATEGORIES.map((c) => c.key));
    for (const m of manifest) expect(keys.has(m.category)).toBe(true);
  });

  it("每个 manifest 条目的 group 属于其 category 的 groups", () => {
    const groupsByCat = new Map(CATEGORIES.map((c) => [c.key, new Set(c.groups.map((g) => g.key))]));
    for (const m of manifest)
      expect(groupsByCat.get(m.category)?.has(m.group), `${m.slug} 的 group「${m.group}」不在 ${m.category}`).toBe(true);
  });

  it("每个 manifest 条目都有对应 spec（漏注册会在此失败）", () => {
    for (const m of manifest) expect(specBySlug[m.slug], `缺 spec: ${m.slug}`).toBeDefined();
  });

  it("registry 无 manifest 之外的孤儿 spec", () => {
    const slugs = new Set(manifest.map((m) => m.slug));
    for (const slug of Object.keys(specBySlug)) expect(slugs.has(slug), `孤儿 spec: ${slug}`).toBe(true);
  });
});
