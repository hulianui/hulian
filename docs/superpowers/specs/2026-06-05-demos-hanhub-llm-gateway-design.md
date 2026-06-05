# 瀚枢 HanHub —— 大模型 API 中转网关控制台 · 设计 spec

- 日期：2026-06-05
- 类型：内置 demo（第 12 个）+ 4 个新库组件
- 定位：开发者自托管的多厂商 LLM 网关控制台（OpenRouter / one-api / new-api 风格）
- 状态：待用户 review

## 1. 背景与目标

库已 193 组件、11 个 demo。这个 demo 的拓库价值锚在**开发者 API 网关**这个尚未覆盖的真实场景，
两条贯穿主线（用户明确追加）：

1. **服务健康探测** —— 上游渠道 ping/测速、成功率、被动失败转移、阈值熔断、限速追踪
   （grounded：one-api / OpenZiti llm-gateway 的 weighted round-robin + passive failover + health check）。
2. **费用** —— input/output 分开按 1M token 计价、网关加价倍率、充值手续费、配额限速、逐请求成本拆解
   （grounded：OpenRouter 2026 —— Claude Opus 4.7 \$5/\$25、GPT-5.5 \$5/\$30、最低 \$0.09/\$0.29；
   充值 5.5% 手续费、BYOK 5%、免费档 20 req/min·200 req/day）。

**硬约束（来自用户指令 + CLAUDE.md）**
- 100% 由 `@hulian/ui` 搭建，**禁止在 demo 里打 CSS 补丁 / 行为 hack**；缺能力 → 回库修组件。
- 全 mock 内存态，`output: export` 静态导出。
- 所有面向交付的输出中文。
- demo 是「寻求真实场景拓展 UI 库」的载体，不是做着玩。

## 2. 产品命名与信息架构

**瀚枢 HanHub** —— 一站式大模型 API 网关（「枢」= 路由枢纽，贴网关语义，承袭瀚云/瀚付/瀚选/瀚库品牌族）。

一个 `base_url`（`https://api.hanhub.cn/v1`）+ 一把密钥，背后路由 OpenAI / Anthropic / Google /
DeepSeek / 阿里 Qwen / 月之暗面 Kimi / 智谱 GLM 等十余家上游，OpenAI 兼容协议。

## 3. 目录结构（沿用 ai-workflow demo 范式）

```
app/demos/hanhub/
  (app)/                      ← AdminLayout 外壳 + 多页签 keep-alive
    layout.tsx                ← AdminLayout 骨架（侧栏导航 + 顶栏 + 多页签）
    page.tsx                  ← 1 概览 Dashboard
    models/page.tsx           ← 2 模型市场
    keys/page.tsx             ← 3 API 密钥
    logs/page.tsx             ← 4 用量日志
    playground/page.tsx       ← 5 Playground
    health/page.tsx           ← 6 健康探测中心（原「渠道路由」升级）
    billing/page.tsx          ← 7 计费充值
    settings/page.tsx         ← 8 接入 & 设置
  login/page.tsx              ← 独立登录页（同其它 demo）
  _components/                ← 页内私有组件
    nav-config.ts             ← 侧栏/页签配置
    ...（各页拆出的子组件）
  _data/                      ← 全 mock
    providers.ts              ← 厂商 + 模型目录 + 真实定价
    keys.ts                   ← API 密钥 mock
    logs.ts                   ← 请求日志 mock（含完整 req/resp body 供 JsonViewer）
    channels.ts               ← 上游渠道 + 健康探测态
    usage.ts                  ← 用量/计费时序
    types.ts
  _lib/
    pricing.ts                ← 计费纯函数：token×单价×倍率 + 手续费（可测）
    code-gen.ts               ← 由 Playground 参数生成 curl / python / node 片段（可测）
    use-playground-run.ts     ← mock 流式回复 + 实时累计 token/花费
    use-health-probe.ts       ← mock 测速：一键 probe → 延迟/成功率刷新
```

## 4. 八个页面

### 1 概览 Dashboard（`page.tsx`）
- 顶部 KPI 卡：今日请求数 / 消耗 Tokens / 今日花费 ¥ / 成功率（Stat + NumberTicker）。
- 用量趋势：近 7 日请求量 + 花费双轴折线（Chart）。
- Top 模型排行：按调用量横向条（Chart bar 或 List + meter）。
- **上游健康墙**：各渠道 StatusDot（在线/降级/离线/维护）+ 延迟 + 成功率。
- 最近请求流：精简日志条（List），点「查看」跳日志页。
- 余额告警 Banner（余额低于阈值时）。

### 2 模型市场 Models（`models/page.tsx`）
- 筛选条：厂商 / 能力标(对话·推理·视觉·函数调用·长上下文) / 价位段（SearchForm + Segmented + Chip）。
- 模型卡网格（Masonry / Grid）：logo、名称、上下文窗口、input/output 价、能力标、「加入对比」。
- **PricingTable 定价对比矩阵**（新组件）：勾选的模型横排对比 input价/output价/上下文/最大输出/能力，
  列高亮、「最佳性价比」角标、表头 sticky。
- 模型详情 Drawer：限速、基准分、计费说明、SDK 接入示例（code-block 多语言 tab）。

### 3 API 密钥 Keys（`keys/page.tsx`）
- 密钥列表（Table / List）：名称、**SecretField**（`sk-…last4` 掩码 + 显形 + 复制）、所属分组、
  本月用量 meter、限额、状态 Switch（启停）、操作（重置/吊销）。
- 新建密钥 FormDialog：名称、权限范围(可调模型/分组)、月度限额、到期日（DatePicker）、限速。
- 新建后一次性全量展示密钥 + 复制提醒（Alert + SecretField revealed 态）。

### 4 用量日志 Logs（`logs/page.tsx`）
- ProTable 请求日志：时间、模型、渠道、状态码、延迟、prompt/completion tokens、花费 ¥、密钥、StatusDot。
- 查询区：时间范围、模型、状态、密钥过滤。
- 行点开 Drawer：
  - 概要（Descriptions）：请求 ID、模型、渠道、延迟分解、计费明细（input token×价 + output token×价 ×倍率）。
  - **JsonViewer**（新组件·旗舰）：request body / response body 折叠树，复制路径、大对象懒展开。
  - 调用时间线（Timeline）：入站→鉴权→选渠道→上游→计费→出站。

### 5 Playground（`playground/page.tsx`）
- 左：模型选择（Combobox 带厂商分组）+ 参数面板（temperature / max_tokens / top_p / 系统提示 Slider+NumberField）。
- 中：多轮对话（复用 conversation / chat-message / streaming-text / prompt-input），mock 流式。
- 右：实时计费面板 —— 累计 prompt/completion tokens + 实时花费 ¥（每轮累加）+ 本次会话成本。
- 「查看为代码」：把当前模型 + 参数 + 消息生成 **curl / python / node** 三语言片段（code-block tab 切换 + 复制）。

### 6 健康探测中心 Health（`health/page.tsx`）
- 渠道列表（Table）：渠道名、上游厂商、StatusDot 健康态、延迟、成功率 sparkline、权重、优先级、限速余量。
- **一键测速**：触发 mock probe（use-health-probe）→ 行内延迟/成功率刷新 + Spin loading 帧。
- 渠道→模型映射：哪些模型走哪些渠道（负载均衡/优先级/权重）。
- 熔断规则：连续失败阈值自动禁用（Switch + NumberField），降级转移说明。
- 探测历史：近期 probe 结果时间线（Timeline / List）。

### 7 计费充值 Billing（`billing/page.tsx`）
- 余额卡：当前余额 ¥ + 消费走势（Chart）+ 预计可用天数。
- 充值：额度档位 Choicebox + 自定义金额 + **手续费提示**（5.5% / ¥0.80 起，grounded）。
- 用量配额：本月已用/总额度 meter + 限速档（免费/按量/包月）。
- 账单明细：按日/按模型聚合（Table）+ 导出。
- BYOK 说明：自带上游 key 免倍率（5% 手续费）。

### 8 接入 & 设置 Settings（`settings/page.tsx`）
- 快速接入：`base_url` 一键复制 + 三语言最小可运行片段（code-block tab）。
- 组织/团队成员（List + Avatar + 角色 Tag）。
- Webhook（用量告警/余额告警回调 URL + 测试发送）。
- 默认限速 / 默认倍率分组 / 失败重试（Form + Switch + NumberField）。

## 5. 四个新组件（先造，页面再 dogfood）

每个标配：源码 + `.showcase.tsx`（进画廊）+ `.test.tsx` + `index.ts` barrel 导出 + `manifest.ts` 登记 + `registry.tsx`（若画廊需要）。遵循库现有约定。零依赖优先，token 驱动配色，尽量 RSC 安全。

### 5.1 JsonViewer（旗舰）
- 路径 `packages/ui/src/json-viewer/`，category `data-display` / group `collection`。
- Props：
  - `data: unknown` —— 任意 JSON 值。
  - `defaultExpandedDepth?: number`（默认 1）—— 初始展开深度。
  - `rootName?: string` —— 根节点标签（如 `response`）。
  - `collapsed?: boolean` 受控整体折叠；`onCopyPath?(path: string): void`。
  - `maxAutoExpandKeys?: number`（默认 50）—— 大对象懒展开阈值，超过折叠保护。
  - `className`。
- 行为：递归渲染折叠树；语法着色（key / string / number / boolean / null 各走语义 token）；
  行级展开/折叠箭头；折叠态显 `{…} 5 keys` / `[…] 12 items`；hover 行显复制按钮（复制节点值 + 复制 JSON path）；
  超大数组/对象按 `maxAutoExpandKeys` 折叠保护。
- 实现：纯函数 `tokenizeJsonValue` / `buildJsonPath` 抽出可单测；递归子组件 `JsonNode`。
- 不做：编辑（只读查看器，区别 MarkdownEditor）；虚拟滚动（YAGNI，mock 数据量小）。

### 5.2 SecretField
- 路径 `packages/ui/src/secret-field/`，category `forms` / group `advanced`。
- Props：
  - `value: string`、`revealed?: boolean` 受控 + `onRevealedChange?`（非受控自管）。
  - `maskStrategy?: "full" | "prefix-suffix"`（默认 prefix-suffix：`sk-abc…wxyz`）。
  - `copyable?: boolean`（默认 true）+ `onCopy?`。
  - `actions?: ReactNode` —— 重置/吊销动作槽。
  - `readOnly?`、`size?`、`tone?`、`className`。
- 行为：掩码展示 + 眼睛 toggle 显形 + 复制按钮（复制原值，反馈 toast）+ 尾部动作槽。
- 实现：复用 field/input 范式 + kbd/button + 现有 toast；纯函数 `maskSecret(value, strategy)` 可测。

### 5.3 PricingTable
- 路径 `packages/ui/src/pricing-table/`，category `data-display` / group `collection`。
- 定位：**行列转置的对比矩阵**（列=被比项/模型，行=属性/价目），区别于普通 Table（行=记录）。
  库现无通用对比矩阵（website demo 的 pricing-table 是页内私有，将来可回收）。
- Props：
  - `columns: { key; title; highlight?: boolean; badge?: ReactNode; header?: ReactNode }[]`。
  - `rows: { key; label; render?(col): ReactNode; values: Record<colKey, ReactNode> }[]`。
  - `stickyHeader?`（默认 true）、`highlightTone?`、`className`。
- 行为：高亮列描边 + 角标（「推荐」「最佳性价比」）；表头 sticky；窄屏横向滚动（ScrollArea）。
- 不做：排序/分页（那是 Table 的活；对比矩阵是静态对照）。

### 5.4 StatusDot
- 路径 `packages/ui/src/status-dot/`，category `data-display` / group `info`。
- 定位：带语义 tone 的健康状态点，封装现有 `dot` 原语。
- Props：
  - `status: "online" | "degraded" | "offline" | "maintenance"`（语义 → 颜色映射）。
  - `pulse?: boolean`（在线脉冲）、`label?: ReactNode`、`size?`、`className`。
- 行为：色点（可脉冲）+ 可选标签 + 可选延迟/数值 slot；纯皮肤零依赖。

## 6. Mock 数据要点（费用真实性）

- **模型目录**（grounded 2026 定价，¥ 按 7.2 折算或直接标 \$，demo 用 ¥ 更接地气）：
  GPT-5.5 \$5/\$30、GPT-5.4 \$2.5/\$15、Claude Opus 4.7 \$5/\$25、Sonnet 4.6 \$3/\$15、
  Haiku 4.5 \$1/\$5、Gemini 3 Pro ~\$2/\$12、DeepSeek V4 ~\$0.55/\$2.2、Qwen3-Max ~\$1.2/\$6、
  Kimi K2 ~\$0.6/\$2.5、最低档 MiMo-Flash \$0.09/\$0.29。
- **计费纯函数** `pricing.ts`：`cost = (promptTok×inPrice + completionTok×outPrice) / 1e6 × markup`；
  充值手续费 `topupFee = max(amount×0.055, 0.8)`。全部可单测。
- 日志 mock 带**完整 req/resp body**（messages、tool_calls、usage 块）供 JsonViewer 真实展开。
- 健康渠道 mock 带 latency/successRate/weight/priority/probeHistory。

## 7. 验证策略

1. **组件层**：4 组件各自 `.test.tsx`（纯函数 + 渲染 + 交互），`pnpm --filter @hulian/ui test` 全绿。
2. **画廊层**：4 组件 showcase 进画廊，doc 页零 console error。
3. **demo 层**：CDP 隔离 Chrome-for-Testing 实机逐页截图（8 页 + login）+ 关键交互
   （密钥显形/复制、日志 JsonViewer 展开、Playground 流式+代码生成、健康一键测速、定价矩阵对比），
   零 console error。验证用独立 chromium 避 MCP 争用（见 memory：mcp-browser-busy）。
4. **登记**：`demos.ts` 加 hanhub 条目；`demos-coverage.mjs` 验证新组件点亮计入覆盖率。

## 8. 实现顺序

1. 4 个新组件（JsonViewer → SecretField → PricingTable → StatusDot）+ 测试 + 画廊登记。
2. mock 数据 + _lib 纯函数（pricing / code-gen / probe / 流式）+ 单测。
3. 8 页（AdminLayout 外壳先行，再分页 dogfood；页面间弱耦合，可并行派 subagent）。
4. demos.ts 登记 + 实机像素自证 + 覆盖率验证。
5. commit（不 push，沿用本仓无 remote 惯例）。

## 9. 非目标（YAGNI）

- 不接真实 LLM API（全 mock 流式）。
- JsonViewer 不做编辑 / 虚拟滚动。
- 不做真实鉴权 / 真实充值。
- 不做 i18n / 多主题切换（吃库默认 token 主题）。
```
