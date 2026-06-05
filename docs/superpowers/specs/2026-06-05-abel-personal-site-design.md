# Abel 个人站设计 spec（2026-06-05）

> 站主：瑚琏 / Abel。定位：**全栈（产品 · UI · UX · 前后端）+ 独立开发者**。
> 核心使命：**用一个真实的个人站驱动 `@hulianui/ui` 组件库成长**——站里缺组件就回库里加，组件有问题就回库里修/丰富，**绝不在站里打 CSS 补丁**。

## 1. 目标与非目标

**目标**
- 一个能对外发出去的个人主页：个人品牌名片 + 作品集求职 + 技术博客沉淀。
- 一个**项目 hub**：可持续挂载我的项目，第一个挂 `hulianui`（组件库本身），后续不断加卡。
- 100% 由 `@hulianui/ui` 组件搭建，作为真实场景反哺库（本轮顺手抽出 2 个新组件）。
- 部署到自有服务器 `60.205.112.50` 的静态托管目录。

**非目标（本轮 YAGNI）**
- 不做 CMS / 后端 / 评论 / 登录 / i18n。
- 不做服务端渲染（纯静态导出）。
- 不把站塞进 `hulian/` monorepo（用户明确要求独立目录、独立 git、独立部署）。

## 2. 身份与内容

| 项 | 内容 | 状态 |
|---|---|---|
| 中文名 / 英文名 | 瑚琏 / Abel | 确定 |
| 角色标签 | 全栈 · 产品 · UI · UX · 前后端 · 独立开发者 | 确定 |
| Slogan | （占位，待补） | **待补** |
| 头像 | （占位，待补真实图） | **待补** |
| 社交链接 | GitHub / 邮箱 / 其它（待补真实值） | **待补** |
| 第一个项目 | hulianui —— 元数据感知的 React 组件库（链文档站 + GitHub） | 确定 |

> 占位项先放可见 placeholder + TODO 注释，上线前由站主替换；不阻塞结构搭建。

## 3. 架构：站在 monorepo 外的双模消费（本 spec 核心）

站点位于 `/Users/zhangzhiwei/Desktop/code/abel-site`（与 `code/hulian` 平级，独立 git）。
它消费 `@hulianui/ui` + `@hulianui/tokens`，二者以 **TS 源码**形式发布（`exports: ./src/index.ts`，靠 `transpilePackages` 编译）。

**双模消费（用户拍板）：**

- **本地开发 = 本地软链**：站 node_modules 里的 `@hulianui/ui` / `@hulianui/tokens` 指向 `../hulian/packages/{ui,tokens}` 的源码软链。改库源码 → 站热更即时可见。这是 dogfood 循环的命脉。
- **构建 / 部署 = 线上发布包**：构建产出部署版本时，从 GitHub Packages 解析已发布的 `@hulianui/ui@x`（真消费者验证），而非本地软链。

**双模切换机制（候选，writing-plans 定稿）：**
- `package.json` 的依赖声明为已发布版本（`@hulianui/ui: ^0.1.x`、`@hulianui/tokens: ^0.1.x`），`.npmrc` 把 `@hulianui` scope 路由到 `https://npm.pkg.github.com` —— 保证 `pnpm install`（部署构建态）拉线上包。
- 本地开发态用 `pnpm` 的全局 link 或 `link:` override 把这两个包临时指向 `../hulian/packages/*`，提供 `pnpm run dev:link` / `pnpm run unlink` 脚本切换；该 link 状态不进 git，避免污染部署构建。
- 最终在 writing-plans 阶段实测 pnpm 行为后定稿（pnpm `link:` 协议要求 link 目标 node_modules 在位；全局 link 在 `pnpm install` 后需重链——脚本封装）。

**防双 React（硬约束）：**
- `@hulianui/ui` 的 peerDeps（`react` / `react-dom` / `@base-ui-components/react` / `motion` / `tailwindcss`）装在站里，版本对齐库（react 19.2、base-ui 1.0.0-rc.0、motion 12、tailwind 4.3）。
- 软链态下，库的常规依赖（mui/recharts/tiptap/vidstack/ogl/dnd-kit…）经软链从 `code/hulian` 的 node_modules 解析；为防 mui 等传递依赖把 react 解析到库副本造成"双 react / invalid hook"，Next 配置里把 `react` / `react-dom` / `react/jsx-runtime` webpack alias 钉到站自己的副本。

**Tailwind 接线：**
- 站 `globals.css`（位于 `code/abel-site/app/globals.css`）：`@import "@hulianui/tokens/tokens.css"` → `@import "@hulianui/tokens/preset.css"` → 软链态 `@source "../../hulian/packages/ui/src/**/*.{ts,tsx}"`（向上两级到 `code/`，再进 `hulian/packages/ui/src`，让 Tailwind 扫到库组件 className）；部署/发布态改指向 `../node_modules/@hulianui/ui/src/**/*`。该 `@source` 行随双模切换，writing-plans 定稿其切换方式。

## 4. 技术栈（镜像 `apps/www`，最大化复用其成熟接线）

- **Next.js 16 + `output:export`**：纯静态 → 完美匹配 `60.205.112.50` 宝塔/静态托管；`images.unoptimized`；`transpilePackages: ["@hulianui/ui","@hulianui/tokens"]`。
- **Tailwind v4** + `@tailwindcss/postcss` + `@hulianui/tokens`（暗色 `data-theme`、发丝边、阴影 token 全继承库）。
- **博客 MDX**：`@next/mdx`，文章为仓库内 `.mdx`，`generateStaticParams` 静态生成。
- **anti-FOUC 主题脚本**：照搬 www 的 inline theme-script（暗色首屏不闪）。
- Node 22、pnpm。

## 5. 信息架构 / 路由

| 路由 | 内容 | 关键组件 |
|---|---|---|
| `/` | **Hero/关于我**（角色标签 + slogan + 头像 + 社交链接）→ **项目作品 hub**（卡片网格，首张 = hulianui，带 live 缩略图 + 链接，结构上可无限加卡）→ 底部 footer | Hero 用库内排版/按钮/头像/链接；项目卡用 Card/Spotlight 等；FitScreen 做 live 缩略图 |
| `/projects/hulianui` | 第一个项目详情：库简介 + 亮点 + 跳文档站/GitHub；可选嵌 **3D 书架** 展示组件分类 | book-3d（可选）、Card、Button、Tag |
| `/blog` | 文章列表（静态） | List/Card、RelativeTime |
| `/blog/[slug]` | 文章详情（MDX，`generateStaticParams`，server 页 + client 子件遵循 output:export 约束） | Prose/Markdown |
| 全局 | `<SiteFooter>` 含 **beian-footer** | beian-footer |

> 项目 hub 的卡片数据为站内 `projects` 数据文件（数组），加项目 = 加一条数据 + 一个 `/projects/[slug]` 详情，结构天然可扩展。

## 6. 本轮顺手抽的 2 个库组件（建在 `code/hulian/packages/ui`，库内测试 + 画廊后，站里消费）

### 6.1 `beian-footer`（ICP 备案 / 公网安备页脚）
- **来源**：旧服务器底部备案条（参考截图）。
- **props**：
  - `icp?: { number: string; href?: string }[]` —— 支持多个备案号（如 `闽ICP备2024073556号-1`、`-2`），默认链 `https://beian.miit.gov.cn/`。
  - `police?: { number: string; href?: string }` —— 公网安备号（如 `闽公网安备35030302900030号`），带**警徽 icon**，默认链 `https://beian.mps.gov.cn/`。
  - `copyright?: ReactNode`、`className?`。
- **结构**：发丝边圆角卡片容器（继承库阴影/发丝边 token）；"ICP备案" label + 各备案号链接；换行后警徽 icon + 公网安备链接。语义 token 配色，暗色自适应。
- **警徽**：内置 SVG（或 `_icons` 复用），不外链图片资源（门禁禁远程资源）。
- **分类**：`layout` / `navigation`（footer 族）。manifest + 画廊 + 单测（渲染号码、链接 href、多 ICP）。

### 6.2 `book-3d`（CSS 3D 立体书）
- **来源**：旧服务器"动画书籍 / 使用 CSS 3D 变换"书架（参考截图）。
- **props**：
  - `cover?: string`（封面图 url）或渐变；`coverColor?` / 渐变方案。
  - `title: ReactNode`、`subtitle?`（如 "CSS 转换" / "JS FUNCTION"）。
  - `spineColor?`、`thickness?`（书脊厚度页数感）。
  - `ribbon?: 'NEW' | string`（角标缎带）、`ribbonTone?`。
  - `href?`、`onClick?`。
- **效果**：`perspective` + `rotateY` 透视，左侧书脊翻页层；hover 翻开（`prefers-reduced-motion` 降级为静态）。纯 CSS transform，GPU 合成（参考 [[animated-background-position-under-blur-jank-use-transform]] 的"只动 transform"教训）。
- **分类**：`data-display` / `collection`。manifest + 画廊 + 单测（渲染 title/ribbon、href 渲染为链接）。

## 7. 部署

- `pnpm build` → `out/`（静态）。
- `deploy.sh`：从 `/Users/zhangzhiwei/Desktop/60.205.112.50`（IP / user=root / password）读凭据，`rsync -avz --delete out/ root@60.205.112.50:/www/wwwroot/60.205.112.50/`。
- 凭据文件不进站 git；脚本读绝对路径。`sshpass` 或交互输入密码（部署态由站主执行 `! deploy.sh`）。
- 参考 skill `nextjs-standalone-baota-rsync-deploy`。

## 8. 验收

- 本地 `pnpm dev` 起站，软链态改 `code/hulian/packages/ui` 源码 → 站热更可见（dogfood 循环自证）。
- 真实浏览器（非 headless 空白陷阱，见 [[www-msw-gate-blanks-headless-screenshots]]）逐页 0 console error 截图自证：`/`、`/projects/hulianui`、`/blog`、一篇 `/blog/[slug]`；暗色一版。
- `beian-footer` / `book-3d` 库内单测绿 + 画廊页 0 error。
- 部署态 `pnpm build` 用线上发布包成功产出 `out/`。

## 9. 待补素材（不阻塞结构，上线前替换）

- slogan 一句话、真实头像图、GitHub 用户名、邮箱、其它社交链接。
- hulianui 项目详情文案 + 文档站/GitHub 真实链接。
- 首批博客文章（先放 1 篇占位 MDX）。

## 10. 开放项（writing-plans 定稿）

- 双模 link/published 的精确 pnpm 机制（实测 `link:` vs 全局 link 在 `install` 后的存活性）。
- 站文件夹名暂定 `code/abel-site`（站主可改）。
- 项目 hub 卡片组件最终选型（Card vs MagicCard vs Spotlight，建站时按真实观感定）。
