"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  Field,
  Input,
  ModalForm,
  Popconfirm,
  ProTable,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Spinner,
  Statistic,
  Tag,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
  useForm,
  type ColumnDef,
} from "@hulianui/ui";
import { checkouts as seed } from "../../_data/checkouts";
import { dueAmount, invoiceById, invoices } from "../../_data/invoices";
import { checkoutStatusTone, yuan } from "../../_data/status";
import type { Checkout, CheckoutStatus } from "../../_data/types";
import { useMockData, usePending } from "../../../lib/async";

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
  const { data, loading } = useMockData(seed);
  const [rows, setRows] = useState<Checkout[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [createPending, runCreate] = usePending();

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const billable = billableInvoices();
  const form = useForm<FormState>({
    initialValues: {
      invoiceId: billable[0]?.id ?? "",
      amount: String(billable[0] ? dueAmount(billable[0]) : 0),
      expireAt: "2026-06-05 18:00",
    },
  });
  const reg = {
    invoiceId: form.register("invoiceId"),
    amount: form.register("amount"),
    expireAt: form.register("expireAt"),
  };

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

  function openCreate() {
    const first = billableInvoices()[0];
    form.setFieldsValue({
      invoiceId: first?.id ?? "",
      amount: String(first ? dueAmount(first) : 0),
      expireAt: "2026-06-05 18:00",
    });
    setOpen(true);
  }

  function handleCreate(values: Record<string, unknown>) {
    const iv = invoiceById(String(values.invoiceId));
    if (!iv) {
      toast({ title: "请选择发票", tone: "danger" });
      return false;
    }
    const amount = Number(values.amount) || 0;
    if (amount <= 0) {
      toast({ title: "收款金额需大于 0", tone: "danger" });
      return false;
    }
    void runCreate(() => {
      const next: Checkout = {
        id: `co${rows.length + 1}-${amount}`,
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
      toast({ title: "已生成收款单", description: next.code, tone: "info" });
      setOpen(false);
    });
    return true;
  }

  function handleCancel(row: Checkout) {
    setRows((rs) => rs.map((r) => r.id === row.id ? { ...r, status: "已关闭" as CheckoutStatus } : r));
    toast({ title: "收款单已关闭", description: row.code, tone: "info" });
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
      enableSorting: false,
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
    {
      accessorKey: "expireAt",
      header: "有效期",
      cell: ({ row }) => <span className="text-xs tabular-nums text-muted">{row.original.expireAt}</span>,
    },
    {
      id: "actions",
      header: "操作",
      enableSorting: false,
      cell: ({ row }) => {
        const closed = row.original.status === "已支付" || row.original.status === "已关闭";
        const pending = row.original.status === "待支付";
        return (
          <div className="flex items-center gap-1">
            {!closed && (
              <Tooltip>
                <TooltipTrigger render={
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label="去收银台"
                    onClick={() => router.push(`/demos/projects/checkout/${row.original.id}`)}
                  >
                    <CreditCard className="size-3.5" />
                  </Button>
                } />
                <TooltipContent>去收银台</TooltipContent>
              </Tooltip>
            )}
            {closed && (
              <span className="text-xs text-muted">
                {row.original.status === "已支付" ? "已完成" : "已关闭"}
              </span>
            )}
            {pending && (
              <Popconfirm
                title="确认取消收款？"
                description="关闭后该收款单将无法再支付。"
                danger
                okText="确认取消"
                side="left"
                onConfirm={() => handleCancel(row.original)}
              >
                <Button variant="ghost" size="sm" tone="danger">
                  取消
                </Button>
              </Popconfirm>
            )}
          </div>
        );
      },
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
        loading={loading}
        getRowId={(r) => r.id}
        toolbarActions={
          <Button size="sm" onClick={openCreate} disabled={billable.length === 0}>
            {createPending ? <Spinner size="sm" /> : "发起收款"}
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
              items={billable.map((iv) => ({ value: iv.id, label: `${iv.code} · ${iv.client}` }))}
              value={reg.invoiceId.value as string}
              onValueChange={(v) => {
                reg.invoiceId.onChange(v);
                const iv = invoiceById(String(v));
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
            <Input
              value={reg.amount.value as string}
              onChange={reg.amount.onChange}
              onBlur={reg.amount.onBlur}
              placeholder="如 258000"
            />
          </Field>
          <Field label="有效期">
            <Input
              value={reg.expireAt.value as string}
              onChange={reg.expireAt.onChange}
              onBlur={reg.expireAt.onBlur}
              placeholder="YYYY-MM-DD HH:mm"
            />
          </Field>
        </div>
      </ModalForm>
    </div>
  );
}
