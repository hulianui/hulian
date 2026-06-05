# 瑚琏 Hulian A2 设计文档 — 左侧组件树 IA + 第一批无缝家族吸取（批次一）

- **日期**: 2026-06-02
- **状态**: 已与用户确认全部关键裁决，进入实施计划阶段（待用户审阅本 spec → writing-plans）
- **本 spec 覆盖范围**: **A2 批次一** = ①文档站左侧组件树导航（IA 重构）+ ②第一批 10 个「零新依赖」组件吸取。A2 后续批次（overlay 族 / 图表 / 动效组件）与 A3/A4 各自再开 spec。
- **上游依据**:
  - `2026-06-02-hulian-design-system-design.md`（P0/P1 主 spec，§5 主题层 / §6 组件四件套 / §7 四 mock）
  - `2026-06-02-hulian-absorption-model-v3.md`（吸取式聚合模型 v3，§3 选源表 / §6 执行分期）
- **前置进度**: P0/P1 + A0（Tauri 壳）+ A1（motion 动效基元）均已完成（见项目记忆 `hulian-phase-status`）。现有 3 个标杆组件 Button / Switch / Dialog，文档站为扁平单页 `app/components/page.tsx`。

---

## 1. 本批定义与边界

A2 启动时面对两个事实：(a) 只有 3 个标杆组件，远未铺开；(b) 文档站是扁平单页、硬编码 `SPECS = [Button, Switch, Dialog]`，组件一多必崩。本批解决这两点的**地基部分**：

- **做**：把文档站从扁平单页升级为「左侧分类树 + 每组件独立页 + registry SSOT」的可无限扩展 IA；并按修正后的选源表吸取**第一批 10 个组件**（全部可用 Base UI / Tailwind / 现有 motion 落地，**不引入任何新的大依赖**）。
- **不做**（明确推迟，见 §9）：任何需要新依赖或第二套 overlay 引擎的组件——Select / Combobox / DatePicker / Menu / Popover / Tooltip / Toast（overlay 族）、Table（TanStack）、Charts（Tremor）、动效组件（Magic UI）、MUI/Ant 桥接、prod 打包。

本批是「先把树立起来 + 跑通批量吸取模具」，用最低风险验证 IA 与吸取流程，后续批次照此扩量。

---

## 2. 关键裁决与对 v3 §3 选源表的修正

用户对三个前置决策 + 三个收口点逐一拍板，全部取稳健推荐方案：

| 决策点 | 裁决 |
|--------|------|
| overlay 引擎红线 | **守红线·全 Base UI**：所有 overlay 族（Dialog/Select/Combobox/Menu/Popover/Tooltip/Tabs/Accordion）只用 Base UI 一套库，**本阶段不引入 React Aria** |
| 本批 scope | IA 树 + 第一批「零新依赖」组件 |
| IA 路由结构 | 每组件一页（`/components/[slug]` 动态路由）+ 持久左侧分类树 + registry |
| registry 形态 | **www 单一 registry**（全部 IA 元数据集中在 `apps/www`，`@hulianui/ui` 保持纯净） |
| 第一批清单 | **全量 10 个含 Tabs** |
| 表单录入范围 | **Input + Textarea + Field 三件**（含 Field a11y 包装） |

**⚠️ 对 v3 §3 选源表的修正（overlay 红线优先级高于选源表）**：

| 组件 | v3 §3 原选源 | 本 spec 修正为 | 原因 |
|------|-------------|---------------|------|
| Select / Combobox / Autocomplete | React Aria Components | **Base UI**（后续批次） | 守 overlay 红线，避免第二套 Portal/FocusScope 引擎 |
| DatePicker / Calendar | React Aria Components | **暂缓 / 后议** | Base UI rc 暂无成熟 DatePicker；不为它单独破红线 |
| Input / Field / Form | React Aria Components | **Base UI Field/Input（a11y 自动串联）** | 不引 React Aria（守 overlay 红线）；Step 2 实测 Base UI rc.0 自带 field/input/fieldset/form → 用 Base UI Field 做 a11y 串联比手写更稳（详见 Step 2 spec `2026-06-02-hulian-a2-step2-form-inputs-design.md`）|

> 第一性原理记录：React Aria 的「最佳」不可「抄结构换 token」（不像 HeroUI 是纯 Tailwind），要用就得装整套 `react-aria-components` 的 overlay/Portal 体系。在 Base UI 之外再引第二套 overlay 引擎与「overlay 全 Base UI」硬约束直接冲突。守红线 = 单一 overlay 引擎、bundle 最小、与已落地的 Dialog 同源。代价是放弃 React Aria 的部分复杂键盘交互，由 Base UI 顶级 a11y（Radix/MUI 团队出品）兜底。

---

## 3. IA 架构

### 3.1 路由（`apps/www/app/components/`）

| 文件 | 角色 | server/client |
|------|------|---------------|
| `layout.tsx`（新） | 两栏壳：左=持久组件树、顶=明暗开关、右=`{children}` | server 外壳，内嵌 client 组件树 |
| `page.tsx`（改） | `/components` 索引概览页：按分类列组件卡片（不再堆全部 demo） | server，只读 `manifest`（纯数据） |
| `[slug]/page.tsx`（新） | 单组件页：导出 `generateStaticParams`（读 `manifest`）+ `metadata`，内部渲染 client 岛 `<ComponentDoc slug={slug} />` | server 页 + client 岛 |

- `generateStaticParams` 从 **`manifest`**（纯数据，见 §3.3）取 `slug[]` → 全部组件页 **SSG**（顺带利好 A4 静态导出）。server 模块图里**不出现**任何 `@hulianui/ui` 渲染代码。

### 3.2 RSC 边界（**结构性**隔离，非纪律性）

`ShowcaseSpec` 含 `render()` / `renderWithProps()` 函数与 JSX。风险**不止**「跨 server→client 序列化」，更在于**模块图污染**：若 server 端（如 `generateStaticParams`）`import` 一个同时持有 spec 的 registry 模块，会把整个 `@hulianui/ui` 的 showcase 渲染代码静态拉进 SSG 模块图——只要某个 `*.showcase` 不是 client 模块、且其顶层有 browser-only 副作用，SSG 就会在「加到第 N 个组件时」隐性炸裂。这正是 v3 选这条路要避免的回归。

**对策 = 把保证从「自觉」变「架构强制」：拆两个文件（详见 §3.3）**

- server 侧只能 `import` `manifest`（纯数据，零 `@hulianui/ui` 依赖）→ **server 根本 import 不到 spec**，函数无从跨界，模块图里也没有渲染代码。
- spec 渲染映射（`registry.tsx`，`"use client"`）只被 `ComponentDoc` client 岛 `import`。
- 套用 skill `rsc-client-element-as-render-prop-undefined-type`（治 render-prop 跨界）——此处治的是**模块图跨界**，与之同源；motion 相关注意 `motion-reveal-invisible-after-wrapper-becomes-client`。

### 3.3 IA SSOT = manifest + registry **双文件**（结构性隔离 server/client）

```ts
// lib/manifest.ts —— 纯数据 SSOT，零 @hulianui/ui import。server / client 皆可安全读。
interface ComponentMeta {
  slug: string;            // URL 段，如 "card"
  name: string;            // 显示名，如 "Card"
  description: string;     // 一句话
  category: CategoryKey;   // 见 §3.4
  status: "stable" | "new";
}
export const manifest: ComponentMeta[] = [ /* ... */ ];

// lib/registry.tsx —— "use client"，只被 ComponentDoc 岛 import。
import { buttonShowcase, /* ... */ } from "@hulianui/ui";
export const specBySlug: Record<string, ShowcaseSpec> = { button: buttonShowcase, /* ... */ };
```

- **`manifest.ts`**（纯数据）：`generateStaticParams`、索引页卡片、`<ComponentTree>` 只 import 它 → server 模块图无渲染代码。
- **`registry.tsx`**（`"use client"`，spec 映射）：只被 `ComponentDoc` client 岛 import。
- `@hulianui/ui` 保持纯净——**不**加 slug/category 这类文档概念，`ShowcaseSpec` 类型不动。
- **加一个组件 = 库里写四件套 + `manifest` 加一行 + `registry` 映射加一行**（唯一入口，后续批次照此扩）。
- **status 约定**：本批接入的存量 Button/Switch/Dialog 标 `"stable"`；本批新增 10 个标 `"new"`（后续批次稳定后再降为 `stable`，由该批 plan 决定）。
- **扩展钩子（YAGNI，本批不做）**：当前 `registry.tsx` 静态 import 全部 spec → 每个 `[slug]` 页 client bundle 含全部组件 showcase 代码（10 个无所谓）。后续批次膨胀到数十个时，把 `specBySlug` 改为 `Record<string, () => Promise<ShowcaseSpec>>`（`dynamic(() => import(...))`）按 slug 懒加载、code-split。

### 3.4 分类法（覆盖 §3 选源表全集，后续批次组件也有归属）

| key | 中文 | 组件（★=第一批落地，其余为后续批次占位） |
|-----|------|------|
| `inputs` | 表单录入 | Button・★Input・★Textarea・★Checkbox・★Radio・Switch・★Field・Select・Combobox・DatePicker・Slider |
| `data-display` | 数据展示 | ★Avatar・★Badge・★Card・★Skeleton・Table・Charts |
| `feedback` | 反馈 | Dialog・Drawer・Tooltip・Popover・Toast・Alert |
| `navigation` | 导航 | ★Tabs・Menu・Accordion・Breadcrumb |
| `effects` | 动效 | shimmer・marquee・beam・number-ticker（Magic UI，后续批次） |

（已有 Button/Switch 归 `inputs`、Dialog 归 `feedback`，本批一并纳入新 IA。）

### 3.5 layout 左树

- 左侧 `<ComponentTree>`（`"use client"`）：读 `manifest`（纯数据），按 `category` 分组渲染，`usePathname` 高亮当前 slug，`status==="new"` 显示小标记。
- 顶部明暗开关复用现有 `ThemeToggle`。
- **窄屏响应式**：左树折叠为可展开的顶部菜单（简单实现，**不做**花哨抽屉动画——YAGNI）。

---

## 4. 第一批组件清单与选源（全 Base UI / Tailwind / 现有 motion，零新依赖）

| 组件 | 分类 | 选源（修正后） | 命脉 / 要点 |
|------|------|---------------|-------------|
| **Input** | inputs | **Base UI** Input(≡Field.Control) + 瑚琏外壳皮肤 + CVA | size / disabled / invalid 态；前后缀 slot（详见 Step 2 spec）|
| **Textarea** | inputs | **Base UI** Field.Control render textarea + 同皮肤 | 行高；自适应高度(JS scrollHeight)（详见 Step 2 spec）|
| **Field** | inputs | **Base UI** Field(Root/Label/Control/Description/Error)，a11y 自动串联 | Label + 内容 slot + help + error；error 用 `match={true}` 强制渲染避免「框红字没」（详见 Step 2 spec）|
| **Checkbox** | inputs | **Base UI** Checkbox | 受控 + ARIA + 焦点环（同 Switch 族）；indeterminate |
| **Radio** | inputs | **Base UI** RadioGroup | 单选组 + 键盘方向键 |
| **Card** | data-display | shadcn/HeroUI 皮肤 + CVA | header/body/footer 插槽；hover 微阴影（HeroUI 气质，用 motion） |
| **Avatar** | data-display | **Base UI** Avatar + 皮肤 | 图片 + 加载失败 fallback（文字/图标）；尺寸 |
| **Badge** | data-display | shadcn/HeroUI 皮肤 + CVA | tone（brand/danger/success/neutral）× variant（solid/soft/outline） |
| **Skeleton** | data-display | 纯 Tailwind + motion | shimmer 动效（给 motion 加 shimmer 预设，见 §5） |
| **Tabs** | navigation | **Base UI** Tabs | 无浮层；受控 + 键盘；underline / solid 两种皮肤 |

> **Base UI rc.0 具体子组件 API**（Checkbox/Radio/Tabs/Avatar 的 `.Root/.Indicator/.List/.Image` 等命名）在实现时用 context7 或读 `node_modules/@base-ui-components/react` 确认，不在本 spec 写死，避免 API 漂移。已知样本：`Switch.Root/Thumb`、`Dialog.Root/Trigger/Portal/Backdrop/Popup/...`。
>
> **对 v3 §3 的细化（Avatar）**：v3 §3 把 Avatar 归为「简单展示组件 = 纯 shadcn/HeroUI 皮肤」。本 spec 升级为「Base UI Avatar primitive + 瑚琏皮肤」，理由：Avatar 有「图片加载失败 → fallback」的真实行为态，用 Base UI 已验证的 image-load/fallback 逻辑比手写 `onError` 更稳，且与「优先用 Base UI 成熟 primitive」的取向一致。Badge/Card/Skeleton 仍按 v3 §3 走纯皮肤（无行为态）。

---

## 5. showcase 模具评估与增量

现有 `ShowcaseSpec`（`controls` 仅 `text/select/boolean/number` + `states` + `renderWithProps` + `toCode`）对标量 prop 够用。本批两处增量，**不动 `ShowcaseSpec` 类型**：

1. **插槽 / 复合组件**（Card 的 header/body/footer、Field 的 label+error、Tabs 的多 panel、Radio 的选项组）：用 `states` 预置组合 demo 展示全貌；`<Playground>` 只调标量 prop（如 `variant` / `size` / `withFooter:boolean`），**不**试图用 controls 拼装插槽结构。靠 showcase 写法解决，类型零改动。
2. **Skeleton shimmer**：给 `packages/ui/src/motion/variants.ts` 新增一个 `shimmer` 预设（沿用既有 motion 时长/曲线 token），属 motion 基元小增量。

---

## 6. 继承的硬约束（plan/实现阶段逐条守）

1. **只消费语义 token**：禁写死颜色/间距裸值（明暗自动适配的根本）。Tailwind v4 dark variant 套 skill `tailwind-v4-shadcn-dark-variant-data-theme-bridge`。
2. **a11y 不可绕过**：焦点环 / 键盘 / ARIA 靠 Base UI 兜底（Checkbox/Radio/Tabs/Avatar）；Input/Field 的表单态 a11y 由 **Base UI Field 自动串联**（`aria-invalid`/`aria-describedby`/`htmlFor`）并测（Step 2 改判 Base UI Field，原「手写」方案已废）。
3. **变体收敛**：所有外观差异走 CVA 的 `variant/size/tone`，不靠散落 className 覆盖。
4. **四件套**：每组件 `*.tsx` / `*.types.ts` / `*.showcase.tsx`（手写 control schema，**非** TS 自动抽取，**非** `.stories`）/ `index.ts`，并桶导出到 `packages/ui/src/index.ts`。
5. **overlay 全 Base UI**：本批唯一带交互浮层倾向的是 Tabs，但 Tabs 无浮层（纯面板切换），不触发 overlay 红线。
6. **动效用 `packages/ui/src/motion` 基元**：Card hover / Skeleton shimmer 等复用现有 `pressable`/`fadeScale` + 新增 `shimmer`，不散写 transition。
7. **端口**：www = **5512**，桌面 app devUrl = **5514**（勿用默认口，见 skill `nextjs-16-dev-server-dedupes-by-project-dir-not-port`）。
8. **RSC client 岛**：见 §3.2，registry 的渲染消费全程 client 岛。

---

## 7. 分批落地（每步独立 commit + 三道门 + 浏览器实测明暗两态）

「三道门」= `typecheck` + 单测 + 生产 `build` 全绿。每步收尾跑三道门 + 浏览器实测（明暗两态）+ 桌面 app(5514) 加载正常 + 小步提交。

> **Step 0 前置 — 记录绿色基线**：改造前先跑一次完整三道门（尤其 `pnpm build`，确认含 MSW 的 `AsyncUsers` 在 `next build` 下不报错）并记录结果。这样 Step 0 之后任一道门变红，能立刻区分是「IA 改造引入」还是「存量已有」的问题，不替存量背锅。

| Step | 内容 | 产出标志 |
|------|------|---------|
| **Step 0 — IA 骨架** | `components/layout.tsx` 两栏 + `<ComponentTree>` + **`lib/manifest.ts` + `lib/registry.tsx`（双文件，见 §3.3）** + `[slug]/page.tsx`（`generateStaticParams` 读 manifest）+ `ComponentDoc` client 岛 + 索引页改造。**先把现有 Button/Switch/Dialog 接进新 IA**（不新增组件）；**顺带给 `button.showcase.tsx` 补 `"use client"`** 统一三个存量 showcase（现 switch/dialog 有、button 无）。 | 左树 + 3 组件各自独立页 SSG 跑通、明暗开关在位、桌面 app 正常、`build` 仍绿 |
| **Step 1 — 展示族** | Card · Avatar · Badge · Skeleton（含 motion `shimmer` 预设） | 4 组件四件套齐 + registry 注册 + 文档页四 mock（适配）亮 |
| **Step 2 — 表单录入族** | Input · Textarea · Field（a11y 串联） | 3 组件齐 + invalid/disabled/help/error 状态 gallery |
| **Step 3 — 选择族** | Checkbox · Radio（Base UI，复用 Switch 经验） | 2 组件齐 + 受控/ARIA/焦点环/indeterminate 验证 |
| **Step 4 — 导航族** | Tabs（Base UI） | underline/solid 皮肤 + 键盘可达 |

> 步序原则：先立 IA 骨架（Step 0 是后续所有 step 的承载），再从「最快见效、零依赖纯展示族」（Step 1）开始，逐步到有 Base UI 行为的族（Step 3/4）。每步可独立提交、独立 review、独立回滚。

---

## 8. 本批验收口径（done 的标志）

1. 左侧组件树按 5 分类组织、高亮当前页、`new` 标记可见、明暗开关在位、窄屏可折叠。
2. `/components` 索引概览页 + 每组件 `/components/[slug]` 独立页，均 SSG 生成、可直接 URL 访问。
3. 第一批 10 个组件（Card/Avatar/Badge/Skeleton + Input/Textarea/Field + Checkbox/Radio + Tabs）全部：四件套齐、只消费语义 token、a11y 达标（焦点环/键盘/ARIA）、明暗自适应、文档页四 mock（适配后）亮。
4. 三道门（typecheck + 单测 + 生产 build）全绿；浏览器实测明暗两态无异常；桌面 app(5514) 加载新 IA 正常。
5. `apps/www/lib/manifest.ts` + `registry.tsx`（双文件）成为加组件的唯一 IA 入口，后续批次照此扩量无需改 IA 框架。

> **「四 mock 适配」界定**（消歧义）：主 spec §7 的四 mock 中，**①真实样例数据(faker) + ②全状态 gallery + ④可调参 playground 是第一批每个组件的标配**；**③API mock(MSW) 仅对有异步数据语义的组件适用**——第一批 10 个均为纯展示/表单组件，无天然异步场景，故组件页**不强制**各做一个 MSW demo，站级已有的 MSW 分页 demo（`AsyncUsers`）保留在索引/概览处即可。验收时 ③ 对第一批组件按「不适用」处理，不视为缺项。

---

## 9. 本批不做（YAGNI 边界 / 推迟到后续批次）

- **不引入 React Aria**（守 overlay 红线）；Select/Combobox/Autocomplete 改 Base UI、留**后续批次 A2.2**。
- **不做 DatePicker/Calendar**（Base UI 暂无成熟件，不为它破红线）——后议。
- **不做** overlay 浮层族（Menu/Popover/Tooltip/Toast/Drawer）——后续批次。
- **不做** Table/DataTable（TanStack）、Charts（Tremor）、动效组件（Magic UI）——各自后续批次。
- **不做** MUI/Ant 桥接（A3）、prod 静态导出 + dmg 打包（A4）。
- **不改** `@hulianui/ui` 的 `ShowcaseSpec` 类型（用 showcase 写法承载插槽组件）。
- **不做** 移动端花哨抽屉动画（左树窄屏简单折叠即可）。
- **不做** 从 TS 类型自动抽取 control schema（沿用手写，见主 spec §6 第四条）。

---

## 10. 后续批次预告（不在本 spec 范围，各自再开 spec）

- **A2.2 — Base UI overlay 族**：Select / Combobox / Menu / Popover / Tooltip / Toast（全 Base UI，先解决 overlay 族在 registry/文档页里的承载）。
- **A2.3 — 数据可视化**：Table（TanStack headless + 瑚琏皮肤，✅ 已落 `…-a2-3-table-design.md`）、Charts/KPI（✅ 已落 `…-a2-3-charts-design.md`）。
  - ⚠️ **实际改判**：Charts **未用 Tremor**，改 **`recharts` 直裹 + 瑚琏 token 皮肤**（否决 `@tremor/react`：停在 Tailwind v3、自带调色板与瑚琏 TW v4 + 只消费语义 token 红线打架；recharts 本就是 Tremor 底层引擎，SVG 走 `var(--color-chart-N)` 天然明暗自适应）。多序列调色板在 token 层加 `--color-chart-1..4`。详见 charts spec §2/§3。
- **A2.4 — 动效组件**：Magic UI（确认 `magic` = magicui.design；copy-paste 模式，换瑚琏 token 类）。
- **A3 — 付代价家族桥接**：MUI（emotion theme 桥）+ Ant（ConfigProvider 桥），各取最佳组件。
  - ✅ **MUI 桥 spike 已落**（`…-a3-mui-bridge-design.md`）：emotion theme palette 全设瑚琏 `var(--color-*)` 单一真源（每槽给齐 main/light/dark/contrastText 跳过 augmentColor 对 var() 的解析）+ `@mui/material-nextjs` `AppRouterCacheProvider`(v16)；**只取非 overlay 件**（Rating/Stepper，守 overlay 全 Base UI 红线——MUI overlay 件将引第二套 Portal 引擎，需用户确认才破）；桥接产物隔离 `packages/ui/src/_mui/`。明暗经 `data-theme` 单一真源同步、无 FOUC（像素自证）。Ant 桥（ConfigProvider）待续。
- **A4 — prod 打包**：www 静态导出（处理 MSW dev-only）+ Tauri dmg。
