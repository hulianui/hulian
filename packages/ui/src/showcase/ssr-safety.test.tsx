// 文档站是 output: "export" 的静态导出：每个 /components/<slug> 都要在构建期预渲染一遍。
// showcase 的示例里只要有一处在**服务端渲染时**抛错，那一页就整页导出失败 —— 而单测
// （jsdom 客户端渲染）与真实浏览器都看不出来，因为两边都有 React 错误边界兜着。
// 这条守卫把「构建 10 分钟后才发现」提前到秒级。实例：PreviewSandbox 的「同文档模式」示例
// 为了演示错误边界而真的抛错，一度打断整站构建（hulianui/hulian#91）。
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import * as allShowcases from "../showcase";

describe("showcase 的静态导出安全性", () => {
  it("examples/states 在服务端渲染时不抛错（否则静态导出会整页失败）", () => {
    const bad: string[] = [];
    for (const [slug, spec] of Object.entries(allShowcases as Record<string, any>).filter(([k, v]) => k.endsWith("Showcase") && v && typeof v === "object")) {
      for (const [i, e] of (spec.examples ?? []).entries()) {
        try { renderToStaticMarkup(<>{e.render()}</>); }
        catch (err) { bad.push(`${slug} example[${i}] ${e.title}: ${(err as Error).message}`); }
      }
      for (const [i, s] of (spec.states ?? []).entries()) {
        try { renderToStaticMarkup(<>{s.render()}</>); }
        catch (err) { bad.push(`${slug} state[${i}] ${s.name}: ${(err as Error).message}`); }
      }
    }
    expect(bad).toEqual([]);
  });
});
