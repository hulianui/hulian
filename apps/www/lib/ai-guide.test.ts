import { describe, expect, it } from "vitest";

import { AI_GUIDE_MD, aiGuide } from "./ai-guide";
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
