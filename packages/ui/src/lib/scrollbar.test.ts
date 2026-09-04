import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { classicScrollbar, SUPPORTS_NO_WEBKIT_SCROLLBAR } from "./scrollbar";

// Chromium 121+：scrollbar-width / scrollbar-color 任一非 auto，::-webkit-scrollbar* 整体失效，
// macOS 上一条都不画（#347，Table 0.63.2 / Chart / Gantt 各栽过一次）。所以这两个标准属性
// 只许以 @supports not selector(::-webkit-scrollbar) 守卫的形态出现，且只许在本模块里写。
// 「裸写」= 工具类 [scrollbar-width:…] / [scrollbar-color:…] 前面没有任何变体前缀。
// `[scrollbar-width:none]` 不在此列：那是「藏掉滚动条」，与 ::-webkit-scrollbar:hidden 同义并存无害。
const BARE_STANDARD = /(^|[\s"'`])\[scrollbar-(?:width:(?!none\])|color:)/u;

const SRC = join(__dirname, "..");
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    if (!/\.tsx?$/u.test(entry.name)) return [];
    if (/\.test\.tsx?$/u.test(entry.name)) return [];
    return [full];
  });
}

describe("lib/scrollbar：经典滚动条皮肤", () => {
  it.each(Object.entries(classicScrollbar))("%s 档：标准属性只以守卫形态出现，且 ::-webkit 皮肤齐全", (_, skin) => {
    expect(skin).toContain(`${SUPPORTS_NO_WEBKIT_SCROLLBAR}[scrollbar-width:thin]`);
    expect(skin).toContain(`${SUPPORTS_NO_WEBKIT_SCROLLBAR}[scrollbar-color:`);
    expect(skin).not.toMatch(BARE_STANDARD);
    expect(skin).toContain("[&::-webkit-scrollbar-track]:bg-transparent");
    expect(skin).toContain("[&::-webkit-scrollbar-thumb]:rounded-full");
    // 厚度不属于皮肤：由调用处补，否则两档会各带一个不合适的默认值
    expect(skin).not.toMatch(/\[&::-webkit-scrollbar\]:[hw]-/u);
  });

  it("全库源码不许再裸写 scrollbar-width（none 除外）/ scrollbar-color，只能从本模块取", () => {
    const offenders = sourceFiles(SRC)
      .filter((file) => relative(SRC, file) !== join("lib", "scrollbar.ts"))
      .flatMap((file) => {
        const lines = readFileSync(file, "utf8").split("\n");
        return lines.flatMap((line, i) =>
          BARE_STANDARD.test(line) ? [`${relative(SRC, file)}:${i + 1}: ${line.trim()}`] : [],
        );
      });
    expect(offenders).toEqual([]);
  });
});
