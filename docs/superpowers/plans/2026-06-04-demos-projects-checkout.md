# 「在线收款 / 收银台」模块 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 projects demo 增加第 6 个模块「在线收款」（收款单列表 + 收银台），复用既有 `@hulian/ui` 组件（含 `Statistic.Countdown`），支付成功联动回写既有发票回款记录。

**Architecture:** 纯 demo 增量，0 新组件。镜像现有 `invoices`（ProTable+Statistic+Drawer）与 `quotes/[id]`（server 壳 + client 子组件 + `generateStaticParams`）范式。内存态 mock，收款单 `useState`，发票回写直接 mutate 共享 `invoices` 数组并重算 `paymentStatus`。

**Tech Stack:** Next.js App Router（`output:export` 静态导出）+ React + `@hulian/ui` + Tailwind v4。

**验证口径**：本仓库 demo 页无单测，验证走 **类型检查 + 真实浏览器像素自证**（隔离 chromium，见 `mcp-browser-busy-launch-isolated-chromium-via-executablepath`）。组件改动（若有缺口）才补 vitest。

参考文件（实施时对照）：
- `apps/www/app/demos/projects/(app)/invoices/page.tsx` — 列表页范式（ProTable/Statistic/Tag/Drawer/ModalForm 缺）
- `apps/www/app/demos/crm/(app)/customers/page.tsx` — ModalForm + useForm + Field 范式
- `apps/www/app/demos/projects/(app)/quotes/[id]/page.tsx` — server 壳 + generateStaticParams
- `apps/www/app/demos/projects/_components/nav-config.tsx` — 菜单/面包屑
- `apps/www/app/demos/projects/_data/{types,status,invoices}.ts` — 数据/工具
- `packages/ui/src/statistic/statistic.tsx` — `Statistic.Countdown` API

---

## Task 1: 数据与脚手架（Slice 1）

**Files:**
- Modify: `apps/www/app/demos/projects/_data/types.ts`（追加类型 + 扩展 Payment.method）
- Create: `apps/www/app/demos/projects/_data/checkouts.ts`
- Modify: `apps/www/app/demos/projects/_data/status.ts`（加 `checkoutStatusTone`）
- Modify: `apps/www/app/demos/projects/_components/nav-config.tsx`（加「在线收款」）
- Create: `apps/www/app/demos/projects/(app)/checkout/page.tsx`（占位）
- Create: `apps/www/app/demos/projects/(app)/checkout/[id]/page.tsx`（占位）

- [ ] **Step 1: types.ts 追加 Checkout 模型并扩展 Payment.method**

在 `Payment` 接口处，把 method union 扩展（追加在线支付方式）：

```ts
export type PayMethod = "微信支付" | "支付宝" | "对公网银" | "银行卡";

export interface Payment {
  id: string;
  at: string; // YYYY-MM-DD
  amount: number;
  method: "银行转账" | "承兑汇票" | "现金" | PayMethod;
}
```

在文件末尾（`PROJECT_STAGES` 之后）追加收款单模型：

```ts
export type CheckoutStatus = "待支付" | "支付中" | "已支付" | "已关闭";

/** 在线收款单：对一张已开发票发起的在线收款，引用 invoice。 */
export interface Checkout {
  id: string;
  code: string; // 收款单号 PAY-2026-001
  invoiceId: string; // 关联发票
  projectName: string; // 冗余便于列表展示
  client: string; // 付款方（甲方）
  amount: number; // 收款金额（元）
  method?: PayMethod; // 甲方选定支付方式（支付后填）
  status: CheckoutStatus;
  createdAt: string; // YYYY-MM-DD
  expireAt: string; // 有效期 YYYY-MM-DD HH:mm（列表展示用，倒计时另算实时窗口）
  paidAt?: string; // 支付完成时间
  serialNo?: string; // 支付流水号
}

export const PAY_METHODS: PayMethod[] = ["微信支付", "支付宝", "对公网银", "银行卡"];
```

- [ ] **Step 2: status.ts 加 checkoutStatusTone**

在 `paymentStatusTone` 之后追加，并在文件顶部 import 追加 `CheckoutStatus`：

```ts
// 顶部 import 追加 CheckoutStatus
import type {
  CheckoutStatus,
  InvoiceStatus,
  PaymentStatus,
  PhotoTag,
  ProjectStatus,
  QuoteStatus,
} from "./types";

export function checkoutStatusTone(s: CheckoutStatus): Tone {
  switch (s) {
    case "已支付":
      return "success";
    case "支付中":
      return "brand";
    case "已关闭":
      return "neutral";
    case "待支付":
    default:
      return "warning";
  }
}
```

- [ ] **Step 3: checkouts.ts mock 数据 + 工具**

引用 `invoices`，覆盖待支付/已支付/已关闭三态，关联真实发票：

```ts
import { invoices, invoiceById, dueAmount } from "./invoices";
import type { Checkout } from "./types";

// 收款单 mock：引用已开发票，覆盖 待支付/已支付/已关闭。
export const checkouts: Checkout[] = [
  {
    id: "co1",
    code: "PAY-2026-001",
    invoiceId: "iv2", // 部分回款的发票，仍有应收余额
    projectName: "云栖数据中心机电安装工程",
    client: "云栖科技股份有限公司",
    amount: 258000,
    status: "待支付",
    createdAt: "2026-06-03",
    expireAt: "2026-06-03 18:00",
  },
  {
    id: "co2",
    code: "PAY-2026-002",
    invoiceId: "iv3",
    projectName: "瑞康制药 GMP 洁净车间装饰工程",
    client: "瑞康制药有限公司",
    amount: 318000,
    status: "待支付",
    createdAt: "2026-06-02",
    expireAt: "2026-06-02 20:00",
  },
  {
    id: "co3",
    code: "PAY-2026-003",
    invoiceId: "iv1",
    projectName: "云栖数据中心机电安装工程",
    client: "云栖科技股份有限公司",
    amount: 858000,
    method: "微信支付",
    status: "已支付",
    createdAt: "2026-04-26",
    expireAt: "2026-04-26 18:00",
    paidAt: "2026-04-28 10:24",
    serialNo: "WX20260428102415008871",
  },
  {
    id: "co4",
    code: "PAY-2026-004",
    invoiceId: "iv6",
    projectName: "极光新能源充电站电气安装",
    client: "极光新能源科技公司",
    amount: 200000,
    status: "已关闭",
    createdAt: "2026-05-10",
    expireAt: "2026-05-10 12:00",
  },
];

export function checkoutById(id: string): Checkout | undefined {
  return checkouts.find((c) => c.id === id);
}

/** 收银台支付链接（编进二维码，仅 demo 展示）。 */
export function payUrl(c: Checkout): string {
  return `https://pay.hulian.demo/checkout/${c.code}`;
}

/**
 * 模拟支付成功：回写发票 payments + 重算 paymentStatus（denormalized 字段必须同写）。
 * 返回流水号。
 */
export function settlePayment(c: Checkout, paidAt: string): string {
  const iv = invoiceById(c.invoiceId);
  if (iv) {
    iv.payments.push({
      id: `pm-${c.id}-${iv.payments.length + 1}`,
      at: paidAt.slice(0, 10),
      amount: c.amount,
      method: c.method ?? "微信支付",
    });
    // 重算 denormalized paymentStatus
    const due = dueAmount(iv);
    iv.paymentStatus = due <= 0 ? "已结清" : iv.payments.length > 0 ? "部分回款" : "未回款";
  }
  return `HL${paidAt.replace(/\D/g, "")}${String(Math.floor(1000 + (c.amount % 9000)))}`;
}
```

- [ ] **Step 4: nav-config.tsx 追加「在线收款」**

import 追加图标 `Wallet`（lucide-react 有），在 `g-finance` 分组 children 末尾追加，并同步 `leafKeys` / `META`：

```tsx
import { LayoutDashboard, FolderKanban, Images, FileText, Receipt, Wallet } from "lucide-react";

// g-finance children 追加：
{ key: `${ROOT}/checkout`, label: "在线收款", icon: <Wallet className="size-4" /> },

// leafKeys 数组追加 `${ROOT}/checkout`（排序逻辑不变，sort 自处理）：
const leafKeys = [
  `${ROOT}/tracking`,
  `${ROOT}/photos`,
  `${ROOT}/quotes`,
  `${ROOT}/invoices`,
  `${ROOT}/checkout`,
  ROOT,
].sort((a, b) => b.length - a.length);

// META 追加：
[`${ROOT}/checkout`]: "在线收款",

// DETAIL_LABEL 追加（收银台详情页尾标签）：
[`${ROOT}/checkout`]: "收银台",
```

- [ ] **Step 5: 占位页**

`(app)/checkout/page.tsx`：

```tsx
"use client";
export default function CheckoutPage() {
  return <div className="text-sm text-muted">在线收款（建设中）</div>;
}
```

`(app)/checkout/[id]/page.tsx`：

```tsx
import { checkouts } from "../../../_data/checkouts";

export function generateStaticParams() {
  return checkouts.map((c) => ({ id: c.id }));
}

export default async function CheckoutCashierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="text-sm text-muted">收银台 {id}（建设中）</div>;
}
```

- [ ] **Step 6: 类型检查 + commit**

Run: `pnpm --filter www exec tsc --noEmit`（或仓库既有 typecheck 脚本）
Expected: 无类型错误。

```bash
git add apps/www/app/demos/projects/_data apps/www/app/demos/projects/_components/nav-config.tsx "apps/www/app/demos/projects/(app)/checkout"
git commit -m "feat(demo): projects 在线收款模块脚手架 —— 数据/nav/路由占位"
```

---

## Task 2: 收款单列表页（Slice 2）

**Files:**
- Modify: `apps/www/app/demos/projects/(app)/checkout/page.tsx`（替换占位为完整列表页）

镜像 `invoices/page.tsx` + `crm/customers/page.tsx` 的 ModalForm 用法。

- [ ] **Step 1: 写完整列表页**

```tsx
"use client";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Field,
  Input,
  ModalForm,
  ProTable,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Statistic,
  Tag,
  toast,
  useForm,
  type ColumnDef,
} from "@hulian/ui";
import { useRouter } from "next/navigation";
import { checkouts as seed, payUrl } from "../../_data/checkouts";
import { dueAmount, invoices, invoiceById } from "../../_data/invoices";
import { checkoutStatusTone, yuan } from "../../_data/status";
import type { Checkout, CheckoutStatus } from "../../_data/types";

const STATUSES: CheckoutStatus[] = ["待支付", "支付中", "已支付", "已关闭"];
const PAGE_SIZE = 8;

const opt = (arr: readonly string[], allLabel = "全部") => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: v })),
];

// 可发起收款的发票：已开/已寄送 且仍有应收余额。
function billableInvoices() {
  return invoices.filter((iv) => iv.status !== "待开" && dueAmount(iv) > 0);
}

type FormState = { invoiceId: string; amount: string; expireAt: string };

export default function CheckoutPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Checkout[]>(seed);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const billable = billableInvoices();
  const form = useForm<FormState>({
    initialValues: {
      invoiceId: billable[0]?.id ?? "",
      amount: String(billable[0] ? dueAmount(billable[0]) : 0),
      expireAt: "2026-06-05 18:00",
    },
  });

  const filtered = useMemo(() => {
    const kw = String(filters.keyword ?? "").trim();
    return rows.filter((c) => {
      if (kw && !`${c.code}${c.projectName}${c.client}`.includes(kw)) return false;
      if (filters.status && c.status !== filters.status) return false;
      return true;
    });
  }, [rows, filters]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const sum = filtered.reduce(
    (a, c) => {
      if (c.status === "待支付" || c.status === "支付中") a.pending += c.amount;
      if (c.status === "已支付") a.paid += c.amount;
      return a;
    },
    { pending: 0, paid: 0 },
  );

  function handleCreate(values: Record<string, unknown>) {
    const iv = invoiceById(String(values.invoiceId));
    if (!iv) {
      toast.error("请选择发票");
      return false;
    }
    const amount = Number(values.amount) || 0;
    if (amount <= 0) {
      toast.error("收款金额需大于 0");
      return false;
    }
    const next: Checkout = {
      id: `co${Date.now()}`,
      code: `PAY-2026-${String(rows.length + 1).padStart(3, "0")}`,
      invoiceId: iv.id,
      projectName: iv.projectName,
      client: iv.client,
      amount,
      status: "待支付",
      createdAt: "2026-06-04",
      expireAt: String(values.expireAt) || "2026-06-05 18:00",
    };
    setRows((r) => [next, ...r]);
    toast.success(`已生成收款单 ${next.code}`);
    return true;
  }

  const columns: ColumnDef<Checkout>[] = [
    {
      accessorKey: "code",
      header: "收款单",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium tabular-nums">{row.original.code}</div>
          <div className="truncate text-xs text-muted">{row.original.projectName}</div>
        </div>
      ),
    },
    { accessorKey: "client", header: "付款方" },
    {
      accessorKey: "amount",
      header: "收款金额",
      cell: ({ row }) => <span className="tabular-nums font-medium">{yuan(row.original.amount)}</span>,
    },
    {
      accessorKey: "method",
      header: "支付方式",
      cell: ({ row }) =>
        row.original.method ? (
          <Tag tone="neutral" size="sm" variant="soft">
            {row.original.method}
          </Tag>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Tag tone={checkoutStatusTone(row.original.status)} size="sm" dot>
          {row.original.status}
        </Tag>
      ),
    },
    { accessorKey: "expireAt", header: "有效期", cell: ({ row }) => <span className="text-xs tabular-nums text-muted">{row.original.expireAt}</span> },
    {
      id: "actions",
      header: "操作",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={row.original.status === "已支付" || row.original.status === "已关闭"}
          onClick={() => router.push(`/demos/projects/checkout/${row.original.id}`)}
        >
          {row.original.status === "已支付" ? "已完成" : "去收银台"}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card variant="outline">
          <CardBody className="p-5">
            <Statistic title="待收款金额" value={sum.pending} prefix="￥" />
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardBody className="p-5">
            <Statistic title="已收款金额" value={sum.paid} prefix="￥" />
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardBody className="p-5">
            <Statistic title="收款单数" value={filtered.length} />
          </CardBody>
        </Card>
      </div>

      <ProTable<Checkout>
        title="在线收款"
        columns={columns}
        data={paged}
        getRowId={(r) => r.id}
        toolbar={
          <Button size="sm" onClick={() => setOpen(true)} disabled={billable.length === 0}>
            发起收款
          </Button>
        }
        search={{
          fields: [
            { name: "keyword", label: "关键词", placeholder: "收款单号 / 项目 / 付款方" },
            { name: "status", label: "状态", type: "select", options: opt(STATUSES) },
          ],
          onSearch: (v) => {
            setFilters(v);
            setPage(1);
          },
          onReset: () => {
            setFilters({});
            setPage(1);
          },
        }}
        pagination={{ page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}
      />

      <ModalForm
        title="发起在线收款"
        form={form}
        open={open}
        onOpenChange={setOpen}
        onFinish={handleCreate}
        className="w-[520px]"
      >
        <div className="flex flex-col gap-1">
          <Field label="关联发票">
            <Select
              value={form.register("invoiceId").value as string}
              onValueChange={(v) => {
                form.setFieldValue("invoiceId", v);
                const iv = invoiceById(v);
                if (iv) form.setFieldValue("amount", String(dueAmount(iv)));
              }}
            >
              <SelectTrigger />
              <SelectContent>
                {billable.map((iv) => (
                  <SelectItem key={iv.id} value={iv.id}>
                    {iv.code} · {iv.client}（应收 {yuan(dueAmount(iv))}）
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="收款金额（元）">
            <Input {...form.bind(form.register("amount"))} placeholder="如 258000" />
          </Field>
          <Field label="有效期">
            <Input {...form.bind(form.register("expireAt"))} placeholder="YYYY-MM-DD HH:mm" />
          </Field>
        </div>
      </ModalForm>
    </div>
  );
}
```

> 实施注意：`useForm` 的 API（`register`/`bind`/`setFieldValue`/`values`）以实际 `packages/ui/src/form/use-form.ts` 为准——若签名与上文不符，按真实签名调整（参考 crm/customers 页用的 `reg`/`bind` 写法），**不要臆造**。`ProTable` 的 `toolbar` prop 若不存在，则用真实的工具栏插槽名（实施前 grep `ProTable` 的 props 定义确认）。

- [ ] **Step 2: 类型检查 + 真实浏览器自证**

Run: typecheck；起 `pnpm --filter www dev`，隔离 chromium 打开 `/demos/projects/checkout`，截图确认：汇总条 + 表格 + 「发起收款」弹窗可开、可生成新行。
Expected: 0 console error；新建收款单出现在列表首行。

- [ ] **Step 3: commit**

```bash
git add "apps/www/app/demos/projects/(app)/checkout/page.tsx"
git commit -m "feat(demo): 在线收款单列表页（ProTable + 发起收款 ModalForm + 汇总）"
```

---

## Task 3: 收银台页（Slice 3）

**Files:**
- Modify: `apps/www/app/demos/projects/(app)/checkout/[id]/page.tsx`（server 壳保持，已在 Task1 写好 generateStaticParams）
- Create: `apps/www/app/demos/projects/_components/checkout-cashier.tsx`（client 子组件）

- [ ] **Step 1: server 壳改为渲染 client 子组件**

`(app)/checkout/[id]/page.tsx`：

```tsx
import { CheckoutCashier } from "../../../_components/checkout-cashier";
import { checkouts } from "../../../_data/checkouts";

export function generateStaticParams() {
  return checkouts.map((c) => ({ id: c.id }));
}

export default async function CheckoutCashierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CheckoutCashier id={id} />;
}
```

- [ ] **Step 2: client 收银台子组件**

`_components/checkout-cashier.tsx`：

```tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Empty,
  QRCode,
  Result,
  Segmented,
  Spin,
  Statistic,
  Tag,
} from "@hulian/ui";
import { Wallet } from "lucide-react";
import { checkoutById, payUrl, settlePayment } from "../_data/checkouts";
import { checkoutStatusTone, rmbUpper, yuan } from "../_data/status";
import { PAY_METHODS, type PayMethod } from "../_data/types";

const FIFTEEN_MIN = 15 * 60 * 1000;
const VENDOR = "瑚琏建工集团有限公司";

const METHOD_HINT: Record<PayMethod, string> = {
  微信支付: "请用微信扫一扫完成支付",
  支付宝: "请用支付宝扫一扫完成支付",
  对公网银: "请用企业网银扫码或按下方账号转账",
  银行卡: "请用手机银行 App 扫码支付",
};

export function CheckoutCashier({ id }: { id: string }) {
  const router = useRouter();
  const co = checkoutById(id);
  const [method, setMethod] = useState<PayMethod>("微信支付");
  // 进收银台时给一个实时 15 分钟支付窗口（mock 固定 expireAt 多已过期，演示用实时窗口）。
  // 仅喂给 Statistic.Countdown 的 effect，不直接渲染 → SSR 安全。
  const [deadline] = useState(() => Date.now() + FIFTEEN_MIN);
  const [phase, setPhase] = useState<"pay" | "paying" | "done" | "expired">(
    co?.status === "已支付" ? "done" : co?.status === "已关闭" ? "expired" : "pay",
  );
  const [serialNo, setSerialNo] = useState(co?.serialNo ?? "");

  if (!co) {
    return <Empty description="收款单不存在" />;
  }

  function handlePaid() {
    if (!co) return;
    setPhase("paying");
    // 模拟支付中短暂态 → 成功
    window.setTimeout(() => {
      co.method = method;
      const paidAt = "2026-06-04 14:30";
      const sn = settlePayment(co, paidAt);
      co.status = "已支付";
      co.paidAt = paidAt;
      co.serialNo = sn;
      setSerialNo(sn);
      setPhase("done");
    }, 900);
  }

  if (phase === "done") {
    return (
      <div className="mx-auto w-full max-w-[560px]">
        <Card variant="outline">
          <CardBody className="p-8">
            <Result
              status="success"
              title="支付成功"
              subTitle={`${co.code} · ${co.client}`}
              content={
                <div className="mx-auto mt-2 w-full max-w-[360px] rounded-[var(--radius)] bg-muted/40 p-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted">收款金额</span>
                    <span className="font-semibold tabular-nums">{yuan(co.amount)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">支付方式</span>
                    <span>{co.method}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">流水号</span>
                    <span className="tabular-nums text-xs">{serialNo}</span>
                  </div>
                </div>
              }
            >
              <Button onClick={() => router.push("/demos/projects/checkout")}>返回收款列表</Button>
              <Button variant="ghost" onClick={() => router.push("/demos/projects/invoices")}>
                查看发票回款
              </Button>
            </Result>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (phase === "expired") {
    return (
      <div className="mx-auto w-full max-w-[560px]">
        <Card variant="outline">
          <CardBody className="p-8">
            <Result
              status="warning"
              title="收款单已关闭"
              subTitle="支付有效期已过，请返回列表重新发起收款"
            >
              <Button onClick={() => router.push("/demos/projects/checkout")}>返回收款列表</Button>
            </Result>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <Card variant="outline">
        <CardBody className="flex flex-col gap-6 p-8">
          {/* 单据信息 */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2 text-muted">
              <Wallet className="size-4" />
              <span className="text-sm">{VENDOR} · 在线收款</span>
            </div>
            <div className="text-3xl font-semibold tabular-nums text-foreground">{yuan(co.amount)}</div>
            <div className="text-xs text-muted">{rmbUpper(co.amount)}</div>
            <Tag tone={checkoutStatusTone(co.status)} size="sm" dot>
              {co.code} · {co.client}
            </Tag>
          </div>

          {/* 倒计时（复用 Statistic.Countdown） */}
          <div className="flex items-center justify-center gap-2 rounded-[var(--radius)] bg-warning/10 py-2 text-warning">
            <span className="text-sm">支付剩余时间</span>
            <Statistic.Countdown
              deadline={deadline}
              format="mm:ss"
              onFinish={() => setPhase("expired")}
              valueStyle={{ fontSize: "1.25rem", color: "var(--color-warning)" }}
            />
          </div>

          {/* 支付方式 */}
          <Segmented
            aria-label="支付方式"
            value={method}
            onValueChange={(v) => setMethod(v as PayMethod)}
            items={PAY_METHODS.map((m) => ({ value: m, label: m }))}
          />

          {/* 二维码 */}
          <div className="flex flex-col items-center gap-3">
            {phase === "paying" ? (
              <div className="grid size-[200px] place-items-center">
                <Spin />
              </div>
            ) : (
              <div className="rounded-[var(--radius)] border border-border p-4">
                <QRCode value={`${payUrl(co)}?m=${encodeURIComponent(method)}`} size={172} level="M" />
              </div>
            )}
            <div className="text-sm text-muted">{METHOD_HINT[method]}</div>
          </div>

          {/* 模拟支付 */}
          <Button className="w-full" loading={phase === "paying"} onClick={handlePaid}>
            我已完成支付
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
```

> 实施注意：`Spin` / `Result` 的 `warning` status / `Segmented` / `QRCode` props 均以真实组件定义为准。`Statistic.Countdown` 的 `valueStyle` 用内联色变量 `var(--color-warning)`——若主题变量名不同，grep `packages/tokens/src/semantic.css` 确认真实变量名后改。**严禁手搓倒计时逻辑或 CSS 补丁**。

- [ ] **Step 3: 类型检查 + 真实浏览器全链路自证**

Run: typecheck；隔离 chromium：
1. `/demos/projects/checkout` → 点「去收银台」进入 `/checkout/co1`
2. 收银台截图：金额/大写/倒计时跑动/支付方式切换/二维码随方式变
3. 点「我已完成支付」→ Spin → Result 成功态截图
4. 跳「查看发票回款」→ 对应发票（iv2）回款记录新增一条、应收余额减少、paymentStatus 更新
5. 暗色模式各页截图正常

Expected: 全链路 0 console error；回款联动可见。

- [ ] **Step 4: commit**

```bash
git add "apps/www/app/demos/projects/(app)/checkout/[id]/page.tsx" apps/www/app/demos/projects/_components/checkout-cashier.tsx
git commit -m "feat(demo): 收银台页（Statistic.Countdown + Segmented + QRCode + Result + 回款联动）"
```

---

## Task 4: 收尾打磨 + 画廊登记（Slice 4）

**Files:**
- Modify: `apps/www/app/demos/lib/demos.ts`（projects 条目 tags 追加）

- [ ] **Step 1: demos.ts tags 追加**

定位 `projects` 条目，tags 数组追加体现新模块：

```ts
// 在 projects 条目 tags 中追加（保留既有项）：
"在线收款", "收银台", "QRCode"
```

> 实施前 grep `apps/www/app/demos/lib/demos.ts` 中 `projects` 条目，确认 tags 字段真实结构后追加，不要覆盖既有 tags。

- [ ] **Step 2: 全模块响应式 + 暗色复检**

隔离 chromium 在窄屏（375px）与暗色下复检 `/checkout` 列表与 `/checkout/[id]` 收银台：卡片居中、汇总条堆叠、二维码不溢出。发现任何需要"CSS 补丁才好看"的点 → 判断是否组件缺口，是则回流修组件。

- [ ] **Step 3: commit**

```bash
git add apps/www/app/demos/lib/demos.ts
git commit -m "chore(demo): projects 画廊条目追加在线收款 tags"
```

---

## 自检清单（实施前最后核对）

- [ ] `useForm` / `ProTable.toolbar` / `Select` 受控写法以**真实组件 API**为准（Task2 Step1 的注记），不臆造签名
- [ ] `Statistic.Countdown` 的 `valueStyle` 色值变量名以 `semantic.css` 真实变量为准
- [ ] 回写发票时**同时**重算 `paymentStatus`（denormalized 字段，否则列表状态与余额不一致）
- [ ] `Payment.method` union 已扩展，回写不报类型错
- [ ] 收银台倒计时用**实时窗口**（`Date.now()+15min`）而非固定过期的 `expireAt`，避免一进去就过期
- [ ] `[id]` 页 `generateStaticParams` 覆盖所有收款单 id（静态导出）
- [ ] 全程 0 手搓倒计时/二维码逻辑、0 CSS 补丁；缺口回流组件库
