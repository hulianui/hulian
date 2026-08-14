// 源码文本 → 瑚琏使用信号。**只负责「从文本里读出了什么」，不负责「据此判断什么」。**
//
// 两个消费方的口径本就不同，这一层刻意不去统一它们：
//   packages/mcp/src/audit.mjs        单项目纵深：逐条精化置信度、给行号与片段、出迁移计划
//   scripts/agent-adoption-scan.mjs   跨项目横比：只数数，产出覆盖率基线
//
// 但「什么算一次组件使用」「哪些写法算手搓」必须是同一份 —— 各存一份的下场是同一个项目
// 在两处报出不同的数字，而两处都自称在测采用率。这一层就是那份共同事实。
//
// 边界：纯文本处理 + 目录遍历，只读不写；不认识 registry 的语义，也不做置信度判断。

import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * 跳过的目录。构建产物与依赖树里的代码不是本项目写的，计入会把统计彻底冲垮
 * （node_modules 一进来，覆盖率分母和手搓计数都失去意义）。
 */
export const SKIP_DIR = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  ".output",
  "dist",
  "build",
  "out",
  "coverage",
  "src-tauri",
  "target",
  "public",
  "vendor",
  "__snapshots__",
]);

export const CODE_EXT = /\.(tsx|ts|jsx|js|mjs)$/;
export const JSX_EXT = /\.(tsx|jsx)$/;

/**
 * 花括号内不会嵌套，用 [^{}] 而非 [\s\S] —— 后者会跨过上一条 import 的收尾花括号，
 * 把 react 的 useState/useEffect 一并算成瑚琏组件。
 */
export const IMPORT_RE = /import\s+(type\s+)?\{([^{}]*?)\}\s*from\s*["'](@hulianui\/[^"']+)["']/g;

/**
 * 手搓信号：本该用现成能力，却退回原生标签或内联样式。
 *
 * `baseConfidence` 是**未看上下文时**的先手判断，由 audit 的 refineRisk 逐条升降 ——
 * 裸 <table> 几乎一定该用 Table，裸 <button> 则大概率是图标热区。把这两条给同一个
 * 置信度，就是 #43 说的「一律标红」，审计会立刻失去可信度。
 *
 * 横比脚本只用 `id` / `re` 数数，不消费 `baseConfidence` / `why` —— 那是纵深侧的输入。
 */
export const RISK_RULES = [
  {
    id: "bare-table",
    should: "Table / ProTable",
    re: /<table[\s>]/g,
    baseConfidence: "high",
    why: "原生 table 拿不到排序 / 分页 / 冻结列 / 密度，且样式与主题脱节",
  },
  {
    id: "bare-dialog",
    should: "Dialog / Modal",
    re: /<dialog[\s>]/g,
    baseConfidence: "high",
    why: "原生 dialog 的焦点陷阱与滚动锁定行为跨浏览器不一致",
  },
  {
    id: "handmade-overlay",
    should: "Dialog / Drawer / Popover",
    re: /className=["'][^"']*fixed\s+inset-0/g,
    baseConfidence: "medium",
    why: "自制遮罩通常缺焦点陷阱、Esc 关闭、滚动锁定与 aria",
  },
  {
    id: "bare-select",
    should: "Select",
    re: /<select[\s>]/g,
    baseConfidence: "medium",
    why: "原生 select 无法定制选项渲染，且移动端表现不受控",
  },
  {
    id: "bare-textarea",
    should: "Textarea / Field",
    re: /<textarea[\s>]/g,
    baseConfidence: "medium",
    why: "缺自适应高度、计数与 Field 的错误态联动",
  },
  {
    id: "bare-input",
    should: "Input / Field",
    re: /<input[\s>]/g,
    baseConfidence: "medium",
    why: "缺 Field 的 label / 错误态 / 描述联动，无障碍要自己补",
  },
  {
    id: "bare-button",
    should: "Button",
    re: /<button[\s>]/g,
    baseConfidence: "low",
    why: "多数是图标热区或自定义控件，属正当用法；只有承担主要动作时才该换 Button",
  },
  {
    id: "inline-style",
    should: "语义 token / 组件 prop",
    re: /\sstyle=\{\{/g,
    baseConfidence: "low",
    why: "动态定位 / 计算尺寸用内联样式是正当的；只有写死颜色与间距才是问题",
  },
  {
    id: "hardcoded-color",
    should: "语义 token",
    re: /(?:text|bg|border|from|to|via|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/g,
    baseConfidence: "high",
    why: "硬编码颜色不跟随明暗主题，换肤时必然失真",
  },
];

/**
 * 把注释内容抹成空格再拿去匹配风险规则（#266）。
 *
 * 裸标签检测判的是 JSX 里的原生元素，而注释里写 `<table>` 是**迁移做得好**的标志 ——
 * 「原来这里是手写 <table>，现在换成 Table」正是最该写的注释，却成了扣分项。更荒唐的是
 * 照抄库自己文档的坑位说明（`table.md` 里那句「minWidth 落在 <table> 本体上」）也会中招：
 * 遵守文档 → 记下来 → 被自家审计报风险。
 *
 * **只抹注释，不碰字符串字面量** —— `className="fixed inset-0"` 与 `text-[#fff]` 这些
 * 恰恰住在字符串里，抹掉它们就把 handmade-overlay / hardcoded-color 两条规则一起废了。
 * 所以这里是个带状态的小扫描器而不是几条正则：`"https://x"` 里的 `//` 不是注释。
 *
 * 长度与换行逐字保留 —— 调用方按 `match.index` 算行号、并从**原文**取片段，位移一变全错。
 */
export function maskComments(text) {
  const out = text.split("");
  const n = text.length;
  let i = 0;
  // normal | line | block | ' | " | `
  let state = "normal";
  const blank = (from, to) => {
    for (let k = from; k < to; k++) if (out[k] !== "\n") out[k] = " ";
  };
  while (i < n) {
    const c = text[i];
    const next = text[i + 1];
    if (state === "normal") {
      if (c === "/" && next === "/") {
        let end = text.indexOf("\n", i);
        if (end === -1) end = n;
        blank(i, end);
        i = end;
        continue;
      }
      if (c === "/" && next === "*") {
        let end = text.indexOf("*/", i + 2);
        end = end === -1 ? n : end + 2;
        blank(i, end);
        i = end;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") state = c;
      i += 1;
      continue;
    }
    // 字符串里：只找收尾引号，转义符跳过下一个字符
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (c === state) state = "normal";
    i += 1;
  }
  return out.join("");
}

/**
 * 递归收集代码文件，返回相对 `base` 的 posix 路径。
 *
 * `maxFiles` 是安全阀而非优化：扫到 monorepo 根时文件数没有上界，静默扫穿不如如实截断。
 * 调用方拿 `files.length >= maxFiles` 自己判断要不要报 truncated —— 静默截断会让
 * 「扫过了」变成假话。横比脚本不设上限（它扫的是已知的本机项目），tool 设。
 */
export function walkCodeFiles(dir, { maxFiles = Infinity, base = dir, acc = [] } = {}) {
  if (acc.length >= maxFiles) return acc;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (acc.length >= maxFiles) return acc;
    if (entry.name.startsWith(".")) continue;
    if (SKIP_DIR.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walkCodeFiles(path, { maxFiles, base, acc });
    else if (CODE_EXT.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      acc.push(relative(base, path).split(sep).join("/"));
    }
  }
  return acc;
}

/**
 * 取出一段源码里**值导入**的瑚琏 symbol 名，按出现顺序，重复出现就重复返回。
 *
 * 类型导入不计：`import type { ButtonProps }` 不等于用了 Button，两种写法都要挡 ——
 * `import type { A, B }` 的整体形式，与 `import { type A, B }` 的逐项形式。
 * `as` 别名取原名：注册表认的是导出名，不是消费方起的名字。
 */
export function collectHulianImports(text) {
  const names = [];
  if (!text.includes("@hulianui/")) return names;
  for (const match of text.matchAll(IMPORT_RE)) {
    const typeImport = Boolean(match[1]);
    for (let raw of match[2].split(",")) {
      raw = raw.trim();
      if (!raw) continue;
      let typeOnly = typeImport;
      if (raw.startsWith("type ")) {
        typeOnly = true;
        raw = raw.slice(5).trim();
      }
      if (typeOnly) continue;
      const name = raw.split(/\s+as\s+/)[0].trim();
      if (name) names.push(name);
    }
  }
  return names;
}

/**
 * registry → 查表结构。
 *
 * `symbolToSlug` 先到先得：一个导出名理论上只属于一个组件，真出现重名时以 registry
 * 里在前的为准，而不是静默让后者覆盖 —— 覆盖会让同名冲突彻底看不见。
 */
export function buildSymbolIndex(registry) {
  const ui = (registry?.items ?? []).filter((i) => i.type === "registry:ui");
  const slugMeta = new Map(ui.map((i) => [i.name, i]));
  const symbolToSlug = new Map();
  for (const item of ui) {
    for (const ex of item.meta?.exports ?? []) {
      if (!symbolToSlug.has(ex)) symbolToSlug.set(ex, item.name);
    }
  }
  return { ui, slugMeta, symbolToSlug };
}
