import { describe, expect, it } from "vitest";
import { demoHref, demoLocationHref } from "./demo-locale";
import { basePathForLocale } from "../../../lib/docs-locale";

// 语言前缀取自 SSOT（scripts/docs-locale-layout.mjs 的 TS 镜像）：根语言为空串，
// 嵌套语言带前缀。不写 "/en" / "/zh" 字面量，语言布局翻转时本文件无需改动。
const EN = basePathForLocale("en");
const ZH = basePathForLocale("zh-CN");

describe("demoHref", () => {
  it("leaves basePath insertion to Next navigation", () => {
    expect(demoHref("/demos/crm/customers", "en")).toBe("/demos/crm/customers");
    // 输入已带语言前缀时也要剥干净：next/link 会自己补当前构建的 basePath，
    // 不剥就成了双前缀。用嵌套语言做输入 —— 根语言前缀是空串，剥不剥都看不出来。
    expect(demoHref(`${ZH}/demos/crm/customers`, "zh-CN")).toBe("/demos/crm/customers");
  });

  it("keeps Chinese demo navigation unchanged", () => {
    expect(demoHref("/demos/crm/customers", "zh-CN")).toBe("/demos/crm/customers");
  });

  it("keeps native browser locations inside the selected static export", () => {
    // 原生 anchor / window.location 走的是完整路径，必须带上该语种的 basePath。
    expect(demoLocationHref("/demos/crm/customers", "en")).toBe(`${EN}/demos/crm/customers`);
    expect(demoLocationHref("/demos/crm/customers", "zh-CN")).toBe(`${ZH}/demos/crm/customers`);
  });
});
