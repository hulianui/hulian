// `vitest-preset.js` / `.cjs` 与 `vite.js` / `.cjs` 一样住在包根、不在 `tsconfig.json` 的
// `include` 里，`pnpm typecheck` 完全看不到它们。这份测试守的是 #143：
// 没有 `"type": "module"` 的消费方（create-next-app 的默认形态）加载 `vitest.config.ts`
// 时走的是 CJS `require`，入口一旦只有 ESM，配置加载阶段就炸，一个用例都跑不到。
import { createRequire } from "node:module";
import { describe, it, expect } from "vitest";

import * as esm from "./vitest-preset.js";

const require = createRequire(import.meta.url);

describe("@hulianui/ui/vitest-preset 的模块形态", () => {
  it("能被 require 加载 —— 无 type:module 的消费方走的就是这条路", () => {
    const cjs = require("./vitest-preset.cjs");
    expect(typeof cjs.withHulian).toBe("function");
    expect(cjs.hulianDedupe).toContain("react");
  });

  it("两个入口导出同一份数据，不会各自漂移", () => {
    const cjs = require("./vitest-preset.cjs");
    expect(esm.hulianDedupe).toEqual(cjs.hulianDedupe);
    expect(esm.hulianConditions).toEqual(cjs.hulianConditions);
    expect(esm.hulianMainFields).toEqual(cjs.hulianMainFields);
    expect(esm.hulianInlineDeps).toEqual(cjs.hulianInlineDeps);
    // 比行为不比引用：vitest 会把 .cjs 经 ESM 与 require 两条管线各转换出一份实例，
    // 引用不同是转换管线的产物，不是两侧真的各写了一份实现。
    const input = { test: { environment: "jsdom" } };
    expect(esm.withHulian(input)).toEqual(cjs.withHulian(input));
  });

  it("withHulian 保留消费方已有配置，只做追加去重", () => {
    const merged = esm.withHulian({
      resolve: { dedupe: ["my-lib", "react"] },
      test: { environment: "jsdom", server: { deps: { inline: [/^my-pkg/] } } },
    });
    // 消费方的项在前，预设只往后追加；react 已存在不重复。
    expect(merged.resolve.dedupe.slice(0, 2)).toEqual(["my-lib", "react"]);
    expect(merged.resolve.dedupe.filter((d) => d === "react")).toHaveLength(1);
    expect(merged.test.environment).toBe("jsdom");
    expect(merged.test.server.deps.inline[0]).toEqual(/^my-pkg/);
    expect(merged.test.server.deps.inline).toHaveLength(1 + esm.hulianInlineDeps.length);
  });
});

describe("@hulianui/ui/vite 的模块形态", () => {
  it("能被 require 加载", () => {
    const cjs = require("./vite.cjs");
    expect(typeof cjs).toBe("function");
    expect(cjs().name).toBe("hulianui:dev");
  });
});
