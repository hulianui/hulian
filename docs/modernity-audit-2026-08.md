# 瑚琏 Hulian 定位与现代性审计（2026-08-01）

> **这不是商业战略报告，也不只是技术选型报告。**
>
> 瑚琏的真实定位是：**AI 时代里，「我的主见」的可执行载体。**
>
> 目标不是 star、不是收入、不是外部用户，而是——
> **未来任何一个从零到一的项目，AI 都在我的主见之上搭积木，而不是自己拿主见。**
>
> 因此本文的衡量标准只有两条：
> 1. **积木是否足够好**（现代性：地基踩在哪一年）
> 2. **AI 是否真的只能搭积木**（可执行性：主见有没有被固化成机器约束）
>
> 数据为 2026-08-01 实测（GitHub API 逐仓核对 + 本地代码/配置实测）。

---

## 0. 结论

**积木的质量已经很好，积木的可取用性接近于零。**

- 瑚琏在 **7 个技术维度上处于全球前沿**（OKLCH token 体系、Base UI 选型、TypeScript 7、CI 体积门禁四项**领先于绝大多数头部库**）
- ~~但**「让 AI 只能搭积木」这件事，目前只做到了 L0.5**~~ → **2026-08-01 已推进到 L3**（registry 447 个可装 item + MCP 四个 tool + 998 条机器可读约束）
- ~~且最值钱的两层积木——**28 个区块、19 个页面**——对 AI **完全不可见**~~ → **已全部进 registry**（57 区块 + 20 页面，可 `npx shadcn add` 直接注入）

~~三个维度停留在旧范式~~ → **2026-08-01 全部解决**（测试基座切 browser mode、分发形态补齐 registry、emotion / MUI 桥整族切除）。见 §4.2。

---

## 1. 定位：为什么这不是一个"组件库"问题

### 1.1 真问题

AI 从零到一时的失控点，不在代码能力，在**决策权**：

| AI 会自己决定的事 | 结果 |
|---|---|
| 用哪个 UI 库 | 默认 shadcn / MUI，不是你的 |
| 页面怎么布局 | 每次不一样 |
| 间距、圆角、阴影 | 凭感觉，不走 token |
| toast / 表单 / 表格怎么封 | 每个项目一套 |
| 中后台骨架长什么样 | 手搓 `h-dvh` wrapper，不用 AdminLayout |

**这些决定本来就该是你的，不是它的。** 但你没有把它们固化成机器能读的东西，所以每次都得靠 CLAUDE.md 里的散文 + 你人工纠偏。

### 1.2 解法的本质

不是"让 AI 更聪明"，是**缩小 AI 的决策空间**：

```
AI 的自由度  ──────────────────────────►  你的主见的固化度
     ↑                                            ↑
  现在在这                                    目标在这
（每次重新发挥）                          （只能从积木里挑）
```

组件库只是这件事的**载体之一**。真正起作用的是三样东西：

1. **积木本身**（组件 / 区块 / 页面）—— 瑚琏已有，质量很好
2. **积木的机器可读索引**（AI 知道有什么、怎么用）—— ✅ 2026-08-01 落地（MCP + registry）
3. **硬约束**（AI 想发挥也发挥不了）—— ✅ 2026-08-01 落地（998 条 conventions）

### 1.3 积木的三种粒度 ← 本次审计最重要的发现

| 粒度 | 数量 | 存放位置 | AI 可取用性 |
|---|---|---|---|
| **组件** Button / ProTable / Flow | 367 | `packages/ui/src/` + npm | ✅ `list_components` + `get_component_doc` |
| **区块** 登录区 / 定价表 / 工作台头部 / 特性分栏 | 57 | 文档站 `/blocks` | ✅ `install_block`，自包含可注入 |
| **页面** 列表页 / 详情页 / 仪表盘 / 结算流 | 20 | 文档站 `/pages` | ✅ 同上 |
| **整站 demo** CRM / 商城 / 大屏 / AI 工作流 / 直播 / 网关 | 18 | `apps/www/app/demos/` | ❌ 仍不可见（区块已从中抽出，demo 本体未进 registry） |

**"从零到一搭积木"用的主要是后三层**——AI 需要的不是"给我一个 Button"，而是"给我一个中后台列表页的骨架"。

~~而这三层现在的处境是：做出来了、质量很高，然后只被放在文档站里给人看。~~

**2026-08-01 已解决**：57 区块 + 20 页面全部进 registry，`npx shadcn add` 可直接注入（真实 CLI 验证过）。它们本就自包含——只从 `@hulianui/ui` 根 barrel 导入——零改写即可落盘。

---

## 2. AI 施工约束的成熟度分级

用一把尺子量"AI 是否只能搭积木"：

| 级别 | 机制 | AI 的行为 | 瑚琏 |
|---|---|---|---|
| **L0** | 口头 / CLAUDE.md 散文铁律 | 有时遵守，有时发挥 | ✓ |
| **L0.5** | 一份需整吞的 `llms-full.txt` | 吃 context，或干脆猜 | ✓ |
| **L1** | 机器可读索引（MCP `list_components` / `get_component_doc`） | 按需查，不猜了 | ✅ 2026-08-01 |
| **L2** | 可注入积木（registry `install_block`，447 个 item） | 直接把你的积木写进项目 | ✅ 2026-08-01 |
| **L3** | 硬约束 schema（`get_conventions`，998 条） | **想发挥也发挥不了** | ✅ **← 当前在这** |
| **L4** | 跨栈统一（后端各框架同一套机制） | 全栈搭积木 | 未做（机制已验证，可复制） |

### L0.5 的实际代价：AI 猜错是常态

以下每一条都已在本项目实际发生并记录在案：

| AI 猜的 | 正确的 |
|---|---|
| `toast.success(...)` | `toast({ title, tone: "info" \| "danger" \| "neutral" })` |
| `<Badge variant="...">` | Badge 无 `variant`，该用 `Tag` |
| `<Heading size="md">` | 无 `md` 档 |
| SVG `fill={var(--primary)}` | 必须 `var(--color-primary)`，否则不解析（Tailwind v4 真名带 `--color-` 前缀） |
| 手搓 `h-dvh` wrapper 包整页 | `AdminLayout` 自带 `fitViewport` |
| 在 demo 里打 CSS 补丁 | 铁律是"缺能力回库修组件" |

**每一条都是"主见没有被固化"的直接后果。** 它们现在靠你人工发现、靠踩坑后写 skill 兜底——而 skill 也是散文，下次换个 session 照样可能违反。

---

## 3. 技术现代性审计（积木质量）

积木要值得被反复搭，本身必须站在当代。这部分是好消息。

| # | 维度 | 2026 前沿做法 | 瑚琏现状 | 站位 |
|---|---|---|---|---|
| 1 | 颜色系统 | OKLCH + 原始/语义双层 token + 运行时换肤 | ✓ 双层 token、`[data-theme]` 切换、暗色零闪烁、阴影令牌三层结构 | 🟢 **领先** |
| 2 | 行为层 | Base UI（Radix 作者新作，MUI 团队维护） | ✓ 全库基于 Base UI | 🟢 **超前** |
| 3 | 样式引擎 | Tailwind v4 `@theme` + 原生 CSS 变量 | ✓ `@theme inline` 接运行时变量 | 🟢 前沿 |
| 4 | 类型工具链 | TypeScript 7（Go 重写的 tsc） | ✓ `^7.0.2` + CI 跑 TS5/TS7 双版本冒烟 | 🟢 **领先** |
| 5 | 性能预算 | CI 强制体积门禁 | ✓ `size-limits.json` 12 采样点带 15% 余量 | 🟢 **领先** |
| 6 | 动效体系 | 曲线 SSOT + `prefers-reduced-motion` | ✓ 曲线三处镜像、13 overlay 统一 transform-origin | 🟢 前沿 |
| 7 | 文档形态 | 结构化 + 机器可读 | ✓ 367 份逐组件 md + llms.txt + `/d/<slug>.md` 单件端点 | 🟢 前沿 |
| 8 | ~~**分发形态**~~ | registry 协议 + CLI + agent 可注入 | ✅ **已解决**：447 个可装 item，真实 `npx shadcn add` 验证 | 🟢 **已解决** |
| 9 | ~~**测试基座**~~ | Vitest **browser mode**（真实浏览器） | ✅ **2026-08-01 已迁**：双 project（unit=jsdom / browser=真实 chromium） | 🟢 **已解决** |
| 10 | **CSS-in-JS** | zero-runtime（runtime 方案已判死） | 无 runtime CSS-in-JS，纯 Tailwind + CSS 变量 | 🟢 **当代** |
| 11 | a11y 验证 | CI 内 axe-core 自动回归 | 靠 Base UI 兜底，无门禁 | 🟡 待补 |
| 12 | ~~**agent 可操作性**~~ | MCP + 机器可读约束 schema | ✅ **已解决**：`@hulianui/mcp` 四个 tool + 998 条约束 | 🟢 **已解决** |

### 3.1 领先的部分（不要动这些，它们是地基）

**OKLCH 双层 token** —— 对照：MUI 用 hex + 运行时 `alpha()`；Ant Design 用 HSV 算法生成 hex；Chakra token 底色仍是 hex；shadcn 2024 后才转 OKLCH（与瑚琏同代，但**只有单层**，没有语义层、没有阴影令牌体系、没有 `--color-hairline` 这种明暗差异化处理）。**瑚琏在这项上比 shadcn 更完整。**

**Base UI 选型** —— 全库最重要的一个正确决策。对照：`tailwindlabs/headlessui`（28,682 star）**自 2026-04-13 起 3.5 个月无提交**；`radix-ui/primitives` 已转 WorkOS 维护，路线存疑；而 shadcn/ui **主力仍在 Radix**，Base UI 是更新的一代。

**TypeScript 7 + 双版本 CI 冒烟** —— 多数头部库还在 5.x 观望。不但用了，还建了防退化的网（`commit f4328bb` 修 TS≥6 消费方 `import Video` 报 TS2882，说明是真趟出来的）。

**CI 体积门禁** —— 打 tarball 装到仓库外目录去测，采样口径写在注释里。5k star 的库都不一定有。已产出真实发现：`_icons` 缺 `PURE` 注解导致"引 1 个图标背 67 个"、`domAnimation` 占 Button 首屏约 3/4。

---

## 4. 三块短板（它们如何伤害"搭积木"这件事）

### 4.1 ✅ 测试基座（2026-08-01 已解决）

**原现状**：388 个测试文件全部 jsdom。当时分支正在「为 vite8 / jsdom 升级铺前置」。

**已执行**：没有升级 jsdom，而是切了 Vitest browser mode（Playwright provider）。双 project 分流，现存测试零改动，5 个高危交互组件（Kanban / Carousel / Resizable / SwipeAction / Sortable）共 23 个用例迁入真实 chromium。详见 `docs/testing.md`。

下面保留当时的诊断，因为它解释了**为什么必须迁**：

#### 为什么这直接影响"搭积木"

积木要被反复复用，前提是**它是对的**。而当前基座测不到的，恰好是积木里最复杂的那些（拖拽、画布、动画、WebGL、图表、视频）——也就是最难手工复查、最需要测试兜底的部分。

#### 证据：这套基座已经系统性地骗过你

以下全部已落成 skill 或 memory，性质统一为"jsdom 说没问题，真实浏览器里是坏的"：

| 坑 | 根因性质 |
|---|---|
| `jsdom :scope > span` 把嵌套 span 也计入 | nwsapi 选择器语义不符标准 |
| React Offscreen 重连时 `ref.current` 为真但 `.style` 是 `undefined` → 崩 | **原始记录：jsdom 测不到，须真机验** |
| recharts headless 截图空白 —— rAF 驱动的 clipPath 入场动画被饿死 | 无渲染循环 |
| jsdom `dragover` 坐标为 NaN，逻辑落到最后一个分支 | 无布局引擎 |
| WebGL canvas `loseContext` 毒化 StrictMode remount | 无 GPU 上下文 |
| WAAPI 动画 `currentTime` 冻结在 0 | 无合成器 |

**最严重的一次漏检：**

> **Kanban 整卡拖拽此前完全失效** —— 根因是无边界的 `closest` 命中了 dnd-kit 给的 `role="button"`。
> 记录在案的原因：**"孤立 createElement 测试测不到"**。

388 个测试全绿，却漏掉"整张卡片拖不动"。这不是测试写少了，是**基座测不到那一层**。而 Kanban 正是 CRM demo 这块积木的核心。

#### 你已经在体外重建 browser mode 了

为验证 jsdom 测不了的东西，本项目已积累这一整套一次性基础设施：裸 CDP 连接（Node 22 WebSocket + 缓存 chromium）、MCP 浏览器被占时启动隔离 Chromium、CDP 截图必须连 page target 的 ws、headless 下要 `Emulation.setEmulatedMedia` 设 `reduce` 才能让图表显形、亚秒级动画定时截图、布局验证必须截图不能 DOM eval、Turbopack 冷路由要预热。

**这些脚本干的活，正是 browser mode 内置提供的。**

#### 迁移策略（不必 388 个全迁）

| 分层 | 内容 | 基座 |
|---|---|---|
| 纯逻辑 | `flow-geometry`(11 测)、`computeFit`、日期数学、Scheduler 几何 | node 环境即可（连 jsdom 都不需要） |
| DOM 契约 | props → 渲染结果、aria、受控/非受控 | jsdom 保留（快、够用） |
| **交互/视觉** | 拖拽（Kanban/Flow/Scheduler）、动画、WebGL、图表、Video、overlay 定位、焦点环 | **browser mode 必须** |

**顺序提醒**：这条应该**先于** jsdom 升级动作决策，否则升完再改是白做一遍。

---

### 4.2 ✅ emotion / MUI 桥：已整族切除（2026-08-01）

原问题：为了 **Rating / Stepper / 日期族**，全库拖着 `@mui/material` + `@mui/x-date-pickers` +
`@emotion/*` 四个依赖。`@emotion` 是 **runtime CSS-in-JS**，2026 已被明确判死：运行时开销 +
**不兼容 RSC** —— 而瑚琏 `llms.txt` 里大量组件标着「零依赖 · RSC」，MUI 桥是这套叙事上唯一的污点。
它还产生了一条额外心智负担：桥接族必须置于 `MuiBridgeProvider` 之内，否则真实浏览器里抛
`Unsupported color`（正是 AI 最容易违反的那类隐式约束，见 §2 L3）。

**已完成**：

| 组件 | 处置 |
|------|------|
| `Rating` / `Stepper` | 自研零依赖重写（0.14.0） |
| `Calendar` | 自研零依赖新件，三层下钻面板 |
| `DatePicker` | 自研（原 `DateField` 改名），弹层里复用 `Calendar` |
| `DateTimePicker` | 自研，左日历 + 右时间列 |
| `TimeField` | 自研分段键盘输入（`role="spinbutton"`，两位缓冲覆写） |
| `TimePicker` / `DateRangePicker` | 本就是自研零依赖 |

**结果**：`src/_mui/` 目录删除、四个包从 `dependencies`/`peerDependencies` 全部移除、
`@hulianui/ui/date-pickers` 子路径入口移除、`MuiBridgeProvider` 不复存在。
消费方现在**没有 optional peer、没有子路径入口、没有必须挂的第三方 Provider**。
`scripts/bundle-size.sh` 加了反向断言：`@mui/*` / `@emotion/*` 出现在任何一类依赖里即失败。

顺带暴露并修复一个潜伏缺陷：`recharts` 3.x 把 `react-is` 声明为 **peerDependency**，而瑚琏既没装
也没声明 —— 此前一直靠 MUI 的依赖链蹭到。MUI 一走，体积门禁当场 `Could not resolve "react-is"`。
已补进 `dependencies`（recharts 是我们的 dependency，它的 peer 就该由我们兜住）。

---

### 4.3 🟡 分发形态：积木注入不了，是 L2 的技术前提

**现状**：发 `src/` TSX 源码（不发 dist），但消费方式是 `npm install` + `import`。

**已付出的成本**（全在 README 与 `docs/consuming.md`）：

| 成本 | 表现 |
|---|---|
| Next.js 配置税 | 必须 `transpilePackages` +（webpack dev）成对加 `experimental.optimizePackageImports`，否则冷编译慢数倍 |
| Tailwind 扫描税 | 必须 `@source "../node_modules/@hulianui/ui/src/**/*.{ts,tsx}"` |
| 测试解析税 | Vitest 易解析出第二份 React → 专门做了 `@hulianui/ui/vitest-preset` |
| dev server 税 | 软链消费会坏 → 专门做了 `@hulianui/ui/vite` 插件 |
| 类型版本税 | TS≥6 消费方 `import Video` 报 TS2882 |
| CI 税 | 专开 `consumer-smoke` job 防复发 |

**没拿到的收益**：① 不拥有代码，下游改不了；② **agent 无法注入单个组件/区块/页面**；③ 不在任何 registry 生态里。

其中 **②正是 L2 的技术前提**——没有它，"AI 把你的登录页积木写进新项目"这件事做不到。

#### 物证：registry.json 有壳无肉

```json
"$schema": "https://ui.shadcn.com/schema/registry.json"
```

367 条 item 字段并集实测：

```
['categories', 'dependencies', 'description', 'meta', 'name', 'title', 'type']
有 files 字段的条目数： 0        ← shadcn registry item 的必填字段
type 分布：{'registry:ui': 367}
```

**缺 `files` ⇒ 任何 shadcn 兼容工具（含 AI agent）都装不了一个组件。** 90% 的元数据都已生成，差最后一个字段。

**动作**（1–3 天）：
- `scripts/gen-llms-registry.mjs` 补 `files: [{path, type}]`
- 补 `cssVars` / `tailwind` 导出 OKLCH token
- **扩展到区块与页面**：`type: "registry:block"` / `"registry:page"`，把 28 区块 + 19 页面 + 18 demo 纳入
- 静态导出 `/r/[name].json`（`apps/www` 已是 `output: export`）
- 验收：空项目里 `npx shadcn add https://<domain>/r/admin-list-page.json` 能装出一个完整列表页

#### 为什么借 shadcn 的 schema，而不是自造一个格式

这里必须说清楚，**理由与"对接社区生态"无关，三条全是自用收益**：

1. **格式已经被设计好了** —— `files` / `dependencies` / `registryDependencies` / `cssVars` 这套字段是别人踩完坑定下来的，自造要重踩一遍
2. **安装器现成** —— `npx shadcn add` 直接可用，不必自己写 CLI、自己处理路径解析与依赖递归
3. **AI 天生就认识这个格式** ← **决定性的一条**

第 3 条尤其关键：所有主流 AI 模型的训练数据里都有大量 shadcn registry，**用这个格式，AI 不需要学就会用；自造格式，每个新 session 都得先教它**。这与"让 AI 只能搭积木"的目标直接相关——你要的是零解释成本，不是格式所有权。

**借格式 ≠ 进生态。** registry 端点可以只挂在你自己的域名下，不提交任何目录、不做任何推广，纯粹给你自己的 AI 用。

---

## 5. 主线：把主见固化成 AI 必须遵守的东西

这一节是整个项目的**目的**，前面所有内容都是它的支撑。

### 5.1 L1 — MCP server（`@hulianui/mcp`）

数据源全部现成，几乎零新代码：

```
list_blocks(kind?)            → registry.json（组件 / 区块 / 页面 三种 kind）
get_doc(name)                 → <slug>.md
install(name, targetPath)     → 依赖 §4.3 的 files 字段
get_conventions(scope?)       → 铁律与约束（见 5.3）
```

**效果**：AI 开新项目时不再吞 `llms-full.txt`、不再猜签名，而是"先问库里有什么"。

**这是你个人开发速度的直接乘数**，且因为你本来就用 Claude Code，注入点（CLAUDE.md → MCP）是现成的。

### 5.2 L2 — 让区块与页面成为一等积木

当前 28 区块 + 19 页面 + 18 demo 只活在文档站。要让它们变成积木，需要：

1. **进 registry**（`registry:block` / `registry:page` 类型 + `files` 指向真实源码路径）
2. **标注可裁剪点**（哪些是 mock 数据、哪些是示意文案、哪些必须替换）
3. **声明依赖链**（这个页面用了哪些组件、需要哪些 provider）

做完之后，"AI 从零到一"的形态从：

```
❌ AI 自己想一个列表页 → 手搓 layout → 用它熟悉的 shadcn
```

变成：

```
✅ AI 查 registry → 找到 admin-list-page → 注入源码 → 只改业务字段
```

**这才是"搭积木"字面意义上的实现。**

### 5.3 L3 — 硬约束 schema（真正防止 AI 发挥）

组件的使用约束目前散在 markdown 散文与 skill 里，AI 读不到就违反。这些约束**是可结构化的**：

| 约束类型 | 实例 |
|---|---|
| **必须被包裹** | 主题相关 → `ThemeProvider`（0.15.0 起没有别的强制 Provider） |
| **prop 值域必须是 token** | 色彩必须 `var(--color-*)`；间距走 token；禁止裸值 |
| **互斥 / 依赖 prop** | `AdminLayout.fitViewport`；`Table.density` |
| **禁止项** | 禁止 `style=` 覆盖；禁止局部 CSS 打补丁；**缺能力回库修组件，不在业务里绕路** |
| **易混淆兄弟件** | Badge↔Tag、Divider↔Separator、StatusDot↔DeployStatus、Heading 无 `md` 档 |

把这些变成 schema，让 AI 在**写代码时**拿到，而不是在**运行时**报错、或者靠你事后 review 抓。

据本次调研，**没有任何头部库在做这一层**（shadcn 的 registry 只描述"如何安装"，不描述"如何正确使用"）。这既是无人区，也恰好是你的目的本身。

### 5.4 L4 — 跨栈：前端只是三分之一

你的目标里还有**后端框架（PHP + Java）**。关键判断：

> **registry + MCP + 约束 schema 这套机制是栈无关的。**

| 栈 | 积木现状 | 机制 |
|---|---|---|
| 前端 | 368 组件 + 28 区块 + 19 页面 + 18 demo | 待接 registry/MCP |
| PHP | 散落在 GYJ2 / OSM2 各项目里（ThinkPHP / FastAdmin 体系） | 未沉淀 |
| Java | 散落在 GYJ2 `ch_backend`（Spring Boot 3.x） | 未沉淀 |

**建议顺序**：先把前端这套跑通（它积木最全、验证最快），机制成立后再复制到 PHP / Java。不要三条线并行——先证明这套机制真的能让 AI 少发挥，再推广。

> 你提到的另一个后端栈（语音输入为"拍摄"）需要确认具体是什么，本文按 **Java（Spring Boot）** 暂记。

---

## 6. 技术选型对照（仅用于验证前沿性）

> 不作市场竞争分析，只回答"我押的技术是不是这一代最新的"。

| 库 | Star | 最后 push | 行为层 | 样式 | 与瑚琏的关系 |
|---|---|---|---|---|---|
| shadcn/ui | 120,231 | 2026-07-31 | Radix | Tailwind | registry 协议参照物；颜色系统同代但只有单层 |
| ant-design | 98,885 | 2026-07-31 | 自研 | CSS-in-JS | 企业组件语义参照 |
| material-ui | 98,656 | 2026-07-31 | 自研 | emotion（runtime） | ~~`_mui` 引用它~~ → 2026-08-01 已切除，见 §4.2 |
| react-bits | 44,579 | 2026-07-31 | 无 | Tailwind | 已移植 107 件 |
| daisyUI | 41,894 | 2026-07-30 | 无 | 纯 CSS 插件 | — |
| chakra-ui | 40,543 | 2026-07-31 | Ark | CSS-in-JS | — |
| mantine | 31,514 | 2026-07-31 | 自研 | CSS Modules | 文档站 playground 参照 |
| heroui | 30,264 | 2026-07-31 | React Aria | Tailwind | — |
| **headlessui** | 28,682 | **2026-04-13** | 自研 | 无 | ⚠️ **停更 3.5 个月**——未选它是对的 |
| magicui | 21,756 | 2026-07-31 | 无 | Tailwind | 已覆盖 18 件 |
| radix/primitives | 19,108 | 2026-07-31 | 自研 | 无 | 上一代；已转 WorkOS 维护 |
| tremor-npm | 16,458 | 2026-07-31 | — | Tailwind | Chart 选型时否决过 |
| **mui/base-ui** | **10,505** | **2026-07-31** | 自研 | 无 | ✅ **你的地基，当代最新** |
| radix/themes | 8,581 | 2026-07-31 | Radix | 自有 | — |
| arco-design | 5,648 | 2026-07-30 | 自研 | Less | — |
| keenthemes/reui | 3,194 | 2026-07-31 | **Base UI** | Tailwind v4 | 唯一同代同栈（2025-02 建仓） |

**已归档 / 停滞名单**（说明范式更替速度）：`primereact` 8,322 归档 · `geist-ui` 4,557 归档 · `Shopify/polaris-react` 6,172 废弃 · `vmware/clarity` 6,398 归档 · `tremorlabs/tremor` 2025-10 停更 · `headlessui` 2026-04 停更。

**读法**：这些项目的技术栈定格在了它们停更那一年。**你的积木要能用十年，靠的不是组件更多，而是每一层地基都踩在当代**——这就是 §4 三条的意义。

---

## 7. 可执行清单（按"离目标的距离"排序）

### ✅ P0 —— 让 AI 真的只能搭积木（2026-08-01 三件全部落地）

| # | 动作 | 状态 | 达成级别 |
|---|---|---|---|
| 1 | registry 补 `files` + `cssVars`，扩展 `registry:block` / `registry:page` | ✅ `5c3f23f` | **L2** |
| 2 | `@hulianui/mcp` 四个 tool | ✅ `2220034` | **L1 + L2** |
| 3 | 约束 schema，接进 MCP `get_conventions` | ✅ `2220034` | **L3** |

**成熟度从 L0.5 跃到 L3。** 具体成果：

**registry（447 个可装 item）** —— ui 367 + lib 3 + block 57 + page 20。端到端验收用的是**真实 `npx shadcn add`**，不是模拟：
- `button.json` → 创建 17 个文件，递归带出 `_icons`/`lib`/`motion`，cssVars 自动注入 globals.css
- `block-pricing-table.json` → 创建 1 个文件，只依赖 `@hulianui/ui`
- 注入后所有 `@/` import 解析成功（3/3），零断链

途中修掉一个会让真实安装**必然失败**的问题：`registryDependencies` 原本输出裸名，而 shadcn CLI 把裸名解析到**官方** registry——写 `_icons` 只会让它去 ui.shadcn.com 找一个不存在的东西。

**MCP（4 tool + 10 个端到端用例）** —— 起真实子进程走 stdio JSON-RPC，不 mock。数据源本地优先（`HULIAN_UI_ROOT`），改完源码即刻生效、零网络。

**约束（8 全局 + 4 易混淆 + 986 条组件级）** —— 组件级从 360 个 md 的「禁忌 / 坑」章节自动提取，不会与文档漂移。

> **核对时纠正了一条记忆偏差**：`ToastTone` 实际是五档 `neutral|info|success|warning|danger`，不是三档。
> 写错的约束比没有约束更糟——所有手写约束都逐条核对了源码取值。

### ✅ P0.5 —— 积木可靠性（2026-08-01 已完成基座切换）

| # | 动作 | 状态 |
|---|---|---|
| 4 | **测试基座切 Vitest browser mode** | ✅ **已落地**，见 `docs/testing.md` |

**已完成**：双 project 分流（`unit`=jsdom / `browser`=真实 chromium），按文件名 `*.browser.test.tsx` 路由，现存测试零改动。389 文件 / 3298 用例全绿，`pnpm typecheck` 退出码 0，CI 已加 `playwright install chromium`。

**三向验证结果**（Kanban 整卡拖拽）：

| 场景 | 结果 |
|---|---|
| 正确代码 + browser | ✅ 3/3 通过 |
| 注入历史 bug + browser | ❌ 精确变红 → **测试确实有效** |
| 正确代码 + jsdom | ❌ **假红，报错一字不差** → **jsdom 下「正常」与「完全失效」不可区分** |

第三行实证了那个 bug 当年为何能溜过 388 个全绿测试。

**剩余工作**：按 `docs/testing.md` 的待迁清单分批迁移（`setPointerCapture` 2 个文件优先级最高——jsdom 下该 API 是 no-op，等于完全没测）。

### 🟡 P1 —— 消除旧范式

| # | 动作 |
|---|---|
| ~~5~~ | ~~重写 Rating / Stepper / DatePicker，删 `_mui` 整族，切掉 emotion runtime~~ → **2026-08-01 已完成**，见 §4.2 |
| 6 | 重依赖转 optional peer（`@tiptap/*` / `@vidstack` / `ogl` / `recharts`），`dependencies` 27 → ≤10 |
| 7 | CI 接 axe-core a11y 门禁（依赖 #4） |

### ⚪ P2 —— 跨栈复制

| # | 动作 |
|---|---|
| 8 | 机制在前端验证成立后，复制到 PHP / Java：各自的积木 registry + 同一套 MCP 接口 |
| 9 | 原生 CSS 动效替换部分 JS 动效（`@starting-style` / `interpolate-size` / View Transitions / scroll-driven），削减 `motion` 首屏占比 |

---

## 8. 明确不做（避免偏离目的）

- ❌ **不要为了"库要完整"而造组件**。正确飞轮是 `docs/HULIAN-GAPS.md` / `gap-matrix.md` 那种「下游缺什么 → 回库补什么」。反向案例：`/demos/billing` 是为 dogfood 8 个新组件而建的 demo，方向倒了
- ❌ 不再做 react-bits / Magic UI 的增量移植（对"AI 搭积木"零贡献，维护面积为正）
- ❌ 不碰行为层（不要试图替换或自研 Base UI）
- ❌ 不退回编译分发（发 dist 会同时丢掉 L2 的可能）
- ❌ 不引入新的 runtime CSS-in-JS 依赖
- ❌ 不追 star / 下载量 / 商业化（不是目标，会扭曲优先级）
- ❌ 不三条栈并行（前端跑通再复制）

### 8.1 纯自用下，可以停止的社区向投入

项目此前有一部分投入是按"开源产品"的惯性做的。既然**首先是为自己服务**，这些可以停下来，把时间释放给 §7 的 P0：

| 投入 | 判定 | 理由 |
|---|---|---|
| SEO / GSC 收录 / 百度 / 掘金·dev.to 反链文章 | 🛑 **停** | 纯粹为陌生人被发现，对你零收益 |
| README.en.md / CONTRIBUTING.md / CODE_OF_CONDUCT.md / SECURITY.md | 🛑 **停止维护**（不必删） | 面向外部贡献者，而你不会有外部贡献者 |
| 追 star / npm 下载量 | 🛑 **停** | 不是目标，且会扭曲优先级（会诱使你造"好看但用不上"的组件） |
| 文档站中国镜像双站部署 | ❓ **看用途** | 若为你自己在国内访问快 → 保留；若为国内访客 → 停 |
| npm 公开发布 + MIT | ✅ **保留** | 零成本，且是你分散的下游仓库（独立 repo，非 monorepo）最省事的取用方式 |
| changesets 版本管理 | ✅ **保留** | 你自己的下游需要版本约束，防止升级把线上项目改坏 |
| **文档站本身** | ✅ **保留且升级** | 它不是"给社区看的官网"，是**你自己的积木目录**——§5.2 之后它还要变成 AI 的取用入口 |
| 18 个 demo | ✅ **保留** | 它们是最贵的积木（§1.3），只是需要变成 AI 可取用的形态 |

**释放出来的时间全部投向 §7 的 P0 三件事。**

---

## 9. 一句话

> 积木本身已经站在 2026（OKLCH / Base UI / Tailwind v4 / TS7 / 体积门禁）；
> 但**积木只对人可见，对 AI 不可见**——最贵的 28 区块 + 19 页面 + 18 demo，零可取用性；
> 而"**让 AI 在我的主见上搭积木**"这件事，2026 还没有人做完，
> 你已经有了全部原材料，差的是把主见从散文变成 schema。

---

## 附：数据来源

- GitHub REST API（`gh api repos/*`）逐仓核对，2026-08-01 实测
- 本地实测：`packages/ui/package.json`（27 dependencies）· `scripts/size-limits.json` · `apps/www/public/registry.json`（367 items 字段并集）· `.github/workflows/ci.yml`（4 job）· `find packages/ui/src -name "*.test.*" | wc -l` = 388 · `ls packages/ui/src | wc -l` = 368
- 项目内既有记录：`docs/consuming.md` · `docs/enterprise-roadmap.md` · `docs/blocks-gap-roadmap.md` · `docs/component-issues-audit-2026-06-15.md`
- [shadcn/ui registry.json schema](https://ui.shadcn.com/docs/registry/registry-json) · [shadcn MCP Server](https://ui.shadcn.com/docs/mcp)
- [Top Headless UI Libraries for React in 2026 — GreatFrontend](https://www.greatfrontend.com/blog/top-headless-ui-libraries-for-react-in-2026)
