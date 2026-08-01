# 组件采用基线 · 2026-08-01

为 [#41](https://github.com/hulianui/hulian/issues/41) / [#43](https://github.com/hulianui/hulian/issues/43)
建立实证基线：扫描本机 `code/` 下**真实消费 `@hulianui/ui` 的项目**（非 `apps/www` 内的示例），
回答三个问题 —— 366 个组件真实用了多少、Agent 是否真的会退化成低层原语、profile 该怎么切。

复现：

```bash
node scripts/agent-adoption-scan.mjs                 # 摘要
node scripts/agent-adoption-scan.mjs --json          # 完整数据
node scripts/agent-adoption-scan.mjs --exclude 5069tk  # 排除 demo 原型等
```

## 结论先说

1. **「Agent 会退化成低层原语」不是恒定倾向，而与项目成熟度强相关。** `5069tk`（demo 原型）
   与 `5069tk-app`（正式 SaaS）是同产品、同团队的姐妹仓，构成天然对照：12 个企业高层业务
   组件里，demo 用 **5 个**，正式系统用 **10 个**。demo 靠 `card`/`select` 堆，正式系统用
   `page-header`(45 次)/`access`(15)/`pro-table`/`result`/`login-form`。**衡量采用率必须选对
   样本**，拿原型阶段的代码论证「Agent 不会用组件库」会得出错误结论。
2. **契约与采用率强相关，但这不是因果实验。** 10 个写了瑚琏硬规则的项目手搓信号合计
   **15 处**；唯一没写的 `quay` 一个项目 **89 处**（69 处裸 `<button>`）。样本是 10 比 1，
   且 `quay` 同时带着版本旧（`^0.9.0`）、Tauri 桌面栈、项目规模不同三个混杂变量。
3. **40.7% 的覆盖率不该当成一个指标看。** 至少要拆成「有场景却没采用」（`mobile` 7 个只用
   了 1 个）与「这批项目没这类场景」（`decoration` 91 个只用 11 个）。混在一起会把 #41
   引向「凑覆盖率」，正撞它自己写的非目标。

## 口径

| 项 | 取值 |
|---|---|
| 扫描根 | `~/Desktop/code`，自动发现依赖 `@hulianui/*` 的项目 |
| monorepo | 根无 `package.json` 时有界探测 `web/`、`frontend/`、`apps/web` 等候选，命中则只扫该子目录 |
| 库自身 | 自动跳过瑚琏仓库本身（`apps/www` 会 import 全部组件做 showcase，计入会把覆盖率拉到近 100%） |
| 组件真源 | `apps/www/public/registry.json` 的 366 个 `registry:ui`，按 `meta.exports` 反查 slug |
| 计数 | 只算值导入；`import type` 不算「用了组件」 |
| 去重 | `jinshu-release` 与 `jinshu` 是同 package 的快照，只算代码量大的那份 |
| 手搓信号 | JSX 里的裸 `<table>`/`<button>`/`<input>`/`<select>`/`<textarea>`/`<dialog>`、内联 `style={{`、硬编码 `text-[#...]`、自制 `fixed inset-0` 遮罩 |

已知偏差，读数时须一并考虑：

- 只统计**直接 import**。组件递归组合（如 `ProTable` 内部用 `Table`）不计入，真实
  「被渲染过」的组件数高于 149。
- 裸 `<button>` 不等于错。图标热区、`asChild`、桌面端自定义控件都可能合理；该数字只用于
  跨项目横比，单条不作缺陷判定。
- 契约识别按关键词粗判（`hulianui` 提及 + 「100%/铁律/硬规则/回库/不打 CSS 补丁」类措辞），
  非语义理解。
- monorepo 候选目录是有界枚举，命名特殊的前端目录仍会漏。**本报告初版就漏掉了
  `5069tk-app`**（根无 `package.json`，前端在 `web/`），这也是 #43 里 `inspect_project`
  面对 monorepo 根时的同一处境。

## 发现一：demo 原型 vs 正式系统，同产品同团队的对照

`5069tk` 的 `CLAUDE.md` 写明：它是纯前端 demo 原型（需求回看用），姐妹仓 `5069tk-app`
才是带后端的真系统，两仓不共享代码。

以 12 个企业高层业务组件（`page-header` `pro-table` `access` `form-dialog` `admin-layout`
`pro-form` `search-form` `steps-form` `login-form` `result` `descriptions` `editable-table`）
为基准：

| 项目 | 高层件 | 性质 |
|---|---|---|
| `5069tk-app/web` | **10/12** | 题库 SaaS 正式实现（Next 16 BFF → FastAPI → PG） |
| `admin-starter/web` | 9/12 | 中后台模板 |
| `jinshu-ops/web` | 9/12 | 运维端 |
| **`5069tk`** | **5/12** | **同产品的 demo 原型** |
| `jinshu` · `live/client` | 4/12 | AI 产品 / 实时语音产品 |
| `ai-key-vault` · `ins-admin` | 3/12 | 工具型控制台 |
| `mock-pilot` | 2/12 | 数据工作台 |
| `abel-site` | 0/12 | 内容站（合理，不需要） |
| `quay` | 0/12 | 未接入 |

姐妹仓差集：只有正式系统用了 26 个组件，头部是 `page-header:45` `skeleton:18` `access:15`
`drawer:8` `form:6` `result:5` `pro-table:4`；只有 demo 用了 5 个，全是 `meter`/`choicebox`/
`dot`/`slider`/`spotlight` 这类零散小件。

含义：

- **`admin-console` 这个 profile 的 `componentRoles` 必须取自正式系统**（`page-header` +
  `pro-table` + `access` + `form-dialog` + `modal` + `form` + `empty` + `skeleton`），
  而不是原型阶段的 `card`/`select` 堆砌。
- **给 demo 原型推荐全套企业件是过度工程。** 原型求快、正式求规范，是两种正当取向。这应当
  落在 #41 三维模型的 `workflow` 维（如 `prototype` 与 `build` 区分开），而不是把原型判为
  「采用不足」。
- **「高层业务组件采用度」（如 10/12）比覆盖率更适合做 audit 指标** —— 它对项目规模不敏感，
  且直接对应「有没有绕过现成能力」。

## 发现二：契约 vs 手搓

| 项目 | 性质 | 契约 | slug | 手搓 | 版本 |
|---|---|---|---|---|---|
| `5069tk-app/web` | 题库 SaaS 正式实现 | ✅ | 90 | 1 | `0.15.1` 精确锁 |
| `jinshu` | 简历智能体 + 招聘 B 端 | ✅ | 76 | 8 | `^0.5.0` |
| `5069tk` | 题库 demo 原型 | ✅ | 69 | 2 | `link:` |
| `ai-key-vault` | 密钥保险库 + 用量看板 | ✅ | 51 | 1 | `^0.13.0` |
| `jinshu-ops/web` | 运维端 | ✅ | 44 | 0 | `link:` |
| `live/client` | 实时语音交互产品 | ✅ | 42 | 2 | `^0.13.0` |
| `admin-starter/web` | 中后台模板 | ✅ | 38 | 0 | `link:` |
| `abel-site` | 个人站 | ✅ | 30 | 0 | `link:` |
| `mock-pilot` | Mock 数据工作台 | ✅ | 29 | 1 | `link:` |
| `ins-admin` | 运维后台 | ✅ | 27 | 0 | `^0.7.1` |
| **`quay`** | **Tauri 桌面 app** | **❌** | **13** | **89** | `^0.9.0` |

`quay` 装着 `@hulianui/ui@^0.9.0`，35 个 jsx 文件里只有 3 个 import 它 —— 不是「Agent 不知道
有这个库」，而是项目里没有任何一句话要求用它。

这是**强本地相关性证据，不是因果实验**：足以支持「把契约做成可安装的」（#41 P0），不足以
支持「装了契约就会提升采用率」。

验证契约效果**不能**用「装契约前后重扫」—— 装契约不会回溯消除已有的 89 处手搓，前后比数字
量到的是「有没有人去改」。正确设计：

```text
建立当前基线
→ 安装契约 + MCP 体检
→ 选择一批明确的改造任务
→ 由 Agent 实施
→ 重扫，比较采用率、误报率、组件缺口、行为回归
```

关键在中间两步：必须有真实改造任务经过 Agent，否则测的不是契约。

## 发现三：40.7% 要拆成两类缺口

149 / 366 = **40.7%**（11 个项目并集，已去重、已排除库自身）。

| 分类 | 已用/总数 | 判读 |
|---|---|---|
| `ai` | 12/16 (75%) | 有场景，采用充分 |
| `layout` | 9/14 (64%) | 基础设施，自然高 |
| `forms` | 33/56 (59%) | 有场景，采用中等 |
| `feedback` | 14/24 (58%) | 同上 |
| `navigation` | 14/30 (47%) | 同上 |
| `data-display` | 38/84 (45%) | 有场景，采用不足 |
| `typography` | 14/34 (41%) | 同上 |
| **`mobile`** | **1/7 (14%)** | **有场景却没采用 ← 真问题** |
| `decoration` | 11/91 (12%) | 这批项目没有营销/展示场景 |
| `mockups` | 0/7 (0%) | 同上 |

**`mobile` 是最硬的一条采用缺口**：`5069tk` 的 `/m/*` 有 6 个真实 H5 页面，7 个 mobile 组件
里只用了 `TabBar`；`SafeArea`（刘海屏必需）、`ActionSheet`、`PullToRefresh`、`Fab`、`Picker`、
`SwipeAction` 全部缺席。场景在、组件在、就是没接上。

**`decoration` 的 12% 不是同一回事**：11 个里 `reveal` 一个就占大头，其余都是个位数；11 个
项目里只有 `abel-site` 是展示型，且只用文字类特效，一个 WebGL 件都没用。91 个装饰件占库存
25%，需求侧只有一个项目 —— 这是库存结构问题。把它算成采用失败，会导出「往中后台塞特效」
的结论。

## 发现四：版本分布支持 #43 的版本感知

库当前 `@hulianui/ui@0.15.1`。六个走 registry 发布版的项目：

| 项目 | 声明版本 | 距当前 |
|---|---|---|
| `5069tk-app/web` | **`0.15.1`（精确锁，不带 `^`）** | **最新** |
| `ai-key-vault` · `live/client` | `^0.13.0` | 落后 2 个 minor |
| `quay` | `^0.9.0` | 落后 6 个 |
| `ins-admin` | `^0.7.1` | 落后 8 个 |
| `jinshu` | `^0.5.0` | 落后 10 个 |

`5069tk-app` 是版本管理的正面样本 —— `CLAUDE.md` 明确写「npm 精确版本锁死，不带 `^`，
升级 = 一次显式提交」。其余五个跨度 `0.5.0` → `0.13.0`；由于 npm 对 `0.x` 的 caret 只放行
patch，`^0.5.0` 实际锁在 `0.5.x`。

组件数量差异（`packages/ui/src/` 目录数口径，含 lib/motion 等非组件目录，故为粗口径）：

```
0.5.0 → 352    0.7.1 → 353    0.9.0 → 353    0.13.0 → 359    HEAD → 370
```

数量差只是**下界**。真正高频的风险在 **prop / variant 层面**：给 `0.5.x` 的项目推荐
`<Table density="compact">`，组件名和文档都查得到，装上去却类型报错或静默失效 —— 比推荐
一个不存在的组件更难排查。详见 #43。

## 发现五：真实场景与 #41 的 8 个示例 profile 对不上

按各项目**实际组件构成**聚类：

| `surface` | 来源项目 | 实证 top 组件 |
|---|---|---|
| `admin-console` | 5069tk-app · admin-starter · jinshu-ops · live · ins-admin | `page-header` `pro-table` `access` `form-dialog` `modal` `form` `card` `select` `field` `toast` `empty` `skeleton` `descriptions` `drawer` |
| `config-tool` | mock-pilot · ai-key-vault | `select` `number-field` `field` `switch` `json-viewer` `snippet` `secret-field` `empty` `relative-time` |
| `ai-product` | jinshu | `tabs` `drawer` `alert-dialog` `score-ring` `segmented` + `conversation` `prompt-input` `streaming-text` `tool-call` |
| `content-brand` | abel-site | `text` `reveal` `link` `heading` `container` `book-3d` `aurora-text` |
| `desktop-shell` | quay | `tooltip` `command` `scroll-area` `code` `snippet` `color-field`（样本弱，未真正接入） |

对 #41 profile 清单的修正：

1. **补 `config-tool` 与 `desktop-shell`**，这两类在真实项目里确实独立存在。
2. **`data-dashboard` / `mobile-performance` 不该是平级 profile**，它们在真实项目里不独立
   存在 —— `stat`/`statistic` 混在后台页里，H5 是 `5069tk` 的一个路由分区。做成平级会导致
   同一项目同时匹配多个、选型时互斥判断失效。但也**不该做成 `admin-console.mobile` 式子类型
   嵌套** —— 移动端 AI 产品、独立数据大屏在嵌套模型里表达不出来。正确的是三维正交：

   ```ts
   {
     surface:   "admin-console" | "config-tool" | "ai-product" | "content-brand" | "desktop-shell",
     modifiers: ("mobile" | "dashboard" | "data-dense" | "marketing" | "high-performance")[],
     workflow:  "prototype" | "build" | "audit" | "dogfood" | "migrate",
   }
   ```

   `surface` 决定组件语言，`modifiers` 决定约束与预算（**可组合**是关键），`workflow` 决定
   任务步骤。`prototype` 由发现一补入 —— 原型阶段不该被判为「采用不足」。
3. **`existing-project-audit` / `component-dogfood` 不是场景，是工作流**，属 `workflow` 维。

## 建议的下一步

- `surface` 的五个取值用上表填，落 `agent-profiles.json` 时 `componentRoles` 取实证 top
  组件；**`admin-console` 必须取自正式系统而非 demo 原型**。
- audit 输出必须区分「有场景没采用」与「没场景」。判据可从「同项目内是否已出现该场景的
  邻近组件」入手（如出现 `TabBar` 却没有 `SafeArea`）。
- 考虑用「高层业务组件采用度」替代裸覆盖率作为 audit 主指标，它对项目规模不敏感。
- 存量项目体检还需版本感知与增量基线，已拆出 #43。

## 修订记录

- 2026-08-01 初版（8 个项目）。
- 2026-08-01 修订一：收回「契约有效性已被验证」的过强表述；作废「装契约前后重扫」的 A/B
  设计；profile 改为三维正交。讨论见 [#41](https://github.com/hulianui/hulian/issues/41)。
- 2026-08-01 修订二：**修复扫描脚本的 monorepo 发现缺陷**，补入此前漏掉的 `5069tk-app`、
  `admin-starter`、`jinshu-ops`、`live` 四个项目（根无 `package.json`，前端在子目录），
  并自动排除瑚琏仓库自身（`apps/www` 的 showcase 会把覆盖率拉到近 100%）。项目数 8 → 12，
  覆盖率 37.7% → 40.7%。新增发现一（demo 原型 vs 正式系统的姐妹仓对照）并据此修正
  `admin-console` 的 `componentRoles`、在 `workflow` 维补入 `prototype`。
