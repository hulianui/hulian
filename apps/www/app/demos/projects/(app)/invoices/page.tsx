"use client";
import { copy } from "./page.content";

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
} from "@hulianui/ui";
import { dueAmount, invoices as seed, paidAmount } from "../../_data/invoices";
import {
  invoiceStatusLabel,
  invoiceStatusTone,
  invoiceTypeLabel,
  invoiceTypeShortLabel,
  currencyPrefix,
  paymentStatusLabel,
  paymentStatusTone,
  payMethodLabel,
  rmbUpper,
  wan,
  yuan,
} from "../../_data/status";
import type { Invoice, InvoiceStatus, PaymentStatus } from "../../_data/types";
import { useMockData, usePending } from "../../../lib/async";

const STATUSES: InvoiceStatus[] = ["待开", "已开", "已寄送"];
const PAY_STATUSES: PaymentStatus[] = ["未回款", "部分回款", "已结清"];
const PAGE_SIZE = 8;

const opt = (arr: readonly string[], labels?: Readonly<Record<string, string>>, allLabel = copy("all")) => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: labels?.[v] ?? v })),
];

const ISSUE_STEPS: StepsItem[] = [
  { title: copy("applyForInvoicing"), description: copy("projectSubmission") },
  { title: copy("financialReview"), description: copy("amountReview") },
  { title: copy("issueAnInvoice"), description: copy("taxControlIssuance") },
  { title: copy("deliveredByMail"), description: copy("sendToPartyA") },
];
const statusToStep: Record<InvoiceStatus, number> = { 待开: 1, 已开: 2, 已寄送: 3 };

const VENDOR = {
  name: copy("hulianConstructionEngineeringGroupCoLtd"),
  taxNo: "91330100MA2XHL0001",
  addr: copy("noJiangnanAvenueBinjiangDistrictHangzhou"),
  bank: copy("industrialAndCommercialBankOfChinaHangzhou"),
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
      toast({ title: copy("invoiced"), description: copy("valueIssuanceSuccessful", iv.code), tone: "success" });
    });
  }

  function handleVoid(iv: Invoice) {
    void runVoid(() => {
      setRows((rs) => rs.map((r) => (r.id === iv.id ? { ...r, status: "待开" as InvoiceStatus, issuedAt: undefined } : r)));
      if (active?.id === iv.id) setActive((prev) => prev ? { ...prev, status: "待开", issuedAt: undefined } : prev);
      toast({ title: copy("voided"), description: copy("valueHasBeenInvalidatedAndCanBe", iv.code), tone: "info" });
    });
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "code",
      header: copy("invoice"),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium tabular-nums">{row.original.code}</div>
          <div className="truncate text-xs text-muted">{row.original.projectName}</div>
        </div>
      ),
    },
    { accessorKey: "client", header: copy("buyerSHead") },
    {
      accessorKey: "type",
      header: copy("type"),
      cell: ({ row }) => (
        <Tag tone="neutral" size="sm" variant="soft">
          {invoiceTypeShortLabel[row.original.type]}
        </Tag>
      ),
    },
    {
      accessorKey: "amount",
      header: copy("invoiceAmount"),
      cell: ({ row }) => <span className="tabular-nums font-medium">{yuan(row.original.amount)}</span>,
    },
    {
      id: "due",
      header: copy("balanceReceivable"),
      cell: ({ row }) => {
        const d = dueAmount(row.original);
        return <span className={`tabular-nums ${d > 0 ? "text-danger" : "text-muted"}`}>{yuan(d)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: copy("invoicingStatus"),
      cell: ({ row }) => (
        <Tag tone={invoiceStatusTone(row.original.status)} size="sm" dot>
          {invoiceStatusLabel[row.original.status]}
        </Tag>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: copy("refund"),
      cell: ({ row }) => (
        <Tag tone={paymentStatusTone(row.original.paymentStatus)} size="sm">
          {paymentStatusLabel[row.original.paymentStatus]}
        </Tag>
      ),
    },
    {
      id: "actions",
      header: copy("operation"),
      enableSorting: false,
      cell: ({ row }) => {
        const iv = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button variant="link" size="sm" onClick={() => setActive(iv)}>{copy("view")}</Button>
            {iv.status === "待开" && (
              <Button variant="link" size="sm" onClick={() => handleIssue(iv)} disabled={issuePending}>
                {issuePending ? <Spinner size="sm" /> : copy("invoicing")}
              </Button>
            )}
            {iv.status === "已开" && (
              <Popconfirm
                title={copy("areYouSureYouWantToVoid")}
                description={copy("afterBeingInvalidatedTheStatusWillReturn")}
                danger
                okText={copy("confirmedToBeInvalid")}
                onConfirm={() => handleVoid(iv)}
              >
                <Button variant="link" size="sm" tone="danger">{copy("void")}</Button>
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
        <Alert tone="warning">{copy("total")}<strong>{overdueCount}</strong>{copy("zhangHasSentAnInvoiceWithAn")}</Alert>
      )}

      {/* 汇总条 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card variant="outline">
          <CardBody className="p-5">
            <Statistic title={copy("invoicedAmount")} value={sum.invoiced} prefix={currencyPrefix} />
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardBody className="p-5">
            <Statistic title={copy("accumulatedRepayments")} value={sum.paid} prefix={currencyPrefix} />
          </CardBody>
        </Card>
        <Card variant="outline">
          <CardBody className="p-5">
            <Statistic title={copy("balanceToBeRepaid")} value={sum.due} prefix={currencyPrefix} />
          </CardBody>
        </Card>
      </div>

      <ProTable<Invoice>
        title={copy("invoicingAndPaymentCollection")}
        columns={columns}
        data={paged}
        loading={loading}
        getRowId={(r) => r.id}
        search={{
          fields: [
            { name: "keyword", label: copy("keywords"), placeholder: copy("invoiceNumberItemPurchaser") },
            { name: "status", label: copy("invoicingStatus2"), type: "select", options: opt(STATUSES, invoiceStatusLabel) },
            { name: "paymentStatus", label: copy("paymentStatus"), type: "select", options: opt(PAY_STATUSES, paymentStatusLabel) },
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
        <DrawerContent side="right" title={iv ? copy("valueInvoiceDetails", iv.code) : ""} className="w-[min(680px,92vw)]">
          {iv && (
            <div className="flex flex-col gap-5">
              {/* 回款汇总 */}
              <div className="grid grid-cols-3 gap-3">
                <Card variant="outline">
                  <CardBody className="p-4">
                    <Statistic title={copy("invoiceAmount2")} value={iv.amount} prefix={currencyPrefix} />
                  </CardBody>
                </Card>
                <Card variant="outline">
                  <CardBody className="p-4">
                    <Statistic title={copy("refunded")} value={paidAmount(iv)} prefix={currencyPrefix} />
                  </CardBody>
                </Card>
                <Card variant="outline">
                  <CardBody className="p-4">
                    <Statistic title={copy("balanceReceivable2")} value={dueAmount(iv)} prefix={currencyPrefix} />
                  </CardBody>
                </Card>
              </div>

              {/* 逾期告警（抽屉内） */}
              {iv.status === "已寄送" && dueAmount(iv) > 0 && (
                <Alert tone="warning">{copy("theInvoiceHasBeenSentButExists")}<strong>{yuan(dueAmount(iv))}</strong>{copy("forTheBalanceReceivablePleaseContactParty")}</Alert>
              )}

              {/* 开票流转 */}
              <div>
                <div className="mb-3 text-sm font-medium text-foreground">{copy("invoicingAndCirculation")}</div>
                <Steps size="sm" items={ISSUE_STEPS} current={statusToStep[iv.status]} />
              </div>

              {/* 发票单据 */}
              <DocumentSheet size="auto" printable={iv.status !== "待开"}>
                <DocumentSheetHeader>
                  <div>
                    <div className="text-lg font-bold text-foreground">{invoiceTypeLabel[iv.type]}</div>
                    <div className="mt-1 text-xs text-muted">{VENDOR.name}</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right text-xs text-muted">
                      <div className="text-sm font-semibold tabular-nums text-foreground">{iv.code}</div>
                      <div className="mt-1">{iv.issuedAt ? copy("invoiceDateValue", iv.issuedAt) : copy("notYetIssued")}</div>
                    </div>
                    {iv.status !== "待开" && (
                      <Tooltip>
                        <TooltipTrigger render={
                          <Button variant="ghost" size="iconSm" aria-label={copy("print")}>
                            <Printer className="size-3.5" />
                          </Button>
                        } />
                        <TooltipContent>{copy("printInvoice")}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </DocumentSheetHeader>
                <DocumentSheetSection title={copy("purchaseAndSaleInformation")}>
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    <div>
                      <span className="text-muted">{copy("purchaser")}</span>
                      {iv.client}{copy("taxNumber")}{iv.taxNo}）
                    </div>
                    <div>
                      <span className="text-muted">{copy("seller")}</span>
                      {VENDOR.name}{copy("taxNumber2")}{VENDOR.taxNo}）
                    </div>
                    <div>
                      <span className="text-muted">{copy("relatedProjects")}</span>
                      {iv.projectName}
                    </div>
                  </div>
                </DocumentSheetSection>
                <DocumentSheetSection title={copy("amount")}>
                  <div className="flex justify-between border-y border-border py-2 text-sm">
                    <span className="text-muted">{copy("amountExcludingTax")}</span>
                    <span className="tabular-nums">{yuan(exTax)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-muted">{copy("taxAmount")}{(iv.taxRate * 100).toFixed(0)}%{copy("closingParenthesis")}</span>
                    <span className="tabular-nums">{yuan(tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border py-2 text-sm font-semibold text-primary">
                    <span>{copy("totalPriceAndTax")}</span>
                    <span className="tabular-nums">{yuan(iv.amount)}</span>
                  </div>
                  <div className="mt-1 text-right text-sm">
                    <span className="text-muted">{copy("uppercase")}</span>
                    <span className="font-medium">{rmbUpper(iv.amount)}</span>
                  </div>
                </DocumentSheetSection>
                <DocumentSheetFooter>
                  <div className="text-xs">{copy("accountOpeningBank")}{VENDOR.bank}{copy("address")}{VENDOR.addr}</div>
                </DocumentSheetFooter>
              </DocumentSheet>

              {/* 抽屉内操作 */}
              <div className="flex gap-2">
                {iv.status === "待开" && (
                  <Button size="sm" onClick={() => handleIssue(iv)} disabled={issuePending}>
                    {issuePending ? <Spinner size="sm" /> : copy("invoiceNow")}
                  </Button>
                )}
                {iv.status === "已开" && (
                  <Popconfirm
                    title={copy("areYouSureYouWantToVoid2")}
                    description={copy("afterBeingInvalidatedTheStatusWillReturn2")}
                    danger
                    okText={copy("confirmedToBeInvalid2")}
                    onConfirm={() => handleVoid(iv)}
                  >
                    <Button size="sm" variant="outline" tone="danger" disabled={voidPending}>
                      {voidPending ? <Spinner size="sm" /> : copy("voidInvoice")}
                    </Button>
                  </Popconfirm>
                )}
              </div>

              {/* 回款记录 */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{copy("paymentRecord")}</span>
                  <Text size="sm" tone="muted">{copy("total2")}{wan(paidAmount(iv))} / {wan(iv.amount)}
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
                            {payMethodLabel[p.method]}
                          </Tag>
                        </Text>
                      ),
                    }))}
                  />
                ) : (
                  <Empty size="sm" description={copy("noRecordOfPaymentYet")} />
                )}
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
