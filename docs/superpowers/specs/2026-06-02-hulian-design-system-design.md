# 瑚琏 Hulian 设计系统 — 设计文档（Design Spec）

- **日期**: 2026-06-02
- **状态**: 已与用户确认整体设计，进入实施计划阶段
- **本 spec 覆盖范围**: **P0（脊柱）+ P1（展示基建）**。P2 之后各阶段后续单独开 spec。

---

## 0. 名字与立意

**瑚琏 / Hulian**，npm 包 scope `@hulian/*`。

出处《论语·公冶长》：子贡问"赐也何如"，孔子答"汝，器也"，问"何器也"，曰"**瑚琏也**"。瑚琏是宗庙盛黍稷的**玉器**，至贵至美又确有大用。"瑚琏之器"= 既有**颜值**（美玉）又**好用**（重器）—— 正是本项目信条："颜值审美 + 好用 = 软件商业化第一生产力"。组件本身即"器"。

---

## 1. 项目本质（一句话）

一套**可发布的 React 设计系统**（能 `import` 的 npm 组件库），配一个**完整 showcase / 文档站**（真实样例数据 / 全状态 / MSW API mock / 可调参 playground）。**web 先行，Tauri 桌面壳后期加。** 全局明亮/暗黑为硬需求。

设计信条：人不该油头满面地对着丑/烂软件干活。颜值 + 好用是第一生产力。

---

## 2. 技术地基（基于扫描用户 code/ 下真实 React 项目得出）

扫描 8 个用户在用的 React 项目，技术指纹：Tailwind v4（7/8）、shadcn/ui（5）、**Base UI `@base-ui/react`（4-5，正从 Radix 迁向它）**、HeroUI v3（4，生产用，观感参考）、Lucide React（6，图标永远用它）、motion / Framer Motion fork（5，动效）、几乎无 CSS-in-JS。

**瑚琏地基 = 把用户既有审美与骨架揉成一套：**

| 层 | 选型 | 理由 |
|----|------|------|
| Headless 行为 / a11y | **Base UI（`@base-ui-components/react`）为主 + Radix 补缺** | 用户实测在迁向 Base UI；Radix/MUI 团队出品，2026 更活跃未来 |
| 样式 | **Tailwind v4 + CSS 变量 token** | 用户 7/8 项目在用；明暗切换走变量值切换，0 闪烁、可运行时换肤 |
| 变体管理 | **class-variance-authority (CVA)** | shadcn 同款，用户已习惯 |
| 图标 | **Lucide React** | 用户 6 项目固定用它 |
| 动效 | **motion**（Framer Motion fork） | 用户 5 项目在用 |
| 观感参考 | HeroUI v3 的视觉气质 | 用户生产项目偏好 |

口诀：**审美取 HeroUI v3 的观感，骨架取 Base UI 的 headless，手感取 shadcn 的 CVA 组织方式。**

---

## 3. 仓库结构（pnpm + Turborepo monorepo）

```
hulian/
├── packages/
│   ├── tokens/      @hulian/tokens   设计 token（CSS 变量 + Tailwind v4 preset）—— 明暗主题唯一源头
│   ├── ui/          @hulian/ui       组件库本体（Base UI + Tailwind 皮肤）—— 可发 npm、能 import
│   └── mocks/       @hulian/mocks    MSW handlers + faker 样例数据工厂 —— 喂给 showcase
├── apps/
│   ├── www/         Next.js + MDX    showcase / 文档站（web 先行，端口 5512）
│   └── desktop/     Tauri 壳         包 www（P4 阶段，先占位不实现，devUrl 5514）
└── 配置层           tsconfig / eslint / changesets / tailwind preset 共享
```

**为什么 monorepo**：组件库、文档站、桌面壳共用同一份组件源码，monorepo 是唯一不重复造的方式（shadcn / Radix / Base UI 标准结构）。

---

## 4. 端口规范（专属段，避开本地热门口）

用户本地 app 项目极多，热门口（3000/5173/8080…）易撞。瑚琏专属端口段 **5512–5519**：

| 进程 | 端口 | 备注 |
|------|------|------|
| `apps/www` dev | **5512** | `next dev -p 5512` 写死进 package.json，不靠默认 |
| MSW | 不占端口 | 浏览器内 Service Worker ✅ |
| 预留（Storybook / 二级服务） | 5513 | 占位 |
| `apps/desktop` Tauri devUrl | 5514 | P4 阶段 |

记忆钩子：《论语·公冶长**第五**》"瑚琏也" → 5512。

---

## 5. 主题层（硬需求"全局明暗"的核心）

唯一真相源 `@hulian/tokens`，组件永不写死颜色，只引用语义 token。

**两层 token：**
- **原始层 primitives**：`--blue-500: oklch(...)`、`--gray-900`…… 用 **OKLCH** 色彩空间（明暗下感知亮度更均匀，2026 主流）。
- **语义层 semantic**：`--color-surface` / `--color-foreground` / `--color-border` / `--color-primary` / `--color-danger`…… 组件**只**消费这一层。

**明暗 = 只换语义层变量值，原始色板不动：**
```css
:root             { --color-surface: var(--gray-50);  --color-foreground: var(--gray-900); }
[data-theme=dark] { --color-surface: var(--gray-950); --color-foreground: var(--gray-50);  }
```
切主题 = 改 `<html data-theme>` 一个属性 → 变量级联重算 → **0 闪烁、可运行时换肤、组件无需 re-render**。

**Tailwind v4 桥接**：v4 用 `@theme` 把语义 token 映射成工具类（`bg-surface` / `text-foreground`），并把 `dark:` variant 绑到 `[data-theme=dark]`。
> ⚠️ 已知坑：Tailwind v4 + shadcn dark variant 桥接到 data-theme，实施时套用 skill `tailwind-v4-shadcn-dark-variant-data-theme-bridge` 规避。

**ThemeProvider**（在 `@hulian/ui`）：① 持久化 localStorage；② 默认跟随系统 `prefers-color-scheme`；③ SSR 注入 inline script 在 hydration 前定主题，**消灭首屏白闪**。

**留余量不过度**：token 结构支持未来加第三套主题（品牌色变体），结构不用改；但**现在只做 light/dark 两套**（YAGNI）。

---

## 6. 组件层（"优化后"的质量保证）

每个组件 = 自包含目录，强制四件套，缺一不算完成：

```
packages/ui/src/button/
├── button.tsx          # Base UI 行为 + Tailwind 皮肤，CVA 管变体(variant/size/tone)
├── button.types.ts     # 导出的 props 类型(TS 智能提示)
├── button.stories.tsx  # showcase 规格:变体矩阵 + 全状态 + 样例数据
└── index.ts            # 桶导出
```

**"优化后" = 三条硬规范：**
1. **只消费语义 token**，禁止写死颜色/间距裸值（明暗自动适配的根本）。
2. **a11y 不可绕过** —— 焦点环、键盘导航、ARIA 全靠 Base UI 兜底，不手写。
3. **变体收敛** —— 所有外观差异走 CVA 的 `variant/size/tone`，不靠散落 className 覆盖。

---

## 7. Showcase 展示层（用户四种 mock 全选，逐一落地）

`apps/www`（Next.js + MDX），每个组件页由统一展示组件渲染：

| mock 类型 | 实现 |
|----------|------|
| ① 真实样例数据 | `@hulian/mocks` 用 **faker** 造数据工厂（人名/头像/表格行/图表序列），一眼看"填满后"真实观感 |
| ② 全状态展示 | `stories` 声明状态矩阵，`<StatesGallery>` 自动铺开 default/hover/focus/disabled/loading/error/empty/超长 |
| ③ API mock | `@hulian/mocks` 出 **MSW handlers**，浏览器内 Service Worker（不占端口），异步加载/分页/表单提交站内真跑 |
| ④ 可调参 playground | `<Playground>` 读组件 args schema → controls 面板，实时改 props/文案/尺寸看效果 + 同步显示生成代码（一键复制） |

**三个核心展示组件（全站复用）：**
- `<ComponentPreview>`：实时 demo + 代码 Tab（随当前主题明暗）
- `<StatesGallery>`：全状态铺陈
- `<Playground>`：controls + live code

顶部全局明暗开关贯穿整站，所有 demo 同步换肤。

---

## 8. 分阶段落地

| 阶段 | 内容 | 产出标志 |
|------|------|---------|
| **P0 脊柱** | monorepo + `@hulian/tokens` + 主题层 + ThemeProvider + **Button 一个组件**端到端 + `www` 最小站点 + 明暗开关（5512） | 切主题 0 闪烁、Button 站内跑起来 |
| **P1 展示基建** | `<ComponentPreview>` / `<StatesGallery>` / `<Playground>` + `@hulian/mocks`（faker + MSW） + MDX 体系 | Button 页四种 mock 全亮 |
| **P2 组件扩量** | 批量补 Input/Dialog/Switch/Select/DataTable… 套 P0/P1 模具 | 覆盖面铺开 |
| **P3 发布** | changesets + npm 发包 + 部署 www | `npm i @hulian/ui` 可用、站上线 |
| **P4 桌面壳** | Tauri 包 www（5514） | dmg 可装 |

**本 spec 覆盖 P0 + P1**（架构定型的最高杠杆部分）。P2 起各自再开 spec。

---

## 9. 成功标准（P0 + P1 验收）

1. `pnpm dev` 在 **5512** 起 `www`，不与本地其它项目撞口。
2. 站点右上角明暗开关：切换 **0 闪烁**，首屏无白闪，刷新后保持上次选择，默认跟随系统。
3. `@hulian/ui` 的 Button 组件：CVA 变体（variant/size/tone）齐全，只消费语义 token，键盘可达、有焦点环。
4. Button 文档页四种 mock 全亮：真实样例数据 / 全状态 gallery / 一个 MSW 异步 demo / Playground 可调参且显示生成代码。
5. `@hulian/ui` 可被外部 `import`（包导出正确，类型提示可用）。

---

## 10. 明确不做（YAGNI 边界）

- 不做第三套主题（结构留口，现在只 light/dark）。
- 不做 shadcn 式复制粘贴 registry（走 npm 包直发；registry 留作未来选项）。
- P0/P1 不扩组件量（只打通 Button 一个标杆，证明全链路）。
- P0/P1 不做 Tauri 桌面壳（仅占位目录）。
- 不引入 CSS-in-JS。
