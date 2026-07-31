# 瑚琏前端 L3 闭环设计

**日期：** 2026-08-01  
**状态：** 待用户书面审阅  
**目标：** 让瑚琏从“AI 可以查询并复制积木”升级为“页面可完整安装、关键主见可自动校验、生成结果有持续门禁”的严格 L3。

## 1. 背景与成功标准

现代性审计确认组件技术地基已经成熟，但当前有两个阻断级缺口：18/20 个页面 registry item 安装后存在断裂的相对导入；`get_conventions` 返回的是自然语言提示，AI 可以不调用，也没有工具阻止违规代码进入项目。

本阶段完成时必须同时满足以下条件：

1. 447 个现有 registry item 保持可生成，20 个页面都能在空白消费方工程中经真实 shadcn CLI 安装并通过 TypeScript 检查。
2. 页面 item 明确声明页面到区块的依赖图；安装页面会递归安装所需区块，目标路径与重写后的 import 完全一致。
3. 约束数据区分“可执行规则”和“建议性知识”；可执行规则有稳定 ID、严重级别、匹配器和修复建议。
4. 新增独立的 `@hulianui/guard` CLI。`hulian-check` 对违规代码返回非零退出码，支持人类文本和 JSON 输出，并进入 CI。
5. 区块与页面都提供机器可读的依赖、Provider、mock/替换点与可裁剪信息；生成器缺少必填元数据时直接失败。
6. CI 对代表性文档页执行 axe-core 自动审计；现存高优先级假测试迁入 Chromium；浏览器测试不再输出 React `act(...)` warning。
7. 审计文档只描述当前事实，不再同时保留互相矛盾的“原状态”和“完成状态”。
8. 在真实下游 `php-hulianui-admin` 上完成一次隔离试验：安装页面、运行 guard、执行该项目自己的类型检查与构建，证明协议不是只在瑚琏 monorepo 内成立。

## 2. 范围拆分

这是一项前端 L3 闭环工程，按依赖关系分为五个可独立验收的子系统：

1. **Registry 完整性：** 页面依赖图、路径重写、真实安装门禁。
2. **约束执行器：** 可执行 schema、静态扫描 CLI、CI 接入。
3. **施工元数据：** 区块/页面的依赖、Provider、替换点与裁剪点。
4. **可靠性门禁：** axe-core、浏览器高危用例、测试输出降噪。
5. **状态收口：** MCP 输出、文档、统计数字、依赖现状一致。

整站 demo registry、重依赖拆到 `dependencies <= 10`、日期族去 MUI，以及 PHP/Java L4 是后续独立子项目。它们依赖本阶段产出的依赖图和 guard 协议，不与本阶段并行，避免同时改变安装协议、公共导出面和跨仓接口。本阶段结束不把完整愿景标为完成，只把“前端严格 L3”标为完成。

## 3. Registry 设计

### 3.1 页面到区块的显式依赖图

生成器解析页面源码的相对 import，例如：

```ts
import { HeroBlock } from "../../blocks/_blocks/hero";
```

生成后的页面文件改写为目标工程路径：

```ts
import { HeroBlock } from "../blocks/hero";
```

页面 item 同时生成完整 URL 形式的 `registryDependencies`：

```json
[
  "https://hulianui.haloritual.com/r/block-hero.json"
]
```

页面仍落到 `components/hulianui/pages/<slug>.tsx`，区块落到 `components/hulianui/blocks/<slug>.tsx`。两者只保留这一种目录约定。

### 3.2 为什么不把所有区块内联进页面

考虑过三个方案：

- **页面单文件内联所有区块：** 安装最简单，但同一区块会被复制多次，无法单独升级。
- **页面携带多个 files：** 能工作，但页面 item 与区块 item 出现两套真源，容易漂移。
- **页面声明 registryDependencies：** 复用现有 shadcn 递归安装协议，区块保持单一真源。

采用第三种。它与组件内部依赖已经使用的机制一致，也最容易建立自动验证。

### 3.3 真实安装门禁

新增黑盒 smoke 脚本：

1. 在临时目录创建最小 React/TypeScript 消费方。
2. 启动只服务本地 `apps/www/public` 的临时 HTTP server。
3. 对 20 个页面逐一运行真实 shadcn CLI。
4. 每个页面使用独立临时工程，防止上一个页面留下的区块掩盖漏依赖。
5. 安装 `@hulianui/ui` 和 item 声明的 npm dependencies，执行 `tsc --noEmit`。
6. 任一 unresolved import、漏依赖、目标覆盖冲突均使 CI 失败。

生成器另有快速单元测试，覆盖路径重写、依赖去重、未知相对 import 拒绝生成。黑盒 smoke 验协议，单元测试负责快速定位。

## 4. 可执行约束设计

### 4.1 数据分层

`conventions.json` 升级为版本 2：

```ts
interface ExecutableRule {
  id: string;
  severity: "error" | "warning";
  matcher:
    | { kind: "forbidden-jsx-prop"; package: string; prop: string }
    | { kind: "forbidden-import"; from: string; names?: string[] }
    | { kind: "required-import-companion"; from: string; require: string }
    | { kind: "forbidden-call"; object: string; members: string[] }
    | { kind: "css-var-prefix"; attributes: string[]; prefix: "--color-" };
  message: string;
  instead?: string;
}

interface AdvisoryRule {
  id: string;
  component?: string;
  rule: string;
  source: string;
}
```

只有能稳定静态判断、低误报的规则进入 `executableRules`。从 328 个组件文档提取的自然语言坑保留为 `advisories`，不再宣称它们全部是“硬约束”。

第一批必须执行的规则：

- 瑚琏组件禁止业务侧 `style` 覆盖。
- 日期族禁止从根 barrel 导入。
- 使用日期族时必须同时可见 `MuiBridgeProvider`；跨文件无法证明时给 warning，不报 error。
- 禁止 `toast.success()` 等成员调用。
- JSX `fill`、`stroke` 及静态 style 色值中的 `var(--x)` 必须使用 `--color-` 前缀。

TypeScript 已能阻止的错误，例如 `Heading size="md"`、`Badge variant`，不重复造一套规则。

### 4.2 `@hulianui/guard`

新增 workspace 包 `packages/guard`：

- `hulian-check [paths...]`：扫描 `.ts/.tsx`，默认扫描 `src`、`app`、`components`。
- `--format text|json`：供本地与 CI 使用。
- `--config <path>`：允许下游覆盖扫描路径，但不能静默关闭 error 级全局规则。
- 退出码：无 error 为 0，有 error 为 1，配置或解析失败为 2。

解析使用项目已经依赖的 TypeScript compiler API，不引入新的解析器。扫描器只识别从 `@hulianui/ui` 或日期子路径导入的真实绑定，避免把普通 HTML 元素的合法内联样式误报。

### 4.3 MCP 与 CI 的边界

MCP 继续负责施工前的发现与解释：

- `get_conventions` 返回可执行规则摘要及组件 advisory。
- `install_block` 返回安装后必须运行的 `hulian-check` 命令。

Guard 负责施工后的确定性判定。CI 同时运行 `pnpm conventions:check` 和 guard 自身测试，确保生成产物未漂移。MCP 不再被描述成“强制 AI 调用”，真正的强制点是生成结果无法通过 guard/CI。

## 5. 施工元数据设计

区块与页面 `_meta.ts` 的每个条目新增：

```ts
interface CompositeMeta {
  providers: string[];
  replace: Array<"mock-data" | "copy" | "navigation" | "assets" | "event-handlers">;
  slots: string[];
}
```

- `providers` 只列组件树外必须存在的 Provider；无则显式 `[]`。
- `replace` 是落地业务前必须检查的内容；无则显式 `[]`。
- `slots` 描述可删除或替换的页面段落，例如 `hero`、`pricing`、`faq`。
- `registryDependencies` 从源码 import 自动得出，不由人手维护。

生成器把这些字段写入 item 的 `meta.installation`。元数据缺失或与源码依赖不一致时生成失败。MCP 列表保持简短，`install_block` 才输出完整施工清单。

## 6. 可靠性设计

### 6.1 axe-core 门禁

生产构建完成后，用 Playwright 打开静态导出的代表性页面并注入 axe-core。首批路由覆盖：首页、组件详情、区块目录、页面目录、主题页，以及表单/表格/overlay/中后台布局各一条代表页面。

规则口径：

- `critical`、`serious` 零容忍。
- `moderate` 先输出报告，不阻断；每条豁免必须带 rule ID、路由、原因和到期日期。
- 扫描失败或页面加载失败视为 CI 失败，不能当成“无违规”。

### 6.2 Browser mode 收口

优先迁移仍在 jsdom 中 mock `setPointerCapture`、原生 drag 坐标和关键几何断言的测试。每条迁移必须做一次 mutation 验证：把对应生产逻辑临时改坏时测试应精确变红。

现有 23 个 Chromium 用例中的 React `act(...)` warning 必须清零。测试命令将 stderr warning 视作待修缺陷；不能简单过滤字符串。

## 7. 文档与状态口径

`docs/modernity-audit-2026-08.md` 改为当前快照：

- 不再保留已过期段落作为正文；历史诊断移到附录。
- 统计由生成脚本输出，文档引用生成值，避免手填 27/22、998/1006 这类漂移。
- L3 只有在页面 smoke、guard CI、a11y 门禁全部通过后才能标记完成。
- 清楚区分“前端 L3 完成”和“跨栈 L4 未开始”。

## 8. 错误处理与兼容性

- 生成器遇到无法映射的页面相对 import 时立即失败，并报告页面、import 和期望目标。
- Guard 遇到无法解析的文件返回退出码 2；不能跳过后继续报成功。
- `conventions.json` 保留版本字段；MCP 同时兼容 v1/v2 一个发布周期，随后只支持 v2。
- Registry item 名称、现有组件/区块 URL 和 npm 根入口保持不变。
- 日期族 optional peer 现状保持不变，本阶段不草率重写复杂日期输入。

## 9. 验收命令

最终必须以当前工作树重新执行并全部成功：

```bash
pnpm docs:all
pnpm registry:smoke:pages
pnpm --filter @hulianui/guard test
pnpm --filter @hulianui/mcp test
pnpm --filter @hulianui/ui exec vitest run --project browser
pnpm typecheck
pnpm test
pnpm size
pnpm --filter www build
pnpm a11y
git diff --check
```

此外人工核对 20 个页面 endpoint 都有非空 `registryDependencies` 或确实无相对区块依赖，所有 77 个 composite item 都有完整 installation metadata。

### 9.1 真实 PHP 管理后台消费方试验

用户指定 `php-hulianui-admin` 为最终真实消费方。当前本机未发现同名工作副本；GitHub 账号下发现候选仓库 `Zhanglala103838/hulian-admin`，其默认分支描述为 ThinkPHP 8 + Vue 3，并提到 React 19，但当前默认分支树中只看到 `web/` Vue 工程。开始下游试验前需要用户确认它是否就是目标仓库，或提供实际本地路径/远程地址。

确认后按以下口径执行：

1. 使用临时 clone 或独立 git worktree，不污染用户正在开发的工作目录。
2. 不推送、不部署、不改数据库；试验只涉及前端依赖、页面源码和本地验证配置。
3. 若仓库含 React 19 前端，直接安装一个代表性管理页面并运行 `hulian-check`、typecheck、test、build。
4. 若只有 Vue 前端，则该项目只能验证 PHP API/业务契约，不能伪装成 React UI 消费方；需要先找到用户所指的 React 前端位置。
5. 试验发现的通用问题必须回到瑚琏修复，再重新生成 registry 并从干净下游环境复测，不能在下游打临时补丁掩盖组件库缺口。

## 10. 后续子项目

前端严格 L3 通过真实下游项目验证后，依次单独设计：

1. 整站 demo 变成多文件 registry template。
2. 重依赖组件移出根 barrel，默认 dependencies 收敛到 10 个以内。
3. 日期族去 MUI/emotion。
4. PHP 与 Java 分别建立积木 registry，并复用 guard rule envelope 与 MCP tool 语义完成 L4。

这些后续项不能用本阶段的测试替代验收，也不计入本阶段“前端 L3 完成”。
