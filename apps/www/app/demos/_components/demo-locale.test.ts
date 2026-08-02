import { describe, expect, it } from "vitest";
import { demoHref, demoLocationHref } from "./demo-locale";

describe("demoHref", () => {
  it("leaves basePath insertion to Next navigation", () => {
    expect(demoHref("/demos/crm/customers", "en")).toBe("/demos/crm/customers");
    expect(demoHref("/en/demos/crm/customers", "en")).toBe("/demos/crm/customers");
  });

  it("keeps Chinese demo navigation unchanged", () => {
    expect(demoHref("/demos/crm/customers", "zh-CN")).toBe("/demos/crm/customers");
  });

  it("keeps native browser locations inside the selected static export", () => {
    expect(demoLocationHref("/demos/crm/customers", "en")).toBe("/en/demos/crm/customers");
    expect(demoLocationHref("/demos/crm/customers", "zh-CN")).toBe("/demos/crm/customers");
  });
});
