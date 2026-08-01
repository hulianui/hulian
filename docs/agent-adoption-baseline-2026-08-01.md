# 组件采用基线 · 2026-08-01

为 [#41](https://github.com/hulianui/hulian/issues/41) 建立实证基线：扫描本机 `code/` 下
**8 个真实消费 `@hulianui/ui` 的项目**（非 `apps/www` 内的示例），回答三个问题 ——
366 个组件真实用了多少、Agent 是否真的会退化成低层原语、#41 提的 8 个场景 profile
是否对得上真实场景。

复现：

```bash
node scripts/agent-adoption-scan.mjs          # 摘要
node scripts/agent-adoption-scan.mjs --json   # 完整数据
```

## 结论先说

1. **契约与采用率之间存在强相关，但这不是因果实验。** 6 个在 `CLAUDE.md` / `README.md`
   里写了瑚琏硬规则的项目，手搓信号合计 **12 处**；唯一没写的 `quay` 一个项目就 **89 处**
   （69 处裸 `<button>`）。#41 的 P0 方向成立，其论证也应该换成这组数据而不是
   「Agent 默认会退化」的推测 —— 但样本是 6 比 1，且 `quay` 同时带着版本旧
   （`^0.9.0`，落后 6 个 minor）、Tauri 桌面技术栈、项目规模不同三个混杂变量。
   它足以支持「把契约做成可安装的」这个方向，不足以支持「装了契约就会提升采用率」。
2. **37.7% 的覆盖率不该当成一个指标看。** 它至少要拆成两类完全不同的缺口：
   「有场景却没采用」（如 `mobile` 7 个只用了 1 个，而 5069tk 确实做了 6 个 H5 页面）
   和「这批项目根本没这类场景」（如 `decoration` 91 个只用 10 个）。前者是 #41 要解决的
   采用问题，后者是库存结构问题，混在一起会把 #41 引向「凑覆盖率」。
3. **#41 列的 8 个 profile 与真实场景对不上。** 真实存在但缺席的有桌面应用、演示原型；
   `marketing-brand` / `data-dashboard` / `mobile-performance` 在这批项目里不作为独立场景
   存在；而 `existing-project-audit` / `component-dogfood` 根本不是场景，是工作流。

## 口径

| 项 | 取值 |
|---|---|
| 扫描根 | `~/Desktop/code`，自动发现 `package.json` 依赖 `@hulianui/*` 的一级子目录 |
| 组件真源 | `apps/www/public/registry.json` 的 366 个 `registry:ui`，按 `meta.exports` 把 symbol 反查回 slug |
| 计数 | 只算值导入；`import type` 不算「用了组件」 |
| 去重 | `jinshu-release` 与 `jinshu` 是同一 package 的快照，只算代码量大的那份 |
| 手搓信号 | JSX 里的裸 `<table>`/`<button>`/`<input>`/`<select>`/`<textarea>`/`<dialog>`、内联 `style={{`、硬编码 `text-[#...]`、自制 `fixed inset-0` 遮罩 |

已知偏差，读数时须一并考虑：

- 只统计**直接 import**。组件递归组合（如 `ProTable` 内部用了 `Table`）不计入，真实
  「被渲染过」的组件数高于 138。
- 裸 `<button>` 不等于错。图标热区、`asChild` 场景、桌面端自定义控件都可能是合理的；
  这个数只用于跨项目横比，不能单条当作缺陷。
- 契约识别按关键词（`hulianui` 提及 + 「100%/铁律/硬规则/回库/不打 CSS 补丁」类措辞），
  是粗判，不是语义理解。

## 发现一：契约 vs 手搓，一组天然对照

| 项目 | 性质 | 契约 | slug | 手搓 | 接入 |
|---|---|---|---|---|---|
| `jinshu` | 简历智能体 C 端 + 招聘 B 端 | ✅ CLAUDE.md | 76 | 8 | registry |
| `5069tk` | 初中题库管理 Demo（Web 后台 + H5 双端） | ✅ CLAUDE.md | 69 | 2 | link: |
| `ai-key-vault` | 密钥保险库 + 用量看板 + 模型网关 | ✅ CLAUDE.md | 51 | 1 | registry |
| `abel-site` | 个人站 | ✅ README | 30 | 0 | link: |
| `mock-pilot` | Mock 数据工作台 | ✅ README | 29 | 1 | link: |
| `ins-admin` | Ins 下载器运维后台 | ✅ README | 27 | 0 | registry |
| **`quay`** | **Tauri 桌面 app · dev 进程管理** | **❌ 零提及** | **13** | **89** | **registry** |

`quay` 的 `package.json` 装着 `@hulianui/ui@^0.9.0`，35 个 jsx 文件里只有 3 个 import 它。
它不是「Agent 不知道有这个库」，而是**项目里没有任何一句话要求用它**。

这对 #41 有两个直接影响：

- **P0 的 `init-agent` 是在把一种已在多个项目上观察到有效的做法自动化**，不是在赌一个
  全新机制。
- **`quay` 是合适的实验对象，但不能用「装契约前后重扫」来测。** 装契约不会回溯消除已有的
  89 处手搓代码，前后比数字量到的是「有没有人去改」而不是契约是否有效。正确设计是：

  ```text
  建立当前基线
  → 安装契约 + MCP 体检
  → 选择一批明确的改造任务
  → 由 Agent 实施
  → 重扫，比较采用率、误报率、组件缺口、行为回归
  ```

  关键在中间两步：必须有真实改造任务经过 Agent，否则测的不是契约。`quay` 值得作为对象，
  是因为它当前主力组件是 `tooltip`，高密度桌面 UI 是库里最没被验证过的场景，大概率能撞出
  真缺口。

## 发现二：37.7% 要拆成两类缺口

138 / 366 = **37.7%**（6 个项目并集，已去重）。分类差异极大：

| 分类 | 已用/总数 | 覆盖率 | 判读 |
|---|---|---|---|
| `ai` | 12/16 | 75% | 有场景（`jinshu`），采用充分 |
| `layout` | 9/14 | 64% | 基础设施，自然高 |
| `feedback` | 14/24 | 58% | 有场景，采用中等 |
| `forms` | 27/56 | 48% | 有场景，**采用不足** |
| `data-display` | 36/84 | 43% | 有场景，**采用不足** |
| `navigation` | 13/30 | 43% | 同上 |
| `typography` | 14/34 | 41% | 同上 |
| `mobile` | **1/7** | **14%** | **有场景却几乎没采用** ← 真问题 |
| `decoration` | 10/91 | 11% | 这批项目没有营销/展示场景 |
| `mockups` | 0/7 | 0% | 同上 |

**`mobile` 是这份报告里最硬的一条采用缺口。** `5069tk` 的 `/m/*` 有 6 个真实 H5 页面，
7 个 mobile 组件里只用了 `TabBar`；`SafeArea`（刘海屏必需）、`ActionSheet`、
`PullToRefresh`、`Fab`、`Picker`、`SwipeAction` 全部缺席。这正是 #41 想抓的那类问题 ——
场景在、组件在、就是没接上。

**`decoration` 的 11% 则不是同一回事。** 被用到的 10 个里 `reveal` 一个就占 35 次，其余
（`border-beam` 11、`dot-pattern` 8、`shine-border` 7…）都是个位数。7 个项目里只有
`abel-site` 一个是展示型，且它只用文字类特效，一个 WebGL 件都没用。91 个装饰组件占了
库存的 25%，真实需求侧却只有一个项目 —— 这是库存结构问题，**#41 不该把它算成采用失败**，
否则会导出「往中后台里塞特效」的错误结论，正好撞上 issue 自己写的非目标。

## 发现三：真实场景与 #41 的 8 个 profile 对不上

按各项目实际的组件构成聚类（不是按项目名主观归类）：

| 真实 profile | 来源项目 | 实证 top 组件 | 与 #41 示例的关系 |
|---|---|---|---|
| `admin-console` | 5069tk · ins-admin | `card` `select` `field` `table` `dialog` `toast` `alert` `popconfirm` `empty` `tag` `stat` `descriptions` | ≈ `admin-workflow`，但**筛选驱动**被低估：5069tk 光 `select` 就 56 次 |
| `config-tool` | mock-pilot · ai-key-vault | `select` `number-field` `field` `switch` `json-viewer` `snippet` `secret-field` `skeleton` `relative-time` | **#41 没有**。参数录入 → 结果预览 → 逐格复制，和 CRUD 后台的组件语言不同 |
| `ai-product` | jinshu | `tabs` `drawer` `alert-dialog` `score-ring` `segmented` `spinner` + `conversation` `prompt-input` `streaming-text` `tool-call` | ≈ `ai-agent`，方向对。是唯一大规模用 `ai` 类的项目 |
| `content-brand` | abel-site | `text` `stack` `reveal` `link` `heading` `container` `book-3d` `aurora-text` `sparkles-text` | 介于 `content-reading` 与 `marketing-brand` 之间；实际是**内容站**，`reveal` 主导，无 WebGL |
| `desktop-shell` | quay | `tooltip` `command` `scroll-area` `code` `snippet` `color-field` | **#41 没有**。高密度、悬停解释驱动，库里最没被验证的场景 |

对 #41 profile 清单的三条具体修正：

1. **补两个真实存在的**：`config-tool`（参数配置/生成器）与 `desktop-shell`（桌面应用）。
2. **`data-dashboard` 与 `mobile-performance` 不该是平级 profile**，它们在真实项目里不独立
   存在 —— `stat`/`statistic` 混在 5069tk 与 ins-admin 的后台页里，H5 是 5069tk 的一个路由
   分区。做成平级会导致同一个项目同时匹配多个、选型时互斥判断失效。

   但也**不该做成 `admin-console.mobile` 这样的子类型嵌套** —— 移动端 AI 产品、独立数据
   大屏在嵌套模型里表达不出来。正确的是三维正交：

   ```ts
   {
     surface:   "admin-console" | "config-tool" | "ai-product" | "content-brand" | "desktop-shell",
     modifiers: ("mobile" | "dashboard" | "data-dense" | "marketing" | "high-performance")[],
     workflow:  "build" | "audit" | "dogfood" | "migrate",
   }
   ```

   `surface` 决定组件语言，`modifiers` 决定约束与预算（**可组合**是关键），`workflow` 决定
   任务步骤。
3. **`existing-project-audit` 与 `component-dogfood` 不是场景，是工作流**。场景回答「这个页面
   该用什么组件语言」，工作流回答「这次任务按什么步骤走」。混在一个 profile 列表里，
   `recommend_ui` 拿到 `profile: "component-dogfood"` 时无法推出任何组件语言。它们属于上面
   三维模型里的 `workflow` 维。

## 建议的下一步

按 #41 的实施顺序，这份基线能直接接上的是：

- `surface` 的五个取值用上表填，落成 `agent-profiles.json` 时每个的 `componentRoles` 取实证
  top 组件，而不是凭印象列。
- adoption audit 的输出必须区分「有场景没采用」与「没场景」，否则会输出误导性的
  「decoration 覆盖率仅 11%」。判据可以从「同项目内是否已出现该场景的邻近组件」入手
  （如出现 `TabBar` 却没有 `SafeArea`）。
- 存量项目体检还需要**版本感知**：库当前 `0.15.1`，而四个走发布版的项目分别锁在
  `^0.13.0` / `^0.9.0` / `^0.7.1` / `^0.5.0`，没有一个在最新版。已拆出 #43 承担这块。

profile 的 JSON 落盘位置等 #36/#37 的 `packages/mcp` 改动收口后再定，避免与在途工作冲突。

## 修订记录

- 2026-08-01 初版。
- 2026-08-01 修订：收回「契约有效性已被验证」的过强表述（6 比 1 且 `quay` 带三个混杂变量，
  属强相关非因果）；作废「装契约前后重扫」的 A/B 设计（装契约不回溯消除既有手搓，量到的是
  「有没有人去改」）；profile 从子类型嵌套改为 `surface` + `modifiers` + `workflow` 三维正交。
  讨论见 [#41](https://github.com/hulianui/hulian/issues/41) 与 [#43](https://github.com/hulianui/hulian/issues/43)。
