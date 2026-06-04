"use client";
import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  DocumentSheet,
  DocumentSheetFooter,
  DocumentSheetHeader,
  DocumentSheetSection,
  Drawer,
  DrawerContent,
  Empty,
  Popconfirm,
  ProTable,
  Spinner,
  Statistic,
  Steps,
  type StepsItem,
  Tag,
  Text,
  Timeline,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
  type ColumnDef,
} from "@hulian/ui";
import { dueAmount, invoices as seed, paidAmount } from "../../_data/invoices";
import { invoiceStatusTone, paymentStatusTone, rmbUpper, wan, yuan } from "../../_data/status";
import type { Invoice, InvoiceStatus, PaymentStatus } from "../../_data/types";
import { useMockData, usePending } from "../../../lib/async";

const STATUSES: InvoiceStatus[] = ["待开", "已开", "已寄送"];
const PAY_STATUSES: PaymentStatus[] = ["未回款", "部分回款", "已结清"];
const PAGE_SIZE = 8;

const opt = (arr: readonly string[], allLabel = "全部") => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: v })),
];

const ISSUE_STEPS: StepsItem[] = [
  { title: "申请开票", description: "项目提交" },
  { title: "财务审核", description: "金额复核" },
  { title: "开具发票", description: "税控开具" },
  { title: "邮寄送达", description: "寄送甲方" },
];
const statusToStep: Record<InvoiceStatus, number> = { 待开: 1, 已开: 2, 已寄送: 3 };

const VENDOR = {
  name: "瑚琏建工集团有限公司",
  taxNo: "91330100MA2XHL0001",
  addr: "杭州市滨江区江南大道 1788 号 · 0571-8888 6666",
  bank: "工商银行杭州滨江支行 1202 0000 1234 5678",
};

export default function InvoicesPage() {
  const { data, loading } = useMockData(seed);
  const [rows, setRows] = useState<Invoice[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Invoice | null>(null);
  const [issuePending, runIssue] = usePending();
  const [voidPending, runVoid] = usePending();

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const filtered = useMemo(() => {
    const kw = String(filters.keyword ?? "").trim();
    return rows.filter((iv) => {
      if (kw && !`${iv.code}${iv.projectName}${iv.client}`.includes(kw)) return false;
      if (filters.status && iv.status !== filters.status) return false;
      if (filters.paymentStatus && iv.paymentStatus !== filters.paymentStatus) return false;
      return true;
    });
  }, [rows, filters]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 汇总条（按当前筛选结果）。
  const sum = filtered.reduce(
    (a, iv) => {
      a.invoiced += iv.status === "待开" ? 0 : iv.amount;
      a.paid += paidAmount(iv);
      a.due += dueAmount(iv);
      return a;
    },
    { invoiced: 0, paid: 0, due: 0 },
  );

  // 逾期回款检测：已寄送 + 应收余额 > 0 的发票。
  const overdueCount = filtered.filter(
    (iv) => iv.status === "已寄送" && dueAmount(iv) > 0,
  ).length;

  function handleIssue(iv: Invoice) {
    void runIssue(() => {
      setRows((rs) =>
        rs.map((r) => (r.id === iv.id ? { ...r, status: "已开" as InvoiceStatus, issuedAt: "2026-06-04" } : r)),
      );
      if (active?.id === iv.id) setActive((prev) => prev ? { ...prev, status: "已开", issuedAt: "2026-06-04" } : prev);
      toast({ title: "已开票", description: `${iv.code} 开具成功`, tone: "info" });
    });
  }

  function handleVoid(iv: Invoice) {
    void runVoid(() => {
      setRows((rs) => rs.map((r) => (r.id === iv.id ? { ...r, status: "待开" as InvoiceStatus, issuedAt: undefined } : r)));
      if (active?.id === iv.id) setActive((prev) => prev ? { ...prev, status: "待开", issuedAt: undefined } : prev);
      toast({ title: "已作废", description: `${iv.code} 已作废，可重新开具`, tone: "info" });
    });
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "code",
      header: "发票",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium tabular-nums">{row.original.code}</div>
          <div className="truncate text-xs text-muted">{row.original.projectName}</div>
        </div>
      ),
    },
    { accessorKey: "client", header: "购方抬头" },
    {
      accessorKey: "type",
      header: "类型",
      cell: ({ row }) => (
        <Tag tone="neutral" size="sm" variant="soft">
          {row.original.type === "增值税专用发票" ? "增专" : "增普"}
        </Tag>
      ),
    },
    {
      accessorKey: "amount",
      header: "开票金额",
      cell: ({ row }) => <span className="tabular-nums font-medium">{yuan(row.original.amount)}</span>,
    },
    {
      id: "due",
      header: "应收余额",
      cell: ({ row }) => {
        const d = dueAmount(row.original);
        return <span className={`tabular-nums ${d > 0 ? "text-danger" : "text-muted"}`}>{yuan(d)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "开票状态",
      cell: ({ row }) => (
        <Tag tone={invoiceStatusTone(row.original.status)} size="sm" dot>
          {row.original.status}
        </Tag>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "回款",
      cell: ({ row }) => (
        <Tag tone={paymentStatusTone(row.original.paymentStatus)} size="sm">
          {row.original.paymentStatus}
        </Tag>
      ),
    },
    {
      id: "actions",
      header: "操作",
      enableSorting: false,
      cell: ({ row }) => {
        const iv = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button variant="link" size="sm" onClick={() => setActive(iv)}>
              查看
            </Button>
            {iv.status === "待开" && (
              <Button variant="link" size="sm" onClick={() => handleIssue(iv)} disabled={issuePending}>
                {issuePending ? <Spinner size="sm" /> : "开票"}
              </Button>
            )}
            {iv.status === "已开" && (
              <Popconfirm
                title="确认作废此发票？"
                description="作废后状态将退回「待开」，不可恢复。"
                danger
                okText="确认作废"
                onConfirm={() => handleVoid(iv)}
              >
                <Button variant="link" size="sm" tone="danger">
                  作废
                </Button>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  const iv = active;
  const exTax = iv ? Math.round(iv.amount / (1 + iv.taxRate)) : 0;
  const tax = iv ? iv.amount - exTax : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* 逾期回款告警条 */}
      {overdueCount > 0 && (
        <Alert tone="warning">
          共 <strong>{overdueCount}</strong> 张已寄送发票存在逾期应收余额，请跟进回款。
        </Alert>
      )}

      {/* 汇总条 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card variant="outline">
          <CardBody className="p-5">
            <Statistic title="已开票金额" value={sum.invoiced} prefix="￥" />
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardBody className="p-5">
            <Statistic title="累计回款" value={sum.paid} prefix="￥" />
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardBody className="p-5">
            <Statistic title="待回款余额" value={sum.due} prefix="￥" />
          </CardBody>
        </Card>
      </div>

      <ProTable<Invoice>
        title="开票与回款"
        columns={columns}
        data={paged}
        loading={loading}
        getRowId={(r) => r.id}
        search={{
          fields: [
            { name: "keyword", label: "关键词", placeholder: "发票号 / 项目 / 购方" },
            { name: "status", label: "开票状态", type: "select", options: opt(STATUSES) },
            { name: "paymentStatus", label: "回款状态", type: "select", options: opt(PAY_STATUSES) },
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

      {/* 详情抽屉 */}
      <Drawer open={iv !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DrawerContent side="right" title={iv ? `${iv.code} · 发票详情` : ""} className="w-[min(680px,92vw)]">
          {iv && (
            <div className="flex flex-col gap-5">
              {/* 回款汇总 */}
              <div className="grid grid-cols-3 gap-3">
                <Card variant="outline">
                  <CardBody className="p-4">
                    <Statistic title="开票金额" value={iv.amount} prefix="￥" />
                  </CardBody>
                </Card>
                <Card variant="outline">
                  <CardBody className="p-4">
                    <Statistic title="已回款" value={paidAmount(iv)} prefix="￥" />
                  </CardBody>
                </Card>
                <Card variant="outline">
                  <CardBody className="p-4">
                    <Statistic title="应收余额" value={dueAmount(iv)} prefix="￥" />
                  </CardBody>
                </Card>
              </div>

              {/* 逾期告警（抽屉内） */}
              {iv.status === "已寄送" && dueAmount(iv) > 0 && (
                <Alert tone="warning">
                  该发票已寄送但存在 <strong>{yuan(dueAmount(iv))}</strong> 应收余额，请联系甲方跟进回款。
                </Alert>
              )}

              {/* 开票流转 */}
              <div>
                <div className="mb-3 text-sm font-medium text-foreground">开票流转</div>
                <Steps size="sm" items={ISSUE_STEPS} current={statusToStep[iv.status]} />
              </div>

              {/* 发票单据 */}
              <DocumentSheet size="auto" printable={iv.status !== "待开"}>
                <DocumentSheetHeader>
                  <div>
                    <div className="text-lg font-bold text-foreground">{iv.type}</div>
                    <div className="mt-1 text-xs text-muted">{VENDOR.name}</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right text-xs text-muted">
                      <div className="text-sm font-semibold tabular-nums text-foreground">{iv.code}</div>
                      <div className="mt-1">{iv.issuedAt ? `开票日期：${iv.issuedAt}` : "尚未开具"}</div>
                    </div>
                    {iv.status !== "待开" && (
                      <Tooltip>
                        <TooltipTrigger render={
                          <Button variant="ghost" size="iconSm" aria-label="打印">
                            <Printer className="size-3.5" />
                          </Button>
                        } />
                        <TooltipContent>打印发票</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </DocumentSheetHeader>
                <DocumentSheetSection title="购销信息">
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    <div>
                      <span className="text-muted">购买方：</span>
                      {iv.client}（税号 {iv.taxNo}）
                    </div>
                    <div>
                      <span className="text-muted">销售方：</span>
                      {VENDOR.name}（税号 {VENDOR.taxNo}）
                    </div>
                    <div>
                      <span className="text-muted">关联项目：</span>
                      {iv.projectName}
                    </div>
                  </div>
                </DocumentSheetSection>
                <DocumentSheetSection title="金额">
                  <div className="flex justify-between border-y border-border py-2 text-sm">
                    <span className="text-muted">金额（不含税）</span>
                    <span className="tabular-nums">{yuan(exTax)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-muted">税额（{(iv.taxRate * 100).toFixed(0)}%）</span>
                    <span className="tabular-nums">{yuan(tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border py-2 text-sm font-semibold text-primary">
                    <span>价税合计</span>
                    <span className="tabular-nums">{yuan(iv.amount)}</span>
                  </div>
                  <div className="mt-1 text-right text-sm">
                    <span className="text-muted">大写：</span>
                    <span className="font-medium">{rmbUpper(iv.amount)}</span>
                  </div>
                </DocumentSheetSection>
                <DocumentSheetFooter>
                  <div className="text-xs">开户行：{VENDOR.bank} · 地址：{VENDOR.addr}</div>
                </DocumentSheetFooter>
              </DocumentSheet>

              {/* 抽屉内操作 */}
              <div className="flex gap-2">
                {iv.status === "待开" && (
                  <Button size="sm" onClick={() => handleIssue(iv)} disabled={issuePending}>
                    {issuePending ? <Spinner size="sm" /> : "立即开票"}
                  </Button>
                )}
                {iv.status === "已开" && (
                  <Popconfirm
                    title="确认作废此发票？"
                    description="作废后状态将退回「待开」，不可恢复。"
                    danger
                    okText="确认作废"
                    onConfirm={() => handleVoid(iv)}
                  >
                    <Button size="sm" variant="outline" tone="danger" disabled={voidPending}>
                      {voidPending ? <Spinner size="sm" /> : "作废发票"}
                    </Button>
                  </Popconfirm>
                )}
              </div>

              {/* 回款记录 */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">回款记录</span>
                  <Text size="sm" tone="muted">
                    共 {wan(paidAmount(iv))} / {wan(iv.amount)}
                  </Text>
                </div>
                {iv.payments.length > 0 ? (
                  <Timeline
                    items={iv.payments.map((p) => ({
                      color: "success" as const,
                      label: p.at,
                      children: (
                        <Text size="sm">
                          <span className="font-medium tabular-nums">{yuan(p.amount)}</span>
                          <Tag tone="neutral" size="sm" variant="soft" className="ml-2 align-middle">
                            {p.method}
                          </Tag>
                        </Text>
                      ),
                    }))}
                  />
                ) : (
                  <Empty size="sm" description="暂无回款记录" />
                )}
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
