import { describe, expect, it } from "vitest";
import { demoHref } from "./demo-locale";

describe("demoHref", () => {
  it("keeps English demo navigation under /en", () => {
    expect(demoHref("/demos/crm/customers", "en")).toBe("/en/demos/crm/customers");
  });

  it("keeps Chinese demo navigation unchanged", () => {
    expect(demoHref("/demos/crm/customers", "zh-CN")).toBe("/demos/crm/customers");
  });
});
