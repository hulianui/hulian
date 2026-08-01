# 瑚琏 Hulian 定位与现代性审计（2026-08-01）

> 瑚琏的目标不是单纯做一个组件库，而是把个人的设计与工程主见固化成 AI 可发现、可安装、可检查的积木系统。
>
> 本文只描述当前仓库可由代码和测试验证的状态。早期诊断保留在文末附录，不再与当前结论混写。

## 0. 当前结论

**前端侧已经达到 L3；整个“前端 + PHP + Java”目标仍停在 L3，L4 尚未开始。**

前端 L3 的闭环已经完整：

1. **发现**：MCP 能按 component / lib / block / page 检索和读取文档。
2. **安装**：447 个 registry item 可取用；20 个页面逐个在隔离项目里经真实 shadcn CLI 安装并 typecheck。
3. **接入**：57 个区块和 20 个页面带 Provider、必须替换内容和插槽元数据；页面会递归安装依赖区块。
4. **约束**：`conventions.json` v2 明确区分 6 条可执行规则与 1002 条建议；`@hulianui/guard` 以 AST 检查可执行规则，CI 会阻断错误级违规。
5. **验证**：CI 同时覆盖生成物漂移、registry 黑盒安装、guard、真实 Chromium 交互和固定路由 axe 扫描。

离最终目标还差的不是“前端再补一层协议”，而是两类后续工作：

- **L4 跨栈复制**：PHP / Java 尚未形成同构的 registry、MCP 和 guard。
- **前端持续覆盖**：18 个整站 demo 仍不是 registry 一等项；a11y 是 10 条代表路由而非全站穷举；更多布局、动画、canvas/WebGL 行为仍可按风险迁入 browser project。

因此，对“AI 能否在瑚琏前端主见上搭积木”的回答是：**核心链路已闭合**。对“所有技术栈是否都只能按同一套主见施工”的回答仍是：**还没有，L4 是明确边界。**

## 1. 权威数据

下列数字直接来自 `apps/www/public/registry.json` 与 `packages/ui/conventions.json`：

| 项目 | 当前值 |
|---|---:|
| registry 总 item | 447 |
| component (`registry:ui`) | 367 |
| lib (`registry:lib`) | 3 |
| block | 57 |
| page | 20 |
| 带安装接入元数据的 block + page | 77 / 77 |
| 有递归区块依赖的 page | 18 / 20 |
| 无区块依赖的 page | `page-login`、`page-result` |
| conventions schema | v2 |
| 可执行规则 | 6 |
| 建议规则 | 1002 |
| 易混淆组件组 | 4 |
| 真实浏览器交互用例 | 30（7 个文件） |
| axe 固定路由 | 10 |

可重复生成计数：

```bash
node -e 'const r=require("./apps/www/public/registry.json"); console.log(r.items.length)'
node -e 'const c=require("./packages/ui/conventions.json"); console.log(c.executableRules.length,c.advisories.length)'
```

## 2. 成熟度分级

| 级别 | 机制 | 当前状态 |
|---|---|---|
| L0 | CLAUDE.md / 普通文字规范 | 保留，作为人读入口 |
| L0.5 | `llms.txt` / `llms-full.txt` | 保留，作为无 MCP 时的降级入口 |
| L1 | MCP 按需发现组件与文档 | ✅ 已完成 |
| L2 | registry 可递归安装组件、区块和页面 | ✅ 已完成，并有 20/20 页面黑盒安装门禁 |
| L3 | 机器规则 + 可执行 guard + CI | ✅ 前端已完成 |
| L4 | PHP / Java 等后端栈采用同一套发现、安装、约束机制 | ❌ 未开始 |

这里的 L3 不等于“1002 条建议全部变成 AST 规则”。当前契约是刻意分层的：

- `executableRules`：能可靠静态判断的规则，由 `hulian-check` 执行。
- `advisories`：仍需语境或人工判断的建议，供 MCP 和文档使用，不伪装成可自动证明的规则。

这种边界比把所有散文都标成“强制约束”更可信。

## 3. 安装链路已经闭合

### 3.1 页面不再被误称为“全部自包含”

57 个区块通常可以单文件落盘；页面则不是同一种情况：

- 18 个页面引用一个或多个区块。
- 生成器把源码中的 `../../blocks/_blocks/<slug>` 改写为消费项目中的 `../blocks/<slug>`。
- 对应 endpoint 写入绝对 `registryDependencies`，由 shadcn CLI 递归安装。
- 任何未识别的相对导入都会让生成失败，不能带着断链进入 registry。

`page-login` 与 `page-result` 当前没有区块依赖，因此不需要递归安装。

### 3.2 黑盒验证不是共享目录冒烟

`pnpm registry:smoke:pages` 会：

1. 打包当前工作区的 `@hulianui/ui`，避免误用已发布旧版本。
2. 启动临时本地 registry 服务。
3. 为每个页面创建独立临时消费项目。
4. 用真实 `shadcn@latest add` 安装页面及递归依赖。
5. 对每个项目执行 TypeScript 检查。

20 个页面互不共享安装结果，因此前一个页面留下的区块不能掩盖后一个页面的依赖缺失。

### 3.3 复合积木告诉 AI “装完还要做什么”

77 个 block/page item 均提供安装元数据：

- `providers`：需要挂载的 Provider。
- `replace`：必须替换的示例数据、文案或业务回调。
- `slots`：可以继续组合或替换的区块插槽。

MCP 的 `install_block` 会把这些信息与递归依赖、安装命令和 `hulian-check` 命令一起返回。

## 4. 约束不再只是散文

`conventions.json` v2 目前覆盖五类可执行 matcher：

- 禁止 JSX prop
- 禁止 import
- import 必须有同伴
- 禁止调用形式
- CSS 变量前缀

`@hulianui/guard` 使用 TypeScript 5.9 compiler API 做 AST 与绑定分析，支持别名导入、深层导入和语法错误定位。退出码契约：

| 退出码 | 含义 |
|---:|---|
| 0 | 无错误级违规；warning 不阻断 |
| 1 | 存在错误级违规 |
| 2 | 参数、路径或执行本身失败 |

仓库内可执行：

```bash
pnpm guard -- apps/www/app/blocks/_blocks apps/www/app/pages/_pages packages/ui/src
```

消费项目可执行：

```bash
npx -y @hulianui/guard src
```

CI 还会跑 `pnpm conventions:check`，防止生成器与提交的 conventions 发生漂移。

## 5. 可靠性门禁

### 5.1 unit 与 browser 分工

jsdom 继续负责 props、DOM 契约、aria、受控/非受控和纯函数。真实 Chromium 负责布局、拖拽、指针、滚动与依赖浏览器渲染时序的行为。

目前 30 条 browser 用例覆盖：

- Kanban 跨列拖拽
- Carousel 滚动几何、合成指针与真实鼠标拖拽
- Resizable 分栏拖拽和边界夹取
- SwipeAction 跟手、阈值吸附和纵向放行
- Sortable 排序与 handle 模式
- RouteTabs 横向 HTML5 拖放落点
- Tree 上 / 中 / 下 HTML5 拖放落点与非法子树保护

所有状态更新事件按“一个事件 + 两个真实 animation frame”分别包进异步 `act()`。当前 browser suite 的 stderr 为 0，不再通过关闭 React act 环境掩盖警告。

### 5.2 axe 路由门禁

`pnpm a11y` 对静态导出的 10 条固定路由运行 Playwright + axe：

```text
/
/start
/blocks
/pages
/theme
/components/button
/components/pro-table
/components/dialog
/pages/admin-list
/pages/product-list
```

规则边界：

- critical / serious：阻断。
- moderate / minor：打印报告，暂不阻断。
- 路由或同源资源加载失败：阻断，不能伪装成零违规。
- 只忽略 Next 导航预取产生的 `fetch: net::ERR_ABORTED`。

当前 10/10 路由通过，blocking violation 为 0。组件文档页仍报告 `landmark-unique` moderate，已明确记录而不是静默过滤。

## 6. 技术现代性

| 维度 | 当前状态 | 判断 |
|---|---|---|
| 颜色与主题 | OKLCH 原始/语义双层 token、运行时 `[data-theme]` | 前沿 |
| 行为层 | Base UI + 自研复杂件 | 前沿 |
| 样式 | Tailwind v4 + 原生 CSS 变量 | 前沿 |
| 类型工具链 | TS7 主线，消费兼容性另有门禁 | 前沿但需持续兼容验证 |
| 体积 | `size-limits.json` + `pnpm size` | 有硬门禁 |
| 分发 | npm 源码消费 + shadcn registry 注入 | 两种消费方式均已验证 |
| AI 操作性 | MCP + registry + conventions v2 + guard | 前端 L3 |
| a11y | 10 路由 axe 门禁 | 已有代表性门禁，非全站穷举 |
| 真实浏览器测试 | 7 文件 / 30 用例 | 高风险交互已覆盖，仍可持续扩展 |

## 7. 仍然存在的前端债务

### 7.1 日期族仍有隔离的 MUI / emotion optional peer

Rating 和 Stepper 已经是自研零依赖组件，不再属于 MUI 桥。当前 MUI / emotion 只服务日期子路径：

```tsx
import { DatePicker, MuiBridgeProvider } from "@hulianui/ui/date-pickers";
```

这四个包是 optional peer，不使用日期族的消费项目不会安装它们：

- `@mui/material`
- `@mui/x-date-pickers`
- `@emotion/react`
- `@emotion/styled`

它仍是 RSC / zero-runtime 叙事中的隔离尾巴，但已不是根 barrel 的普遍成本。后续是否自研替换日期族，应按真实下游收益决定。

### 7.2 直接 runtime dependencies 仍有 22 个

当前 `packages/ui/package.json` 的 `dependencies` 是 22 个，不是历史文档里的 27 个。较重的 Tiptap、Vidstack、OGL、Recharts 等仍可评估是否拆成可选子路径，但不能只追求数字而破坏默认可用性。

### 7.3 demo、a11y 与浏览器覆盖仍非穷举

- 18 个 demo 是文档和 dogfood 资产，尚未成为 registry item。
- a11y 当前固定 10 条代表路由。
- browser project 当前优先覆盖已知高风险交互，不追求把所有单元测试机械迁走。

这些是持续工程，不影响前端 L3 的发现—安装—约束闭环成立。

## 8. 下一步顺序

| 优先级 | 动作 | 目的 |
|---|---|---|
| P0 | 在真实前端消费项目中持续使用 MCP → install → guard 链路 | 通过业务反馈修正规则与安装元数据 |
| P1 | 为 PHP 设计最小 registry + MCP + guard 契约 | 开始 L4，不复制前端实现细节 |
| P1 | 为 Java 设计同构契约 | 完成跨栈一致入口 |
| P2 | 按真实缺陷扩充 browser / a11y 路由 | 提高验证覆盖，不做机械迁移 |
| P2 | 评估日期族去 MUI 与重依赖拆分 | 以消费成本和维护收益为依据 |

## 9. 明确不做

- 不为了数量制造没有下游需求的组件。
- 不把 demo 自动当成可安装页面；先定义稳定边界和替换点。
- 不把无法可靠静态判断的建议伪装成 guard 错误。
- 不为了“纯度”贸然替换 Base UI 或破坏当前根入口。
- 不把前端 L3 宣称成跨栈 L4。

## 附录：2026-08-01 收口前的历史诊断

以下结论解释了本轮工作的来源，但**不代表当前状态**：

- registry 曾只有组件元数据，没有可安装 files，区块和页面对 AI 不可见。
- 页面源码曾保留 `../../blocks/_blocks/*` 仓库内路径，安装到消费项目会断链。
- conventions 曾把可执行约束与文档建议混在同一列表里，没有 checker。
- MCP 曾只能给出安装命令，不能说明递归区块、Provider、必须替换内容与插槽。
- browser suite 曾有 23 条通过用例，同时输出 186 条 React `act(...)` 警告。
- RouteTabs 和 Tree 的坐标落点测试曾依靠 jsdom 伪造 rect；现已迁入真实 Chromium，并通过生产逻辑变异验证。
- a11y 曾完全依赖组件库语义，没有固定路由 axe CI 门禁。
- 旧文档把 Rating / Stepper 和日期族一起描述为 MUI-backed，并把直接依赖数写成 27；两项都已过时。

## 相关入口

- `docs/testing.md`
- `packages/mcp/README.md`
- `apps/www/lib/ai-guide.ts`
- `docs/superpowers/specs/2026-08-01-hulian-l3-closure-design.md`
- `docs/superpowers/plans/2026-08-01-hulian-l3-closure.md`
