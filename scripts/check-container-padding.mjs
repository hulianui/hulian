#!/usr/bin/env node
// check-container-padding.mjs — 守住 preset-core.css 里那份「容器内边距兜底 safelist」
// 与组件源码的一致性。
//
// 为什么需要它（hulianui/hulian#336）：
//
// Card / Dialog / Drawer / DocumentSheet 的内边距是全库唯一一族用 arbitrary value 写的
// 间距。400 个组件里只有这 4 个这么写，因为密度要靠 CSS 变量随 size 变体下发，同时还要
// 让消费方能用 className="p-0" 经 tailwind-merge 盖掉。
//
// 代价是一种极难归因的失效模式。消费方漏配 @source 时，px-4 / gap-2 / rounded-xl 这些
// 常规类照样生成（消费方自己代码里也写这些类，库组件等于蹭到了），而
// px-[var(--card-body-px,1.25rem)] 这种只有瑚琏源码里才有的字面量精准消失。净效果不是
// 「组件没样式」，而是「边框圆角颜色全对，唯独容器内边距整片塌掉」—— 看着像组件 bug，
// 于是根因被绕开，业务代码里补一句 className="p-4" 了事。
//
// preset-core.css 用 @source inline() 给这一族兜了底。但那份清单是**手写**的：
//   · 改了 Card 的密度值而忘了同步 safelist  → 消费方那边悄悄退回 fallback 档
//   · 删了某个分区而 safelist 留着陈旧条目    → 白占字节，且下次读的人以为它还在用
// 两种漂移都不会让 typecheck / 单测 / guard 变红，只能靠这个机械判据。
//
// 判据是双向的：
//   缺失 —— 组件源码里出现的间距候选，safelist 里必须有
//   陈旧 —— safelist 里的条目，组件源码里必须还在用
//
// 注释必须先剥掉再抓：dialog.tsx 有一句注释举例写着 className="p-0 [--hl-overlay-pad:0px]"，
// 那是给消费方看的用法示例、不是组件自己会渲染的类，混进来会要求 safelist 收一条永远用不上
// 的条目。（Tailwind 的扫描器本身不区分代码与注释，那是另一回事，由 candidates:check 管。）
//
// Run: node scripts/check-container-padding.mjs

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PRESET = join(ROOT, "packages", "tokens", "src", "preset-core.css");

// 扫描面是显式清单而不是「全库扫一遍」：safelist 的价值判据是「丢了会不会被误判成组件
// bug」，那是人的判断，不是正则能定的。全库扫会把 star-border 的 px-[26px]、scroll-stack
// 的 pt-[20vh] 这类特效件也拖进来 —— 它们塌了看得出来是特效没生效，不制造误诊。
const CONTAINERS = [
  ["packages/ui/src/card/card.tsx", "Card 根落密度变量，三个分区消费变量"],
  ["packages/ui/src/dialog/dialog.tsx", "Popup 内边距 + 正文滚动区的负边距补偿"],
  ["packages/ui/src/drawer/drawer.tsx", "同 Dialog，共用 --hl-overlay-pad"],
  ["packages/ui/src/document-sheet/document-sheet.tsx", "A4 纸张内边距"],
];

/** 间距类的属性前缀。m 系一起收：Dialog 的负边距补偿与 px 必须成对存在，只兜一半更糟。 */
const SPACING = String.raw`(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)`;
/** `px-[…]` / `mx-[…]`：任意值间距类。 */
const RE_SPACING = new RegExp(String.raw`\b${SPACING}-\[[^\]\s]*\]`, "g");
/** `[--card-body-px:1.25rem]`：行内落自定义属性。只收间距语义的名字，别把颜色变量也拖进来。 */
const RE_VAR_DECL = /\[--(?:card-(?:body|header|footer)-(?:px|py|pt|pb)|hl-overlay-pad):[^\]\s]*\]/g;

/**
 * 剥掉 JS/TS 注释，保留其余字节数不变（用空格填充），这样报错时的位置还能对上。
 * 字符串与模板字面量要认，否则 "https://…" 里的 // 会把后半行当注释吃掉。
 */
function stripComments(src) {
  const out = src.split("");
  let i = 0;
  const n = src.length;
  const blank = (from, to) => {
    for (let k = from; k < to; k += 1) if (out[k] !== "\n") out[k] = " ";
  };
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "/") {
      let j = i;
      while (j < n && src[j] !== "\n") j += 1;
      blank(i, j);
      i = j;
    } else if (c === "/" && d === "*") {
      let j = i + 2;
      while (j < n && !(src[j] === "*" && src[j + 1] === "/")) j += 1;
      j = Math.min(j + 2, n);
      blank(i, j);
      i = j;
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < n) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === c) { j += 1; break; }
        j += 1;
      }
      i = j;
    } else {
      i += 1;
    }
  }
  return out.join("");
}

/** preset-core.css 里所有 `@source inline("…")` 的内容，按空白切成候选集合。 */
function readSafelist() {
  const css = readFileSync(PRESET, "utf8");
  const re = /@source\s+inline\(\s*"([^"]*)"\s*\)/g;
  const set = new Set();
  let m;
  while ((m = re.exec(css)) !== null) {
    for (const token of m[1].split(/\s+/)) if (token) set.add(token);
  }
  return set;
}

function collectFromSource() {
  const found = new Map(); // 类名 → 出现的文件
  for (const [rel] of CONTAINERS) {
    const code = stripComments(readFileSync(join(ROOT, rel), "utf8"));
    for (const re of [RE_SPACING, RE_VAR_DECL]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(code)) !== null) {
        if (!found.has(m[0])) found.set(m[0], rel);
      }
    }
  }
  return found;
}

const safelist = readSafelist();
const source = collectFromSource();

const missing = [...source].filter(([cls]) => !safelist.has(cls));
const stale = [...safelist].filter((cls) => !source.has(cls));

if (missing.length === 0 && stale.length === 0) {
  console.log(
    `✓ 容器内边距 safelist 与组件源码一致（${source.size} 条，覆盖 ${CONTAINERS.length} 个容器）`,
  );
  process.exit(0);
}

const lines = ["容器内边距 safelist 与组件源码不一致。\n"];
if (missing.length) {
  lines.push("组件里用了但 safelist 没兜住（消费方漏配 @source 时这些会精准消失）：");
  for (const [cls, rel] of missing) lines.push(`  + ${cls}\n      ← ${rel}`);
  lines.push(`\n  修法：在 ${"packages/tokens/src/preset-core.css"} 的 safelist 段补上。`);
  lines.push("  注意 @source inline() 的字符串不能跨行，按分区拆成多条。\n");
}
if (stale.length) {
  lines.push("safelist 里有但组件已不再用（陈旧条目，白占产物字节）：");
  for (const cls of stale) lines.push(`  - ${cls}`);
  lines.push(`\n  修法：从 ${"packages/tokens/src/preset-core.css"} 的 safelist 段删掉。\n`);
}
lines.push("这份 safelist 为什么存在、什么该进什么不该进，见该段落上方的注释。");
console.error(lines.join("\n"));
process.exit(1);
