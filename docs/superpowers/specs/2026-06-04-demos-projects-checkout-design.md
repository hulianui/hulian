# 内置 Demo 增量：工程项目协同后台 ·「在线收款 / 收银台」模块

> 设计规格 · 2026-06-04
> 归属 demo：`projects`（`/demos/projects`）· 新增第 6 个模块
> 父规格：`2026-06-04-demos-projects-design.md`

## 1. 目标与约束

在现有「工程/安装施工服务商」中后台 demo 上补一个**在线收款 / 收银台**模块，补完应收现金流的"最后一公里"——甲方在线付款。

**唯一硬约束**（沿用父规格）：100% 用 `@hulian/ui` 搭建。任何组件缺口或不好用，**回流组件库**——新造组件或就地优化既有组件，**禁止在 demo 里手搓 UI 或打 CSS 补丁绕路**。本模块首要价值仍是 dogfood 驱动组件库迭代。

> **复用优先（2026-06-04 实施前修订）**：盘点发现倒计时原语**库里已有** `Statistic.Countdown`（`deadline` 时间戳 / `format` / `onFinish` 到期回调 / `valueStyle` / SSR 安全 / 零依赖 / 带测试）。按「复用、不重造」铁律，**本模块不新造 Countdown 组件，直接复用 `Statistic.Countdown`**。收银台所需 QRCode / Result / Segmented / ProTable / ModalForm / Statistic / Tag 均已存在 → **本模块退化为纯组合既有组件，预期 0 新增组件**；仅当 build 中冒出真实缺口（某组件不够用）才就地回流修对应组件，并在 commit 注明。

**非目标（YAGNI）**：
- 不接真实支付网关 / 不做真实收款（全部内存 mock，支付为模拟态切换）
- 不做对账 / 结算 / 退款流（仅"发起收款 → 支付成功 → 回写回款"主链路）
- 不做应付/付款方向（那是另一个方向，本次只做应收侧的在线收款）
- 不做鉴权 / 多租户 / 国际化（沿用 demo 简化口径）

## 2. 叙事与主链路

复用现有发票闭环，不另起孤岛：

```
已开发票（开票回款模块）
  → 操作员发起在线收款（生成收款单 + 支付二维码）
  → 甲方在收银台扫码 / 选支付方式付款
  → 支付成功
  → 自动回写一条回款记录到对应发票（接回「开票回款」的回款 Timeline）
```

两个视角：
- **操作台视角**（我方）：收款单列表，发起/管理收款。
- **收银台视角**（甲方）：模拟甲方看到的扫码付款页。

收款单引用现有 `invoices.ts` 的发票实体（`invoiceId`），金额默认取发票应收余额（`dueAmount`），可改。

## 3. 模块清单与组件映射

### 3.1 收款单列表 — `/demos/projects/checkout`
- **ProTable**：收款单号 / 关联发票+项目 / 付款方(甲方) / 金额 / 支付方式 / 状态 / 有效期
- **Statistic** 汇总条：待收款额、今日已收、收款单数
- **状态 Tag**：待支付 · 支付中 · 已支付 · 已关闭（过期/手动关闭）
- **「发起收款」按钮 → FormDialog**：选一张「已开/已寄送」且未结清的发票 + 收款金额（默认应收余额）+ 有效期 → 生成收款单，状态「待支付」
- 行操作：进入收银台（跳 `/checkout/[id]`）、关闭收款单
- 已有组件全覆盖，无缺口（除汇总/列表能力若发现不足则回流 ProTable/Statistic）。

### 3.2 收银台 — `/demos/projects/checkout/[id]`（核心）
模拟甲方付款界面，单列居中卡片布局：
- **单据信息区**：收款方=我方、付款方=甲方、关联项目、收款金额（含金额大写，复用报价单的大写工具）
- **`Statistic.Countdown`（复用）**：支付有效期倒计时（`deadline = expireAt 毫秒时间戳`，`format="mm:ss"`，`valueStyle` 放大字号），到期 `onFinish` → 收款单切「已关闭」、界面切过期态
- **支付方式选择**：Segmented 或卡片选择——微信支付 / 支付宝 / 对公网银 / 银行卡
- **QRCode**：当前支付方式对应的收款二维码 + 提示文案
- **模拟付款**：「我已完成支付」按钮（demo 模拟）→ 状态切「支付中」短暂态 → 「已支付」
- **支付成功**：**Result** 成功态（已收金额、流水号、返回收款列表）；同时 push 一条 payment（`method` 取所选支付方式、`amount`、`at`）到关联发票的 `payments`，使「开票回款」回款记录联动更新

静态导出约束：`[id]` 页必须 `generateStaticParams`，按「server 页壳 + client 子组件」拆分（沿用 demo 既有 `[id]` 页范式，见 `quotes/[id]`、`tracking/[id]`）。

## 4. 组件策略：复用优先，0 预期新组件

盘点结论：收银台所需 UI 原语**库内全部已存在**，**本模块不新造任何组件**。

| 需求 | 复用组件 | 关键用法 |
|---|---|---|
| 支付有效期倒计时 | `Statistic.Countdown` | `deadline`（毫秒时间戳）+ `format="mm:ss"` + `onFinish` + `valueStyle` |
| 收款金额展示 | `Statistic` / `Text` | `prefix="￥"` + `rmbUpper` 大写（复用 `_data/status.ts`） |
| 支付方式选择 | `Segmented` | `items` + 受控 `value`/`onValueChange` |
| 收款二维码 | `QRCode` | `value`（支付链接）+ `size` + 可选 `logo`（`level="H"`） |
| 支付成功反馈 | `Result` | `status="success"` + `title`/`subTitle`/`content` + children 操作区 |
| 收款单列表 | `ProTable` + `SearchForm`(内置) | 列定义 + `search` + `pagination`（镜像 invoices 页） |
| 发起收款表单 | `ModalForm` + `useForm` + `Field` | `form` + `onFinish`（镜像 crm customers 页） |
| 状态/汇总 | `Tag` / `Card` + `CardBody` | 状态色调走 `_data/status.ts` 新增 `checkoutStatusTone` |

**过程中就地优化的既有组件**（仅当出现真实缺口，发现即改，不在 demo 绕路）：
- **QRCode**：已支持 `logo`/`size`/`color`，预期够用；若收银场景仍缺位再补
- **Result**：已有 `success`/`error` 语义态 + `content`/children 插槽，预期够用；「支付中」用短暂 `Spin` 过渡态，不必为此加新 status
- **Segmented / ProTable / Statistic / ModalForm**：发现任何"不够好用"回流组件库，commit message 注明

## 5. 目录结构（镜像现有 projects demo）

```
apps/www/app/demos/projects/(app)/
  checkout/
    page.tsx              # 收款单列表（client：ProTable + Statistic + 发起收款 FormDialog）
    [id]/
      page.tsx            # server 壳：generateStaticParams + 取收款单 → 传 client 子组件
      checkout-cashier.tsx（或同级 client 子组件） # 收银台交互（Countdown/QRCode/Segmented/Result）
apps/www/app/demos/projects/_data/
  checkouts.ts            # 收款单 mock + 工具函数（引用 invoices）
  types.ts               # 追加 Checkout 类型 + 支付方式/状态枚举
apps/www/app/demos/projects/_components/
  nav-config.tsx         # 追加「在线收款」菜单项 + 面包屑/选中推导
```

`packages/ui/` 预期不改动（0 新组件）。如 build 中发现真实缺口，再就地补对应组件并补测试。

画廊登记：现有 `demos.ts` 的 `projects` 条目 tags 追加体现「收银台 / 在线收款 / QRCode」。

## 6. 数据模型（追加到 `_data/types.ts`）

```ts
type PayMethod = "微信支付" | "支付宝" | "对公网银" | "银行卡";
type CheckoutStatus = "待支付" | "支付中" | "已支付" | "已关闭";

interface Checkout {
  id: string;
  code: string;            // 收款单号 PAY-2026-00X
  invoiceId: string;       // 关联发票
  projectName: string;     // 冗余便于列表展示
  client: string;          // 付款方（甲方）
  amount: number;          // 收款金额
  method?: PayMethod;      // 甲方选定的支付方式（支付后填）
  status: CheckoutStatus;
  expireAt: string;        // 有效期（ISO，供 Countdown target）
  paidAt?: string;
  serialNo?: string;       // 支付流水号（成功后生成）
}
```

支付为模拟：收银台「我已完成支付」→ 改 Checkout.status=已支付 + 生成 serialNo/paidAt + push 一条 payment 到 `invoiceById(invoiceId).payments`。倒计时到期 → status=已关闭。mock 固定数据用日期字面量；收银台运行态的"当前时间/流水号"在 client 组件内用 `Date` 即可。

**`Payment.method` 扩展**：现有 `Payment.method` 是受限 union `"银行转账" | "承兑汇票" | "现金"`，回写在线支付方式需把它扩成包含 `PayMethod`（追加 `"微信支付" | "支付宝" | "对公网银" | "银行卡"`）。这是 demo 内 `types.ts` 的纯类型扩展，不影响既有数据（既有 invoices 的 method 仍合法）。

**内存态共享约束**：收款单的状态变更与发票回款回写都是进程内内存态（刷新还原），与 invoices 模块共享同一份 `invoices` 数组引用，确保切到「开票回款」页能看到联动新增的回款记录。

## 7. 交付切片（供实施计划拆分）

按可独立交付的粒度切（0 新组件，纯 demo 增量）：

- **Slice 1**：数据与脚手架 —— `types.ts` 追加 Checkout/PayMethod/CheckoutStatus + 扩展 Payment.method、`checkouts.ts` mock + 工具、`status.ts` 加 `checkoutStatusTone`、nav-config 追加「在线收款」、空路由占位
- **Slice 2**：收款单列表页（ProTable + Statistic 汇总 + 发起收款 ModalForm + 状态 Tag + 行操作进收银台/关闭）
- **Slice 3**：收银台页（server 壳 `generateStaticParams` + client 子组件：单据信息 + `Statistic.Countdown` + Segmented 支付方式 + QRCode + 模拟支付 → Result 成功态 + 回写发票 payments 并重算 paymentStatus）
- **Slice 4**：收尾打磨（暗色 / 响应式 / demos.ts tags 追加）+ 真实浏览器像素自证全链路（列表 → 发起 → 收银台 → 支付成功 → 回款联动 → 倒计时过期）+ 期间发现的真实缺口回流

## 8. 验收口径

- 收款单列表可「发起收款」生成收款单（关联真实发票，金额默认应收余额）。
- 收银台含：单据信息（金额大写）+ `Statistic.Countdown` 倒计时 + 支付方式切换 + 对应二维码。
- 模拟支付成功 → Result 成功态 + **对应发票的回款记录新增一条且 paymentStatus 重算**（与「开票回款」联动可见）。
- 倒计时到期 → 收款单切「已关闭」、收银台过期态。
- **0 新组件**：全程复用既有组件；如确有缺口才回流并补测试，commit 注明。全程 0 手搓 UI / 0 CSS 补丁。
- 挂进 demo nav 可达；`[id]` 页静态导出正常（`generateStaticParams`）。
