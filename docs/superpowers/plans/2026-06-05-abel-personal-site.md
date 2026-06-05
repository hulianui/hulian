# Abel 个人站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `code/abel-site` 建一个 100% 由 `@hulianui/ui` 搭建、可持续挂项目的个人站（首挂 hulianui），并顺手把 `beian-footer`、`book-3d` 两个组件抽进库，部署到 60.205.112.50。

**Architecture:** 站独立于 `code/hulian` monorepo（独立 git/部署）。双模消费 `@hulianui/ui`：本地软链 `../hulian/packages/{ui,tokens}` 即时 dogfood，构建走 GitHub Packages 发布包。Next.js 16 `output:export` 纯静态，镜像 `apps/www` 的 Tailwind v4 + token 接线。

**Tech Stack:** Next.js 16, React 19.2, Tailwind v4, @hulianui/ui(源码 transpile), @hulianui/tokens, @next/mdx, pnpm, Node 22。

---

## 库组件添加工作流（参照，A/B 任务复用）

每个组件四件套 + 4 处接线：
1. `packages/ui/src/<name>/` ：`index.ts` / `<name>.tsx` / `<name>.types.ts` / `<name>.test.tsx` / `<name>.showcase.tsx`
2. `packages/ui/src/index.ts` ：`export * from "./<name>";`
3. `packages/ui/src/showcase.ts` ：`export { <name>Showcase } from "./<name>/<name>.showcase";`
4. `apps/www/lib/manifest.ts` ：加 `ComponentMeta`（slug/name/description/category/group/status:"new"）
5. `apps/www/lib/registry.tsx` ：import showcase + 加进 slug→showcase map
- 测试：`cd packages/ui && pnpm test <name>`（vitest）

---

## Task A: `beian-footer` 组件（ICP/公网安备页脚）

**Files:**
- Create: `packages/ui/src/beian-footer/{index.ts,beian-footer.tsx,beian-footer.types.ts,beian-footer.test.tsx,beian-footer.showcase.tsx}`
- Modify: `packages/ui/src/_icons/index.tsx`（加 `PoliceBadge` 盾形警徽 line icon）
- Modify: `packages/ui/src/index.ts`、`packages/ui/src/showcase.ts`
- Modify: `apps/www/lib/manifest.ts`、`apps/www/lib/registry.tsx`

- [ ] **A1: types**

```ts
// beian-footer.types.ts
import type { ReactNode } from "react";
export interface IcpRecord { number: string; href?: string }
export interface PoliceRecord { number: string; href?: string }
export interface BeianFooterProps {
  /** ICP 备案号，可多个（如 闽ICP备2024073556号-1 / -2）。默认链 beian.miit.gov.cn */
  icp?: IcpRecord[];
  /** 公网安备号，带警徽。默认链 beian.mps.gov.cn */
  police?: PoliceRecord;
  /** 备案前缀 label，默认 "ICP备案" */
  icpLabel?: ReactNode;
  copyright?: ReactNode;
  className?: string;
}
```

- [ ] **A2: 警徽 icon** — 在 `_icons/index.tsx` 末尾加（line-icon 风格，currentColor，与库一致；非彩色像素复刻，走 hulianui 线性风）：

```tsx
export const PoliceBadge = createIcon("police-badge", [
  ["path", { d: "M12 2 4 5v6c0 5 3.4 8.3 8 10 4.6-1.7 8-5 8-10V5l-8-3Z", key: "shield" }],
  ["path", { d: "M9 12h6M12 9v6", key: "cross" }],
]);
```

- [ ] **A3: 失败测试 `beian-footer.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BeianFooter } from "./beian-footer";

describe("BeianFooter", () => {
  it("渲染多个 ICP 备案号且链向 miit", () => {
    const { getByText } = render(
      <BeianFooter icp={[{ number: "闽ICP备2024073556号-1" }, { number: "闽ICP备2024073556号-2" }]} />,
    );
    const a = getByText("闽ICP备2024073556号-1").closest("a")!;
    expect(a.getAttribute("href")).toContain("beian.miit.gov.cn");
    expect(getByText("闽ICP备2024073556号-2")).toBeTruthy();
  });
  it("公网安备链向 mps 且带 target=_blank", () => {
    const { getByText } = render(
      <BeianFooter police={{ number: "闽公网安备35030302900030号" }} />,
    );
    const a = getByText(/闽公网安备/).closest("a")!;
    expect(a.getAttribute("href")).toContain("beian.mps.gov.cn");
    expect(a.getAttribute("target")).toBe("_blank");
  });
  it("自定义 href 覆盖默认", () => {
    const { getByText } = render(<BeianFooter icp={[{ number: "x", href: "https://e.com" }]} />);
    expect(getByText("x").closest("a")!.getAttribute("href")).toBe("https://e.com");
  });
});
```

- [ ] **A4: 实现 `beian-footer.tsx`**（发丝边卡片容器 + 语义 token；外链统一 `target=_blank rel=noreferrer`）：

```tsx
import { cn } from "../lib/cn";
import { PoliceBadge } from "../_icons";
import type { BeianFooterProps } from "./beian-footer.types";

const MIIT = "https://beian.miit.gov.cn/";
const MPS = "https://beian.mps.gov.cn/";

export function BeianFooter({ icp = [], police, icpLabel = "ICP备案", copyright, className }: BeianFooterProps) {
  return (
    <div className={cn("rounded-2xl border border-hairline bg-muted/30 px-6 py-5 text-center text-sm text-muted shadow-sm", className)}>
      {icp.length > 0 && (
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>{icpLabel}</span>
          {icp.map((r) => (
            <a key={r.number} href={r.href ?? MIIT} target="_blank" rel="noreferrer"
               className="font-medium text-foreground transition-colors hover:text-primary">{r.number}</a>
          ))}
        </p>
      )}
      {police && (
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
          <a href={police.href ?? MPS} target="_blank" rel="noreferrer"
             className="flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-primary">
            <PoliceBadge className="size-4 text-primary" aria-hidden />
            {police.number}
          </a>
        </p>
      )}
      {copyright && <p className="mt-2 text-muted">{copyright}</p>}
    </div>
  );
}
```

> 注：实现前 grep `packages/ui/src/lib/` 确认 `cn` 导出路径；确认 token 类名（`text-muted`/`border-hairline`/`bg-muted`）在 preset 中存在（参照 status-dot/tag 用法），不存在则用同义已有类。

- [ ] **A5: index.ts + 接线 4 处** — index 导出 `BeianFooter`+types；showcase.ts 加 `beianFooterShowcase`；manifest 加 `{ slug:"beian-footer", name:"BeianFooter", category:"navigation", group:"<现有 footer/nav group>", status:"new", description:"..." }`（建 manifest 时 grep navigation 的 groups 选准）；registry 加映射。

- [ ] **A6: showcase** — `controls` 简单；`states`：单 ICP / 多 ICP(-1,-2) / ICP+公网安备 / 带 copyright。`renderWithProps`/`toCode` 照 tag.showcase 范式。

- [ ] **A7: 测试 + 提交** — `cd packages/ui && pnpm test beian-footer`（绿）；`git add` 全部 → commit `feat(ui): beian-footer 备案页脚组件（多 ICP + 公网安备警徽）`

---

## Task B: `book-3d` 组件（CSS 3D 立体书）

**Files:**
- Create: `packages/ui/src/book-3d/{index.ts,book-3d.tsx,book-3d.types.ts,book-3d.test.tsx,book-3d.showcase.tsx}`
- Modify: `packages/ui/src/index.ts`、`showcase.ts`、`apps/www/lib/manifest.ts`、`registry.tsx`

- [ ] **B1: types**

```ts
// book-3d.types.ts
import type { ReactNode } from "react";
export interface Book3DProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** 封面图 url；无则用渐变 coverColor */
  cover?: string;
  /** 渐变起止或纯色（CSS color）；默认品牌渐变 */
  coverColor?: { from: string; to: string };
  /** 书脊/页厚颜色 */
  spineColor?: string;
  /** 角标缎带文字，如 "NEW" / "N°1" */
  ribbon?: string;
  ribbonTone?: "brand" | "danger" | "success";
  href?: string;
  onClick?: () => void;
  className?: string;
}
```

- [ ] **B2: 失败测试**（纯 CSS 动画不测视觉，测结构/语义）：

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Book3D } from "./book-3d";

describe("Book3D", () => {
  it("渲染标题与副标题", () => {
    const { getByText } = render(<Book3D title="CSS 转换" subtitle="By 瑚琏" />);
    expect(getByText("CSS 转换")).toBeTruthy();
    expect(getByText("By 瑚琏")).toBeTruthy();
  });
  it("ribbon 渲染缎带文字", () => {
    const { getByText } = render(<Book3D title="x" ribbon="NEW" />);
    expect(getByText("NEW")).toBeTruthy();
  });
  it("有 href 渲染为链接", () => {
    const { container } = render(<Book3D title="x" href="https://e.com" />);
    expect(container.querySelector("a")!.getAttribute("href")).toBe("https://e.com");
  });
  it("无 href 有 onClick 渲染 button 并触发", () => {
    const fn = vi.fn();
    const { container } = render(<Book3D title="x" onClick={fn} />);
    fireEvent.click(container.querySelector("button")!);
    expect(fn).toHaveBeenCalled();
  });
});
```

- [ ] **B3: 实现 `book-3d.tsx`** — `perspective` 容器 + `transform-style:preserve-3d` 书体 + `rotateY` hover 翻开；左侧书脊层；纯 transform（GPU 合成，避开 background-position 卡顿教训）；`prefers-reduced-motion` 降级；href→`<a>` / onClick→`<button>` / 否则 `<div>`。封面 cover 图用 `<img>`（库内 img 约定）或渐变背景。具体几何在实现时按截图调（透视书脊翻页 + 角标缎带 45°）。样式走内联 style（动态色）+ Tailwind（结构）。

- [ ] **B4: index + 接线 4 处** — manifest `{ slug:"book-3d", name:"Book3D", category:"data-display", group:"<collection 现有 group>", tags:["animated"], status:"new", description:"CSS 3D 透视立体书 · 书脊翻页 + 渐变/图封面 + 角标缎带 + hover 翻开(纯 transform·reduced-motion 降级)" }`

- [ ] **B5: showcase** — states：渐变封面 / 图片封面 / NEW 缎带 / N°1 缎带 / 书架网格（多本 flex）。

- [ ] **B6: 测试 + 提交** — `cd packages/ui && pnpm test book-3d`（绿）；commit `feat(ui): book-3d CSS 3D 立体书组件`

---

## Task C: 脚手架 `code/abel-site`（双模消费 + token 接线）

**Files (create):** `code/abel-site/` 下 `package.json` `next.config.mjs` `postcss.config.mjs` `tsconfig.json` `.npmrc` `.gitignore` `app/layout.tsx` `app/globals.css` `app/theme-script.tsx` `app/page.tsx`、`scripts/link-local.sh` `scripts/unlink-local.sh`

- [ ] **C1: 初始化目录 + git** — `mkdir -p /Users/zhangzhiwei/Desktop/code/abel-site && cd $_ && git init`
- [ ] **C2: package.json**（发布包为默认依赖；peer 显式装齐对齐库版本）：

```jsonc
{
  "name": "abel-site", "private": true, "type": "module",
  "scripts": {
    "dev": "next dev -p 5520",
    "build": "next build",
    "dev:link": "bash scripts/link-local.sh && next dev -p 5520",
    "link:local": "bash scripts/link-local.sh",
    "unlink:local": "bash scripts/unlink-local.sh",
    "deploy": "next build && bash scripts/deploy.sh"
  },
  "dependencies": {
    "@hulianui/ui": "^0.1.2", "@hulianui/tokens": "^0.1.1",
    "@base-ui-components/react": "1.0.0-rc.0", "motion": "^12.40.0",
    "next": "^16.2.0", "react": "^19.2.0", "react-dom": "^19.2.0", "lucide-react": "^1.0.0"
  },
  "devDependencies": {
    "@next/mdx": "^16.2.0", "@mdx-js/react": "^3.1.0",
    "@tailwindcss/postcss": "^4.3.0", "tailwindcss": "^4.3.0",
    "@types/node": "^22.0.0", "@types/react": "^19.2.0", "@types/react-dom": "^19.2.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **C3: .npmrc**（scope 路由 GitHub Packages，构建态拉发布包）：
```
@hulianui:registry=https://npm.pkg.github.com
auto-install-peers=true
```
- [ ] **C4: next.config.mjs**（output export + transpile + 防双 react alias + mdx）：

```js
import createMDX from "@next/mdx";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const withMDX = createMDX();
/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  images: { unoptimized: true },
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@hulianui/ui", "@hulianui/tokens"],
  webpack: (cfg) => {
    // 软链态防双 React：把 react 系列钉到站自己的副本
    const r = (m) => path.resolve(__dirname, "node_modules", m);
    cfg.resolve.alias = { ...cfg.resolve.alias,
      react: r("react"), "react-dom": r("react-dom"), "react/jsx-runtime": r("react/jsx-runtime") };
    return cfg;
  },
};
export default withMDX(config);
```

- [ ] **C5: globals.css**（token 接线；@source 软链态指向库源码）：

```css
@import "@hulianui/tokens/tokens.css";
@import "@hulianui/tokens/preset.css";
/* 软链开发态：扫库组件源码类名。发布态另切 ../node_modules/@hulianui/ui/src（见 README 切换） */
@source "../../hulian/packages/ui/src/**/*.{ts,tsx}";
html, body { background: var(--color-bg); color: var(--color-foreground); }
body { font-family: ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; -webkit-font-smoothing: antialiased; }
```

- [ ] **C6: layout.tsx + theme-script.tsx** — 照搬 `apps/www/app/layout.tsx` + `theme-script.tsx`（anti-FOUC 暗色；`<html suppressHydrationWarning>`；import globals.css）。
- [ ] **C7: link-local.sh / unlink-local.sh** — 软链/还原 `@hulianui/ui`、`@hulianui/tokens` 指向 `../hulian/packages/*`：

```bash
# link-local.sh
set -euo pipefail
SITE="$(cd "$(dirname "$0")/.." && pwd)"; LIB="$SITE/../hulian/packages"
for p in ui tokens; do
  rm -rf "$SITE/node_modules/@hulianui/$p"
  ln -s "$LIB/$p" "$SITE/node_modules/@hulianui/$p"
done
echo "linked @hulianui/{ui,tokens} -> ../hulian/packages"
```
（unlink：`rm` 软链后 `pnpm install --filter` 还原发布包。实测 pnpm install 后软链会被覆盖 → dev 前跑 link:local。）

- [ ] **C8: 安装 + 软链 + 冒烟** — `cd code/abel-site && pnpm install`，`pnpm link:local`，临时 `app/page.tsx` 渲一个 `<Button>` 验证库可用：`pnpm dev` 起 5520，curl SSR HTML 含按钮文本。提交脚手架。

> **C 风险点（执行时实测定稿）：** pnpm 软链后库的传递依赖（mui/recharts…）从 `code/hulian/node_modules` 解析是否 OK；双 react alias 是否生效（页面用一个带 hook 的库组件如 Tabs 验证无 "invalid hook call"）。若软链方案在 transpile 下解析失败，回退：站 `package.json` 用 `"@hulianui/ui": "link:../hulian/packages/ui"`（pnpm link 协议）并 `pnpm install`，发布态用 git-stash 切回版本号。

---

## Task D: 站点页面（Hero/关于我 + 项目 hub + projects/hulianui + blog + footer）

**Files (create under `code/abel-site`):**
- `app/page.tsx`（首页：Hero + 项目 hub + footer）
- `app/_components/site-footer.tsx`（含 `<BeianFooter>`，真实备案号）
- `app/_components/hero.tsx`、`app/_components/project-card.tsx`
- `app/_data/profile.ts`（身份/slogan/社交，占位+TODO）、`app/_data/projects.ts`（项目数组，首条 hulianui）
- `app/projects/[slug]/page.tsx`（server + generateStaticParams）、`app/projects/[slug]/project-detail.tsx`（client 子件）
- `app/blog/page.tsx`、`app/blog/[slug]/page.tsx`、`content/blog/hello-hulianui.mdx`（占位首篇）

- [ ] **D1: profile.ts / projects.ts 数据** — profile：name 瑚琏/Abel、roles ["产品","UI","UX","前后端","独立开发者"]、slogan(占位)、avatar(占位)、socials[{label,href} 占位 GitHub/邮箱]。projects：`[{ slug:"hulianui", name:"hulianui", tagline:"元数据感知的 React 组件库", links:{docs,github}(占位), highlights:[...] }]`，全部用 100% 库组件渲染。
- [ ] **D2: site-footer.tsx** — 真实备案：`<BeianFooter icp={[{number:"闽ICP备2024073556号-1"},{number:"闽ICP备2024073556号-2"}]} police={{number:"闽公网安备35030302900030号"}} copyright="© 2026 瑚琏 · Abel" />`
- [ ] **D3: hero.tsx + project-card.tsx + page.tsx** — 全用 `@hulianui/ui`（Heading/Text/Button/Avatar/Card/Tag/Link/Stack/Grid 等）。**缺组件/缺能力 → 回库加，不在站打 CSS 补丁**（记录到 spec §10）。项目卡 grid 结构可无限加卡。
- [ ] **D4: projects/[slug]** — `generateStaticParams` 返回 projects slug；server page 读数据传 client 子件（output:export 约束，见 skill nextjs-output-export-dynamic-route）。hulianui 详情可嵌 `<Book3D>` 书架展示分类。
- [ ] **D5: blog** — `@next/mdx`；`/blog` 列表读 `content/blog/*.mdx` frontmatter；`/blog/[slug]` `generateStaticParams`。占位首篇 `hello-hulianui.mdx`。文章正文套库 `Prose`/`Markdown`。
- [ ] **D6: 提交** — commit `feat: 个人站首页/项目 hub/博客/footer（100% @hulianui/ui）`

---

## Task E: deploy.sh

**Files:** `code/abel-site/scripts/deploy.sh`

- [ ] **E1: 写 deploy.sh** — 读 `/Users/zhangzhiwei/Desktop/60.205.112.50`（line1=IP,2=user,3=pass）→ `rsync -avz --delete ./out/ <user>@<ip>:/www/wwwroot/60.205.112.50/`。用 `sshpass`（无则提示 `brew install hudochenkov/sshpass/sshpass` 或交互输密）。脚本含 `set -euo pipefail` + 部署前断言 `out/index.html` 存在。
- [ ] **E2: 文档** — README 写明：本地开发 `pnpm dev:link`；部署 `pnpm deploy`（构建用线上发布包前先 `unlink:local`）。**不实际执行 rsync**（由站主 `! pnpm deploy` 触发），仅交付脚本 + 自检 build 成功。

---

## Task F: 验证 + 收尾

- [ ] **F1: 库测试全绿** — `cd packages/ui && pnpm test`（含新 beian-footer/book-3d）。
- [ ] **F2: www 画廊** — 起 www 看两个新组件 doc 页 0 console error（真实浏览器，避 headless 空白陷阱）。
- [ ] **F3: 站点真实浏览器自证** — `code/abel-site` `pnpm dev:link` 起站，CDP/真实浏览器逐页 0 error 截图：`/`、`/projects/hulianui`、`/blog`、一篇 `/blog/[slug]`，暗色一版。dogfood 循环自证（改库源码 → 站热更可见）。
- [ ] **F4: 部署构建态** — `unlink:local` 后 `pnpm build` 用发布包成功产出 `out/`（验证双模 published 分支）。
- [ ] **F5: 提交所有 + 通知** — hulian 仓库提交组件/manifest/spec/plan；abel-site 仓库提交全站；PushNotification 通知站主完成。

---

## Self-Review

- **Spec 覆盖**：§3 双模消费→C；§4 栈→C；§5 IA→D；§6.1 beian-footer→A；§6.2 book-3d→B；§7 部署→E；§8 验收→F。✓ 全覆盖。
- **占位**：站内身份/slogan/头像/社交/链接为**真实素材占位**（spec §9 明确，上线前替换），非计划占位；备案号为真实值（截图）。
- **类型一致**：BeianFooterProps/Book3DProps 在 types 任务定义，后续任务引用一致。
- **风险**：双模 pnpm 软链机制为最大未知（C7/C 风险点），执行时实测定稿，含回退方案。
