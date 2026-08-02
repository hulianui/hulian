import { describe, expect, it } from "vitest";
import config from "../intlayer.config";

describe("Intlayer docs configuration", () => {
  it("requires both published locales and disables runtime routing", () => {
    expect(config.internationalization?.locales).toEqual(["zh-CN", "en"]);
    expect(config.internationalization?.requiredLocales).toEqual(["zh-CN", "en"]);
    expect(config.internationalization?.strictMode).toBe("strict");
    expect(config.routing?.enableProxy).toBe(false);
    expect(config.dictionary?.fill).toBe(false);
  });
});
