import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as fieldEntry from "./index";
import * as mathEntry from "../math";
import * as rootEntry from "../index";

describe("math-field 导出面", () => {
  it("@hulianui/ui/math-field 的公开面", () => {
    for (const name of [
      "MathField",
      "createCasComparator",
      "stripMathDelimiters",
      "MATHLIVE_INSTALL_HINT",
      "COMPUTE_ENGINE_INSTALL_HINT",
      "MathLiveUnavailableError",
      "ComputeEngineUnavailableError",
      "MATH_FIELD_LOCALE_ZH",
      "MATH_FIELD_LOCALE_EN",
    ]) {
      expect((fieldEntry as Record<string, unknown>)[name], name).toBeDefined();
    }
  });

  it("@hulianui/ui/math 与主 barrel 一个都不带（math 入口零 MathLive，主包体积增量 0）", () => {
    expect((mathEntry as Record<string, unknown>).MathField).toBeUndefined();
    expect((mathEntry as Record<string, unknown>).createCasComparator).toBeUndefined();
    expect((rootEntry as Record<string, unknown>).MathField).toBeUndefined();
    expect((rootEntry as Record<string, unknown>).createCasComparator).toBeUndefined();
  });

  it("math-field 目录里没有静态 import mathlive / compute-engine（只允许 import() 表达式）", () => {
    for (const file of ["math-field.tsx", "mathlive-loader.ts", "cas.ts", "index.ts", "math-field.types.ts", "math-field.locale.ts"]) {
      // jsdom 下 import.meta.url 是 /src/…，不是真实路径；vitest 的 cwd 是 packages/ui。
      const source = readFileSync(join(process.cwd(), "src/math-field", file), "utf8");
      expect(source, file).not.toMatch(/^import[^;]*from\s+["'](mathlive|@cortex-js\/compute-engine)["']/m);
    }
  });
});
