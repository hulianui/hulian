import { describe, expect, it } from "vitest";

import { AI_GUIDE_MD, aiGuide, aiGuideBody } from "./ai-guide";
import { basePathForLocale } from "./docs-locale";

describe("AI guide locale selection", () => {
  it("keeps the canonical Chinese guide unchanged for Chinese builds", () => {
    expect(aiGuide("zh-CN")).toBe(AI_GUIDE_MD);
  });

  it("copies an English-only guide whose distribution links carry the English base path", () => {
    const guide = aiGuide("en");

    expect(guide).toContain("# Hulian UI");
    // 前缀取自 SSOT（scripts/docs-locale-layout.mjs）：英文挂根路径时它是空串。
    expect(guide).toContain(
      `https://hulianui.haloritual.com${basePathForLocale("en")}/d/<component-slug>.md`,
    );
    expect(guide).not.toMatch(/[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/u);
  });
});

describe("aiGuideBody", () => {
  it("strips the leading H1 and its lede from both locales", () => {
    for (const locale of ["zh-CN", "en"] as const) {
      const full = aiGuide(locale);
      const body = aiGuideBody(full);

      expect(full.startsWith("# ")).toBe(true);
      expect(body.startsWith("# ")).toBe(false);
      expect(body.startsWith("> ")).toBe(false);
      // 正文其余部分逐字保留，只是掐了个头
      expect(full.endsWith(body)).toBe(true);
      expect(body).toContain("## ");
    }
  });

  it("keeps quote blocks that are not the lede", () => {
    const md = "# Title\n\n> lede\n\nBody text.\n\n> a real quote\n";

    expect(aiGuideBody(md)).toBe("Body text.\n\n> a real quote\n");
  });

  it("returns the input untouched when it does not open with an H1", () => {
    const md = "Body only.\n";

    expect(aiGuideBody(md)).toBe(md);
  });
});
