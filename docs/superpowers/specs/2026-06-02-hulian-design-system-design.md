# 瑚琏 Hulian 设计系统 — 设计文档（Design Spec）

- **日期**: 2026-06-02
- **状态**: 已与用户确认整体设计，进入实施计划阶段
- **本 spec 覆盖范围**: **P0（脊柱）+ P1（展示基建）**。P2 之后各阶段后续单独开 spec。

---

## 0. 名字与立意

**瑚琏 / Hulian**，npm 包 scope `@hulianui/*`。

出处《论语·公冶长》：子贡问"赐也何如"，孔子答"汝，器也"，问"何器也"，曰"**瑚琏也**"。瑚琏是宗庙盛黍稷的**玉器**，至贵至美又确有大用。"瑚琏之器"= 既有**颜值**（美玉）又**好用**（重器）—— 正是本项目信条："颜值审美 + 好用 = 软件商业化第一生产力"。组件本身即"器"。

---

## 1. 项目本质（一句话）

一套**可发布的 React 设计系统**（能 `import` 的 npm 组件库），配一个**完整 showcase / 文档站**（真实样例数据 / 全状态 / MSW API mock / 可调参 playground）。**web 先行，Tauri 桌面壳后期加。** 全局明亮/暗黑为硬需求。

设计信条：人不该油头满面地对着丑/烂软件干活。颜值 + 好用是第一生产力。

---

## 2. 技术地基（基于扫描用户 code/ 下真实 React 项目得出）

扫描 8 个用户在用的 React 项目，技术指纹：Tailwind v4（7/8）、shadcn/ui（5）、**Base UI `@base-ui-components/react`（4-5，正从 Radix 迁向它）**、HeroUI v3（4，生产用，观感参考）、Lucide React（6，图标永远用它）、motion / Framer Motion fork（5，动效）、几乎无 CSS-in-JS。

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

**混库红线（避免两套 headless 打架）**：同一交互族（尤其所有 overlay：Dialog / Popover / Tooltip / Menu）**只用一套库**，不在单个组件内混用两套 Portal / FocusScope。Radix 仅在 Base UI 确实缺某 primitive 时，作为**整组件级** fallback 引入，**禁止行级混用**。Base UI 与 Radix 各自的 Portal 容器、z-index 层叠、focus 管理不可在一棵子树里交叉。

---

## 3. 仓库结构（pnpm + Turborepo monorepo）

```
hulian/
├── packages/
│   ├── tokens/      @hulianui/tokens   设计 token（CSS 变量 + Tailwind v4 preset）—— 明暗主题唯一源头
│   ├── ui/          @hulianui/ui       组件库本体（Base UI + Tailwind 皮肤）—— 可发 npm、能 import
│   └── mocks/       @hulianui/mocks    MSW handlers + faker 样例数据工厂 —— 喂给 showcase
├── apps/
│   ├── www/         Next.js + MDX    showcase / 文档站（web 先行，端口 5512）
│   └── desktop/     Tauri 壳         包 www（P4 阶段，先占位不实现，devUrl 5514）
└── 配置层           tsconfig / eslint / changesets / tailwind preset 共享
```

**为什么 monorepo**：组件库、文档站、桌面壳共用同一份组件源码，monorepo 是唯一不重复造的方式（shadcn / Radix / Base UI 标准结构）。

---

## 3A. 分发 / 消费模型（外部 import 怎么拿到样式）—— 决定 tokens preset 与 peerDeps 形态

> 这是发布一个 Tailwind 组件库**最难、且最早影响 token/preset 写法**的决定，不是 P3 才想的事。P0 写 tokens preset 的产出形态、写各包的 peerDependencies，都由本节定。

**两条互斥路：**
- **A. 消费方也用 Tailwind v4 + 引入瑚琏 preset**：`@hulianui/ui` 只发**源码 + className 字符串**，实际 CSS 由消费方的 Tailwind 扫描 `node_modules/@hulianui/ui` 源码生成。体积小、**与"运行时换肤"一致**；代价是强约束消费方技术栈，且消费方 Tailwind v4 的 `@source` 必须能扫到本包源码。
- **B. 预编译 CSS 随包发**：消费方 `import '@hulianui/ui/styles.css'` 即用，不要求 Tailwind。即插即用；但换肤只能靠预编译进去的 token 变量，灵活性低。

**本项目选 A**（与 §5「运行时换肤」一致；§6「组件只消费语义 token」本就默认 A）。据此：

**包形态与依赖契约：**
- `@hulianui/ui`：发 **ESM 源码 + 类型**（不预编译 CSS）。`react` / `react-dom` / `tailwindcss` / `@base-ui-components/react` 全部进 **`peerDependencies`**，不进 `dependencies`（避免版本双装与重复实例）。CVA / clsx / tailwind-merge 这类纯工具可进 `dependencies`。
- `@hulianui/tokens`：产出两份资产 —— ① **`tokens.css`**（`:root` + `[data-theme=dark]` 的 CSS 变量，消费方全局引入一次）；② **Tailwind v4 preset**（把语义 token 映射成工具类，供消费方 `@import` / 配置引用）。
- 消费方接入三步：装 `@hulianui/ui` + peer → 全局引 `@hulianui/tokens/tokens.css` → Tailwind 配置引瑚琏 preset 并把 `@hulianui/ui` 源码加入 `@source` 扫描范围。
- **`apps/www` 是这套接入方式的第一个真实消费者**（dogfooding），P0/P1 即验证此链路。

**§9 验收 5「可被外部 import」据此具体化为**：在一个全新的最小 Tailwind v4 工程里按上述三步接入，Button 能正确出样式 + 类型提示可用。

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

唯一真相源 `@hulianui/tokens`，组件永不写死颜色，只引用语义 token。

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

**ThemeProvider 的库/应用接缝（必须切开，否则污染框架无关库）：**
- **框架无关部分 → 留 `@hulianui/ui`**：localStorage 持久化、跟随系统 `prefers-color-scheme`、`data-theme` 切换 context/hook。纯 React，不依赖 Next。
- **防首屏白闪的 inline script → 归 `apps/www` 的 root layout**，**不塞进库**。这是 Next.js SSR/hydration 专属问题，写进通用库会污染边界。
- **build-vs-buy**：`next-themes` 已把 inline-script + system + storage 做到无 FOUC（但 Next 专属）。`apps/www` 可直接用 `next-themes` 或抄它的 inline script；`@hulianui/ui` 只保留框架无关 context。这条接缝正好印证上面的切分。

**token 加载顺序（anti-FOUC 依赖）**：`apps/www` root layout 里 `@hulianui/tokens` 的 `tokens.css` **必须在最前**加载，inline anti-FOUC script 依赖 CSS 变量已就位才能在 first paint 正确定色。

**留余量不过度**：token 结构支持未来加第三套主题（品牌色变体），结构不用改；但**现在只做 light/dark 两套**（YAGNI）。

---

## 6. 组件层（"优化后"的质量保证）

每个组件 = 自包含目录，强制四件套，缺一不算完成：

```
packages/ui/src/button/
├── button.tsx           # Base UI 行为 + Tailwind 皮肤，CVA 管变体(variant/size/tone)
├── button.types.ts      # 导出的 props 类型(TS 智能提示)
├── button.showcase.tsx  # 展示规格:变体矩阵 + 全状态 + 样例数据 + 手写 control schema
└── index.ts             # 桶导出
```

> **命名注意**：文件名是 `*.showcase.tsx`，**不是** `*.stories.tsx`。本项目**不用 Storybook**，展示由 `apps/www` 里的自定义展示组件渲染；避免 `.stories` 暗示 Storybook CSF 运行时误导后续接手者。5513 端口虽为 Storybook 预留，但当前不启用。

**"优化后" = 三条硬规范：**
1. **只消费语义 token**，禁止写死颜色/间距裸值（明暗自动适配的根本）。
2. **a11y 不可绕过** —— 焦点环、键盘导航、ARIA 全靠 Base UI 兜底，不手写。
3. **变体收敛** —— 所有外观差异走 CVA 的 `variant/size/tone`，不靠散落 className 覆盖。

**第四条约定（playground 数据来源）**：每个组件在 `*.showcase.tsx` 里**手写 control schema**（声明哪些 prop 可调、类型、取值范围/枚举、默认值），供 `<Playground>` 渲染 controls。**不走从 TS 类型自动抽取**（react-docgen-typescript 那套是 Storybook 级工具链，成本高易碎、会引发 scope 爆炸）。

---

## 7. Showcase 展示层（用户四种 mock 全选，逐一落地）

`apps/www`（Next.js + MDX），每个组件页由统一展示组件渲染：

| mock 类型 | 实现 |
|----------|------|
| ① 真实样例数据 | `@hulianui/mocks` 用 **faker** 造数据工厂（人名/头像/表格行/图表序列），一眼看"填满后"真实观感 |
| ② 全状态展示 | `*.showcase.tsx` 声明状态矩阵，`<StatesGallery>` 自动铺开 default/hover/focus/disabled/loading/error/empty/超长 |
| ③ API mock | `@hulianui/mocks` 出 **MSW handlers**，浏览器内 Service Worker（不占端口），异步加载/分页/表单提交站内真跑 |
| ④ 可调参 playground | `<Playground>` 读组件 `*.showcase.tsx` 里**手写的 control schema**（非 TS 自动抽取）→ controls 面板，实时改 props/文案/尺寸看效果 + 同步显示生成代码（一键复制） |

**三个核心展示组件（全站复用）：**
- `<ComponentPreview>`：实时 demo + 代码 Tab（随当前主题明暗）
- `<StatesGallery>`：全状态铺陈
- `<Playground>`：controls + live code

顶部全局明暗开关贯穿整站，所有 demo 同步换肤。

---

## 8. 分阶段落地

| 阶段 | 内容 | 产出标志 |
|------|------|---------|
| **P0 脊柱** | monorepo + `@hulianui/tokens`（含 preset+tokens.css） + 主题层 + ThemeProvider（库/应用接缝切开） + **Button + Switch + Dialog 三个标杆组件**端到端 + `www` 最小站点（dogfood 模型 A 接入） + 明暗开关（5512） | 切主题 0 闪烁、三组件站内跑起来、Base UI 命脉(Portal/focus trap)验证通过 |
| **P1 展示基建** | `<ComponentPreview>` / `<StatesGallery>` / `<Playground>` + `@hulianui/mocks`（faker + MSW） + MDX 体系 | 三组件页四种 mock 全亮 |
| **P2 组件扩量** | 批量补 Input/Dialog/Switch/Select/DataTable… 套 P0/P1 模具 | 覆盖面铺开 |
| **P3 发布** | changesets + npm 发包 + 部署 www | `npm i @hulianui/ui` 可用、站上线 |
| **P4 桌面壳** | Tauri 包 www（5514） | dmg 可装 |

**P0 三标杆组件分工（每个验证一条独立命脉，故不止 Button 一个）：**
- **Button** → token / CVA 变体 / 构建 / 发布 / 模型 A 接入链路（近似原生 `<button>`，验证不到 headless）。
- **Switch** → Base UI **受控状态 + ARIA + 焦点环**（成本低，也是 P1 playground/states 的好样本）。
- **Dialog** → Base UI **Portal + focus trap + overlay 层叠**（脊柱里最易出坑、Base UI 真正发力处；把"Base UI 是不是对的赌注"在 P0 就验掉，避免推迟到 P2 改方向的高成本）。

**本 spec 覆盖 P0 + P1**（架构定型的最高杠杆部分）。P2 起各自再开 spec。

---

## 9. 成功标准（P0 + P1 验收）

1. `pnpm dev` 在 **5512** 起 `www`，不与本地其它项目撞口。
2. 站点右上角明暗开关：切换 **0 闪烁**，首屏无白闪，刷新后保持上次选择，默认跟随系统。
   - **0 闪烁/无白闪的客观验收法**：Chrome DevTools 网络节流（Slow 4G）下硬刷 + 录屏 / 抓 first paint 截图，确认首帧即为正确主题底色，无白底闪现；切换主题录屏确认无中间白帧。
3. `@hulianui/ui` 三组件：Button（CVA 变体 variant/size/tone 齐全，只消费语义 token，键盘可达有焦点环）；Switch（Base UI 受控 + ARIA + 焦点环）；Dialog（Base UI Portal + focus trap，Esc/点遮罩关闭、焦点归还触发元素）。
4. 三组件文档页四种 mock 全亮：真实样例数据 / 全状态 gallery / 一个 MSW 异步 demo / Playground 可调参且显示生成代码。
5. `@hulianui/ui` 可被外部 `import`：在一个全新最小 Tailwind v4 工程里按 §3A 三步接入（装包+peer → 引 tokens.css → preset+`@source` 扫描），三组件正确出样式、类型提示可用。

---

## 10. 明确不做（YAGNI 边界）

- 不做第三套主题（结构留口，现在只 light/dark）。
- 不做 shadcn 式复制粘贴 registry（走 npm 包直发；registry 留作未来选项）。
- P0/P1 不扩组件量（只做 Button + Switch + Dialog 三个标杆，各验一条命脉，证明全链路；不堆 Input/Select/DataTable 等，那是 P2）。
- P0/P1 不做 Tauri 桌面壳（仅占位目录）。
- 不引入 CSS-in-JS。
