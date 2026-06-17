// load-component-doc.ts — server-only: read a component's usage doc
// (packages/ui/src/<slug>/<slug>.md, or src/_mui/<slug>.md) at build time and
// massage it for in-site rendering. Called from the server page; the markdown
// string is passed down to the client ComponentDoc which dogfoods <Markdown/>.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// build cwd is apps/www in this monorepo; fall back to repo-root just in case.
const BASES = [
  join(process.cwd(), "..", "..", "packages", "ui", "src"),
  join(process.cwd(), "packages", "ui", "src"),
];

function resolveMd(slug: string): string | null {
  for (const base of BASES) {
    for (const p of [join(base, slug, `${slug}.md`), join(base, "_mui", `${slug}.md`)]) {
      if (existsSync(p)) return p;
    }
  }
  return null;
}

export function loadComponentDoc(slug: string): string | null {
  const p = resolveMd(slug);
  if (!p) return null;
  let md = readFileSync(p, "utf8");
  md = md.replace(/^---\n[\s\S]*?\n---\n/, ""); // strip frontmatter
  md = md.trimStart(); // frontmatter block leaves a leading blank line
  md = md.replace(/^#\s+.*\n+/, ""); // drop leading H1 (page header already shows name)
  md = md.replace(/^>\s.*\n+/, ""); // drop the blurb quote (page header already shows description)
  md = md.replace(/\n## 示例\n[\s\S]*?(?=\n## |$)/, ""); // page shows live 用法 examples instead of static 示例
  // rewrite "相关" links (../slug/slug.md | ../_mui/slug.md) → in-site /components/slug
  md = md.replace(/\]\(\.\.\/(?:_mui\/)?([\w-]+?)(?:\/[\w-]+)?\.md\)/g, "](/components/$1)");
  return md.trim();
}

// 「复制 MD」按钮用的完整文档：保留 H1 名称 / 一句话简介 / 导入 / Props / 示例代码，
// 只剥 frontmatter，并把「相关」相对链接改成站内绝对路径。喂给 AI 编程助手用，越完整越好。
export function loadComponentMarkdownForCopy(slug: string): string | null {
  const p = resolveMd(slug);
  if (!p) return null;
  let md = readFileSync(p, "utf8");
  md = md.replace(/^---\n[\s\S]*?\n---\n/, ""); // strip frontmatter only
  md = md.trimStart();
  // 复制内容可能被贴到站外的 AI 助手，相对/站内链接无法解析 → 用绝对 URL
  md = md.replace(
    /\]\(\.\.\/(?:_mui\/)?([\w-]+?)(?:\/[\w-]+)?\.md\)/g,
    "](https://hulianui.haloritual.com/components/$1)",
  );
  // 兜底：任何残留的站内根路径链接（/components/x、/llms.txt 等）转绝对，便于贴给站外 AI 直接抓取
  md = md.replace(/\]\((\/[^)]+)\)/g, "](https://hulianui.haloritual.com$1)");
  // 接入指引页脚：单个组件 md 可能被冷会话单独贴给 AI，提示先安装与全局配置
  const setupFooter =
    "\n\n---\n" +
    "_本文是**单个组件**的用法文档。首次接入瑚琏请先：" +
    "1) 安装 `pnpm add @hulianui/ui @hulianui/tokens`；" +
    "2) 按 [快速开始 /start](https://hulianui.haloritual.com/start) 接入 Tailwind preset 与 `ThemeProvider`。_";
  return md.trim() + setupFooter;
}
