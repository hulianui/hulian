"use client";
import { copy } from "./page.content";
import { DEMO_RELATIVE_TIME_LOCALE } from "../../../_components/demo-locale";

import { useState } from "react";
import {
  Banner,
  ButtonGroup,
  Button,
  Glimpse,
  RelativeTime,
  Tag,
  Drawer,
  DrawerContent,
  Descriptions,
  DescriptionsItem,
  Empty,
  toast,
} from "@hulianui/ui";
import { TriangleAlert, Download, FileText } from "lucide-react";
import { invoices, invoiceStatusMeta } from "../../_data/invoices";
import { formatMoney } from "../../_data/plans";
import type { Invoice, InvoiceStatus } from "../../_data/types";

const filters: { key: "all" | InvoiceStatus; label: string }[] = [
  { key: "all", label: copy("all") },
  { key: "paid", label: copy("paid") },
  { key: "failed", label: copy("paymentFailed") },
  { key: "refunded", label: copy("refunded") },
];

export default function InvoicesPage() {
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const [active, setActive] = useState<Invoice | null>(null);

  const failed = invoices.filter((i) => i.status === "failed");
  const rows = invoices.filter((i) => filter === "all" || i.status === filter);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{copy("billsAndInvoices")}</h1>
          <p className="mt-1 text-sm text-muted">
            {copy("totalPaid")} <span className="font-medium text-foreground">{formatMoney(totalPaid)}</span>
            {copy("invoiceCount", invoices.length)}
          </p>
        </div>
        <ButtonGroup aria-label={copy("filterByStatus")}>
          {filters.map((f) => (
            <Button key={f.key} variant={filter === f.key ? "solid" : "outline"} size="sm" onClick={() => setFilter(f.key)}>
              {f.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* 支付失败告警条 */}
      {failed.length > 0 && (
        <Banner
          tone="danger"
          variant="soft"
          icon={<TriangleAlert />}
          align="start"
          action={
            <Button size="sm" variant="outline" onClick={() => toast({ title: copy("reDebitHasBeenInitiated"), tone: "info" })}>{copy("tryAgainNow")}</Button>
          }
        >{copy(failed.length === 1 ? "oneFailedPayment" : "failedPaymentCount", failed.length)}</Banner>
      )}

      {/* 账单表 */}
      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        {rows.length === 0 ? (
          <div className="py-16">
            <Empty description={copy("thereIsNoBillInThisStatus")} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">{copy("invoiceNumber")}</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">{copy("project")}</th>
                <th className="px-5 py-3 font-medium">{copy("settlement")}</th>
                <th className="px-5 py-3 text-right font-medium">{copy("amount")}</th>
                <th className="px-5 py-3 font-medium">{copy("status")}</th>
                <th className="px-5 py-3 text-right font-medium">{copy("operation")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((inv) => {
                const meta = invoiceStatusMeta[inv.status];
                return (
                  <tr key={inv.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-5 py-3.5">
                      <Glimpse
                        title={`${inv.id} · ${inv.plan}`}
                        description={copy("billingPeriodValueTotalValueIncludingValue", inv.period, formatMoney(inv.amount), inv.lines.length)}
                      >
                        <span className="font-medium text-foreground">{inv.id}</span>
                      </Glimpse>
                    </td>
                    <td className="hidden px-5 py-3.5 text-muted sm:table-cell">{inv.plan}</td>
                    <td className="px-5 py-3.5 text-muted">
                      <RelativeTime value={inv.date} locale={DEMO_RELATIVE_TIME_LOCALE} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">{formatMoney(inv.amount)}</td>
                    <td className="px-5 py-3.5">
                      <Tag tone={meta.tone} size="sm">{meta.label}</Tag>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setActive(inv)}>{copy("details")}</Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={copy("downloadPdf")}
                          onClick={() => toast({ title: copy("downloadedValuePdf", inv.id), tone: "info" })}
                        >
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* 详情抽屉 */}
      <Drawer open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DrawerContent
          side="right"
          title={active ? copy("valueInvoiceDetails", active.id) : ""}
          className="w-[min(560px,92vw)]"
          footer={
            active && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActive(null)}>{copy("close")}</Button>
                <Button onClick={() => toast({ title: copy("downloadedValuePdf2", active.id), tone: "info" })}>
                  <Download className="size-4" />{copy("downloadPdf2")}</Button>
              </div>
            )
          }
        >
          {active && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-bg p-4">
                <span className="grid size-10 place-items-center rounded-[var(--radius)] bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{active.plan}</p>
                  <p className="text-xs text-muted">{copy("settlement2")}<RelativeTime value={active.date} locale={DEMO_RELATIVE_TIME_LOCALE} /> · {active.period}
                  </p>
                </div>
                <Tag tone={invoiceStatusMeta[active.status].tone} size="sm" className="ml-auto">
                  {invoiceStatusMeta[active.status].label}
                </Tag>
              </div>

              <Descriptions column={2} bordered>
                <DescriptionsItem label={copy("invoiceNumber2")}>{active.id}</DescriptionsItem>
                <DescriptionsItem label={copy("invoicingSubject")}>{copy("hanyunDigitalIntelligenceTechnologyCoLtd")}</DescriptionsItem>
                <DescriptionsItem label={copy("taxIdNumber")}>91110108MA0XXXXX</DescriptionsItem>
                <DescriptionsItem label={copy("paymentMethod")}>{active.status === "paid" ? copy("automaticDeduction") : "—"}</DescriptionsItem>
              </Descriptions>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{copy("costDetails")}</h3>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {active.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="py-2.5 text-muted">{l.label}</td>
                        <td className="py-2.5 text-right font-medium tabular-nums text-foreground">{formatMoney(l.amount)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-3 font-semibold text-foreground">{copy("total2")}</td>
                      <td className="pt-3 text-right text-base font-semibold tabular-nums text-foreground">{formatMoney(active.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
