// load-component-doc.ts — server-only: read a component's usage doc
// (packages/ui/src/<slug>/<slug>.md, or src/_mui/<slug>.md) at build time and
// massage it for in-site rendering. Called from the server page; the markdown
// string is passed down to the client ComponentDoc which dogfoods <Markdown/>.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// build cwd is apps/www in this monorepo; fall back to repo-root just in case.
//
// 这两条路径带 `..` 跳出了 apps/www，turbopack 的 NFT（Node File Trace）静态分析收敛不了
// 范围，会保守地把整个 monorepo 标为运行时依赖，构建时报一条
// "Encountered unexpected file in NFT list / the whole project was traced unintentionally"。
//
// **这条警告对本站无功能影响，刻意不治**：NFT 列的是「运行时」要随产物部署的文件，而
// output:"export" 构建完只剩静态 HTML、没有运行时，这份清单我们根本不消费；这些 md 也只在
// 构建期被读一次。两种直接压制手段都实测失败，别再走这两条：
//   - turbopack 官方建议的 `join(/* turbopackIgnore: true */ process.cwd(), …)` 标注 —— 警告照旧
//   - `outputFileTracingRoot: __dirname` 收窄 trace 根 —— 与 turbopack 的 workspace root
//     推断冲突，构建直接失败（"Next.js inferred your workspace root, but it may not be correct"）
// 真要根治只剩「构建期把 md 复制进 apps/www 子目录再读」，为一条无害警告新增 367 个文件的
// 生成流程不划算。
// 对比：blocks/pages 两处的 join(process.cwd(), "app/blocks/_blocks", …) 落在项目子目录内，
// turbopack 能收敛，所以它们不触发这条。
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
