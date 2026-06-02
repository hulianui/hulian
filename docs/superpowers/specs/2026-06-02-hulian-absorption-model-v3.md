# 瑚琏 Hulian 设计文档增补 v3 — 吸取式聚合模型（博采众长）

- **日期**: 2026-06-02
- **状态**: 用户确认的模型修正，取代 v1/v2 里"纯从 Base UI 自造"的隐含假设
- **触发**: 用户指出 "瑚琏 ui 吸取并变成自己的 ui，既然都是 React 可以无缝接入吸取" + "你没把我喜欢用的灌进去" + "我要在 app 上看"

---

## 1. 模型修正（核心）

瑚琏不是"从零自造的设计系统"，而是 **吸取式聚合器**：
**从各家 React 组件库吸取「最好的那个实现」，统一成瑚琏自己的一套 API + 一套明暗 token 主题。**

- **吸取策略 = 博采众长**（用户确认）：每个组件概念（Button/Dialog/Table…）只保留**一个**瑚琏组件，由"各家最好的源"重塑而来。**不做整库吸纳**（不让 HeroUI 的 Button 和 shadcn 的 Button 并存）。
- 这正是瑚琏的价值：**curation + unification**，不是 hoarding。对应 v2 §2 的"混库红线"升级版。

## 2. 吸取来源库清单（用户选定）

**无缝家族（Tailwind / CSS 变量，能直接桥接瑚琏 token 主题）：**
- HeroUI v3 — 观感与交互手感主参考（用户 3 生产项目在用）
- shadcn/ui — CVA 组织方式 + 具体组件实现
- Base UI — headless 行为 / a11y 骨架（已在用）
- React Aria Components（Adobe）— 复杂交互的 a11y 之王（日期/选色/拖拽/Combobox）
- Tremor — Tailwind 原生图表 / 仪表盘（KPI 卡 / 趋势图 / 数据表）
- Magic UI（magicui.design，**待用户确认"magic"即此**）— motion 驱动的动效组件
- motion（Framer Motion fork）— 跨组件动效基元（进场 / 交互 / 转场）
- lucide-react — 图标（已在用）

**付代价家族（自带样式引擎，明暗需额外桥接到瑚琏 token，不无缝）：**
- MUI（emotion）
- Ant Design（cssinjs）
> 这两者吸取时只取"最好的那个组件"，并写一层 token 桥接适配（emotion theme / antd ConfigProvider → 瑚琏 CSS 变量）。优先级排在无缝家族之后。

## 3. 博采众长 · 每组件选源（首版建议，执行时可微调）

| 组件概念 | 选源（best-of-breed） | 理由 |
|---------|---------------------|------|
| Button | HeroUI v3 观感 + 自有实现 | 手感/观感最对用户胃口；press scale via motion |
| Input / Field / Form | React Aria Components | a11y + 校验态最稳 |
| Switch / Checkbox / Radio | Base UI | 已验证，受控+ARIA 干净 |
| Dialog / Modal / Drawer | Base UI | 已验证 Portal+focus trap |
| Tooltip / Popover / Menu / Tabs / Accordion | Base UI | 同族单库，避免 overlay 打架 |
| Select / Combobox / Autocomplete | React Aria Components | 复杂键盘交互最强 |
| DatePicker / Calendar | React Aria Components | 业界最佳 |
| Table / DataTable | TanStack Table（headless）+ 瑚琏皮肤 | 数据表事实标准 |
| Charts / KPI / Dashboard | Tremor | 补齐数据可视化空白 |
| Toast / Notification | Sonner 或 Base UI | 轻量 |
| 动效组件（shimmer/marquee/beam/number-ticker） | Magic UI | motion 驱动，营销/仪表盘亮点 |
| Avatar / Badge / Card / Skeleton | shadcn 或 HeroUI 皮肤 | 简单展示组件 |
| 横切动效层 | motion | 所有组件的进场/交互/转场统一用它 |

## 4. 统一主题的技术现实（第一性原理，不许信假"无缝"）

- **无缝家族**：组件只输出 className / CSS 变量 → 直接消费瑚琏语义 token，明暗自动跟随。吸取 = 复制最佳实现的结构 + 换成瑚琏 token 类。
- **React Aria**：headless（无样式）→ 自己上瑚琏皮肤，最干净。
- **Tremor / Magic UI**：Tailwind 类 → 把它们的颜色类替换成瑚琏语义 token 类。
- **MUI**：emotion `ThemeProvider`，写一个把瑚琏 CSS 变量映射成 MUI palette 的 theme。
- **Ant Design**：`ConfigProvider` + theme token，把瑚琏 CSS 变量映射成 antd seed token。明暗切换要同时切 antd algorithm（darkAlgorithm）。

## 5. 桌面 app（已落地，P4 提前）

- `apps/desktop`：Tauri 2.11 壳，加载 www（devUrl 5512），dark overlay 标题栏，瑚字品牌图标，single-instance。
- 现状：`tauri dev` 编译通过、原生窗口实跑（webview 正常 GET www）。
- 待办：prod 打包（Next 全静态已 ○ Static，可 `output:export` 出静态 → Tauri 打 dmg；但 MSW 是 dev-only，prod 的异步 demo 需改真静态数据或内置 mock）。

## 6. 执行分期（取代旧 P2）

- **A0**（已完成）：桌面壳 + loading 按钮修复。
- **A1 动效基元**：装 motion，建瑚琏动效约定（进场/press/转场 token），先给 Button(press) + Dialog(进出场) 上 motion。视觉最快见效。
- **A2 无缝家族吸取**：按 §3 表，逐组件博采众长（HeroUI Button 观感 → React Aria Input/Select/Date → Tremor 图表 → Magic UI 动效组件）。每个组件套现有四件套 + 四 mock 模具。
- **A3 付代价家族桥接**：MUI emotion theme 桥 + Ant ConfigProvider 桥，各取最佳组件。
- **A4 prod 打包**：www 静态导出 + Tauri dmg。

每组件吸取仍遵守四件套（`*.tsx` / `*.types.ts` / `*.showcase.tsx` 手写 control schema / `index.ts`）+ 四 mock 展示 + 只消费语义 token + 同交互族单库（overlay 全 Base UI）。

## 7. 待确认

- "magic" = Magic UI（magicui.design）？还是别的？
- 是否按 §3 的选源表，还是某些组件你有指定的源？
