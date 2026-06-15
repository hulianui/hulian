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
  md = md.replace(/^#\s+.*\n+/, ""); // drop leading H1 (page header already shows name)
  // rewrite "相关" links (../slug/slug.md | ../_mui/slug.md) → in-site /components/slug
  md = md.replace(/\]\(\.\.\/(?:_mui\/)?([\w-]+?)(?:\/[\w-]+)?\.md\)/g, "](/components/$1)");
  return md.trim();
}
