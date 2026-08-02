import { describe, expect, it } from "vitest";

import { AI_GUIDE_MD, aiGuide } from "./ai-guide";

describe("AI guide locale selection", () => {
  it("keeps the canonical Chinese guide unchanged for Chinese builds", () => {
    expect(aiGuide("zh-CN")).toBe(AI_GUIDE_MD);
  });

  it("copies an English-only guide with /en distribution links", () => {
    const guide = aiGuide("en");

    expect(guide).toContain("# Hulian UI");
    expect(guide).toContain("https://hulianui.haloritual.com/en/d/<component-slug>.md");
    expect(guide).not.toMatch(/[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/u);
  });
});
