"use client";
import { copy } from "./quote-editor.content";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  cn,
  DocumentSheet,
  DocumentSheetFooter,
  DocumentSheetHeader,
  DocumentSheetSection,
  DocumentSheetSignature,
  EditableTable,
  type EditableColumn,
  Field,
  Heading,
  Input,
  NumberField,
  Popconfirm,
  Result,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Spinner,
  Tag,
  Text,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
} from "@hulianui/ui";
import { ROOT } from "./nav-config";
import { lineTotal, quoteById, quoteTotals } from "../_data/quotes";
import { quoteStatusLabel, quoteStatusTone, rmbUpper, yuan } from "../_data/status";
import type { QuoteItem } from "../_data/types";
import { usePending } from "../../lib/async";

const TAX_OPTIONS = [
  { value: "0.13", label: "13%" },
  { value: "0.09", label: "9%" },
  { value: "0.06", label: "6%" },
  { value: "0", label: copy("taxFree") },
];

// 我方主体（demo 固定）。
const VENDOR = {
  name: copy("hulianConstructionEngineeringGroupCoLtd"),
  taxNo: "91330100MA2XHL0001",
  addr: copy("noJiangnanAvenueBinjiangDistrictHangzhou"),
  bank: copy("industrialAndCommercialBankOfChinaHangzhou"),
  contact: copy("chenGong"),
};

let seq = 0;
const nextId = () => `new-${seq++}`;

export function QuoteEditor({ id }: { id: string }) {
  const quote = quoteById(id);

  const [items, setItems] = useState<QuoteItem[]>(quote ? quote.items.map((i) => ({ ...i })) : []);
  const [taxRate, setTaxRate] = useState(String(quote?.taxRate ?? 0.09));
  const [validUntil, setValidUntil] = useState(quote?.validUntil ?? "");
  const [remark, setRemark] = useState(quote?.remark ?? "");
  const [view, setView] = useState("edit");
  const [savePending, runSave] = usePending();
  const [genPending, runGen] = usePending();

  const rate = Number(taxRate);
  const totals = useMemo(() => quoteTotals(items, rate), [items, rate]);

  if (!quote) {
    return (
      <Result
        status="error"
        title={copy("theQuotationDoesNotExist")}
        subTitle={copy("theQuotationMayHaveBeenDeletedDemo")}
      >
        <Button render={<Link href={`${ROOT}/quotes`} />}>{copy("returnToQuoteList")}</Button>
      </Result>
    );
  }

  const columns: EditableColumn<QuoteItem>[] = [
    { key: "name", title: copy("projectName"), editable: true, width: 200 },
    { key: "spec", title: copy("specificationsModels"), editable: true, width: 150 },
    { key: "unit", title: copy("unit"), editable: true, width: 70, align: "center" },
    {
      key: "qty",
      title: copy("quantity"),
      editable: true,
      width: 120,
      align: "right",
      render: (v) => <span className="tabular-nums">{String(v)}</span>,
      editor: (v, onChange) => (
        <NumberField aria-label={copy("quantity2")} value={(v as number) ?? 0} onValueChange={(n) => onChange(n ?? 0)} min={0} />
      ),
    },
    {
      key: "price",
      title: copy("unitPrice"),
      editable: true,
      width: 130,
      align: "right",
      render: (v) => <span className="tabular-nums">{yuan(v as number)}</span>,
      editor: (v, onChange) => (
        <NumberField aria-label={copy("unitPrice2")} value={(v as number) ?? 0} onValueChange={(n) => onChange(n ?? 0)} min={0} step={10} />
      ),
    },
    {
      key: "id",
      title: copy("subtotal"),
      align: "right",
      render: (_v, row) => <span className="tabular-nums font-medium">{yuan(lineTotal(row))}</span>,
    },
  ];

  // 自定义带 Popconfirm 的删除列（替换 EditableTable 的 deletable prop，使删除有确认弹层）。
  const deleteColumn: EditableColumn<QuoteItem> = {
    key: "id" as keyof QuoteItem & string,
    title: "",
    width: 48,
    align: "center",
    render: (_v, row) => (
      <Popconfirm
        title={copy("deleteThisLine")}
        description={copy("thisDetailRowCannotBeRestoredAfter")}
        danger
        okText={copy("delete")}
        side="left"
        onConfirm={() => {
          setItems((prev) => prev.filter((i) => i.id !== row.id));
          toast({ title: copy("detailRowDeleted"), tone: "info" });
        }}
      >
        <Tooltip>
          <TooltipTrigger render={
            <Button size="iconSm" variant="ghost" tone="danger" aria-label={copy("delete2")}>
              <Trash2 className="size-3.5" />
            </Button>
          } />
          <TooltipContent>{copy("deleteRow")}</TooltipContent>
        </Tooltip>
      </Popconfirm>
    ),
  };

  const allColumns = [...columns, deleteColumn];

  const handleSave = () => {
    void runSave(() => {
      toast({ title: copy("draftSaved"), tone: "success" });
    });
  };

  const handleGenerate = () => {
    void runGen(() => {
      toast({ title: copy("quotationHasBeenGenerated"), description: copy("valueHasBeenSavedAsTheOfficial", quote.code), tone: "success" });
    });
  };

  const viewSwitch = (
    <Segmented
      size="sm"
      value={view}
      onValueChange={setView}
      items={[
        { value: "edit", label: <span className="inline-flex items-center gap-1.5"><Pencil className="size-4" />{copy("edit")}</span> },
        { value: "preview", label: <span className="inline-flex items-center gap-1.5"><Eye className="size-4" />{copy("previewPrint")}</span> },
      ]}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      {/* 头部 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Tooltip>
            <TooltipTrigger render={
              <Button
                variant="ghost"
                size="sm"
                className="mt-0.5 size-8 px-0"
                aria-label={copy("return")}
                render={<Link href={`${ROOT}/quotes`} />}
              >
                <ArrowLeft className="size-4" />
              </Button>
            } />
            <TooltipContent>{copy("returnToQuoteList2")}</TooltipContent>
          </Tooltip>
          <div>
            <div className="flex items-center gap-2">
              <Heading level={2} size="xl">
                {quote.code}
              </Heading>
              <Tag tone={quoteStatusTone(quote.status)} size="sm" dot>
                {quoteStatusLabel[quote.status]}
              </Tag>
            </div>
            <Text tone="muted" size="sm" className="mt-1">
              {quote.projectName} · {quote.client}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view === "edit" && (
            <>
              <Button size="sm" variant="outline" onClick={handleSave} disabled={savePending}>
                {savePending ? <Spinner size="sm" /> : copy("saveDraft")}
              </Button>
              <Button size="sm" onClick={handleGenerate} disabled={genPending}>
                {genPending ? <Spinner size="sm" /> : copy("generateDocuments")}
              </Button>
            </>
          )}
          {viewSwitch}
        </div>
      </div>

      {view === "edit" ? (
        <>
          {/* 抬头字段 */}
          <Card variant="outline">
            <CardBody className="grid grid-cols-1 gap-x-4 gap-y-1 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={copy("partyARaisesItsHead")}>
                <Input value={quote.client} readOnly />
              </Field>
              <Field label={copy("relatedProjects")}>
                <Input value={quote.projectName} readOnly />
              </Field>
              <Field label={copy("validUntil")}>
                <Input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} placeholder="YYYY-MM-DD" />
              </Field>
              <Field label={copy("taxRate")}>
                <Select items={TAX_OPTIONS} value={taxRate} onValueChange={(v) => setTaxRate(v as string)}>
                  <SelectTrigger />
                  <SelectContent>
                    {TAX_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={copy("remarks")} className="sm:col-span-2 lg:col-span-4">
                <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={2} />
              </Field>
            </CardBody>
          </Card>

          {/* 明细行项（实时算价 + 合计页脚 + 自定义删除列） */}
          <Card variant="outline">
            <CardBody className="p-5">
              <EditableTable<QuoteItem>
                columns={allColumns}
                data={items}
                rowKey={(r) => r.id}
                onChange={setItems}
                addable
                newRow={() => ({ id: nextId(), name: copy("newItem"), spec: "", unit: copy("item"), qty: 1, price: 0 })}
                summary={(rows) => {
                  const t = quoteTotals(rows, rate);
                  const cell = "px-3 py-2 text-right tabular-nums";
                  return (
                    <>
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-right text-muted-foreground">{copy("totalExcludingTax")}</td>
                        <td className={cell}>{yuan(t.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-right text-muted-foreground">{copy("taxAmount")}{(rate * 100).toFixed(0)}%{copy("closingParenthesis")}
                        </td>
                        <td className={cell}>{yuan(t.tax)}</td>
                      </tr>
                      <tr className="text-primary">
                        <td colSpan={6} className="px-3 py-2 text-right font-semibold">{copy("totalPriceAndTax")}</td>
                        <td className={cn(cell, "font-semibold")}>{yuan(t.total)}</td>
                      </tr>
                    </>
                  );
                }}
              />
              <Text size="sm" tone="muted" className="mt-3">{copy("totalPriceAndTaxInCapitalLetters")}{rmbUpper(totals.total)}
              </Text>
            </CardBody>
          </Card>
        </>
      ) : (
        <DocumentSheet>
          <DocumentSheetHeader>
            <div>
              <div className="text-xl font-bold text-foreground">{VENDOR.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{copy("projectQuotationQuotation")}</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div className="text-base font-semibold tabular-nums text-foreground">{quote.code}</div>
              <div className="mt-1">{copy("orderMakingDate")}{quote.createdAt}</div>
              <div>{copy("validUntil2")}{validUntil}</div>
            </div>
          </DocumentSheetHeader>

          <DocumentSheetSection title={copy("customerInformation")}>
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">{copy("partyA")}</span>
                {quote.client}
              </div>
              <div>
                <span className="text-muted-foreground">{copy("project")}</span>
                {quote.projectName}
              </div>
              <div>
                <span className="text-muted-foreground">{copy("orderMaker")}</span>
                {quote.owner}
              </div>
            </div>
          </DocumentSheetSection>

          <DocumentSheetSection title={copy("quotationDetails")}>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-muted-foreground">
                  <th className="py-2 pr-2 text-left font-medium">{copy("serialNumber")}</th>
                  <th className="py-2 pr-2 text-left font-medium">{copy("projectName2")}</th>
                  <th className="py-2 pr-2 text-left font-medium">{copy("specifications")}</th>
                  <th className="py-2 pr-2 text-center font-medium">{copy("unit2")}</th>
                  <th className="py-2 pr-2 text-right font-medium">{copy("quantity3")}</th>
                  <th className="py-2 pr-2 text-right font-medium">{copy("unitPrice3")}</th>
                  <th className="py-2 text-right font-medium">{copy("subtotal2")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id} className="border-b border-border/70">
                    <td className="py-2 pr-2 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-2">{it.name}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{it.spec}</td>
                    <td className="py-2 pr-2 text-center">{it.unit}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{it.qty}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{yuan(it.price)}</td>
                    <td className="py-2 text-right tabular-nums">{yuan(lineTotal(it))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="py-2 pr-2 text-right text-muted-foreground">{copy("totalExcludingTax2")}</td>
                  <td className="py-2 text-right tabular-nums">{yuan(totals.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={6} className="py-2 pr-2 text-right text-muted-foreground">{copy("taxAmount2")}{(rate * 100).toFixed(0)}%{copy("closingParenthesis")}
                  </td>
                  <td className="py-2 text-right tabular-nums">{yuan(totals.tax)}</td>
                </tr>
                <tr>
                  <td colSpan={6} className="py-2 pr-2 text-right font-semibold">{copy("totalPriceAndTax2")}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{yuan(totals.total)}</td>
                </tr>
              </tfoot>
            </table>
            <div className="mt-2 text-right text-sm">
              <span className="text-muted-foreground">{copy("uppercase")}</span>
              <span className="font-medium">{rmbUpper(totals.total)}</span>
            </div>
          </DocumentSheetSection>

          {remark && (
            <DocumentSheetSection title={copy("remarks2")}>
              <Text size="sm">{remark}</Text>
            </DocumentSheetSection>
          )}

          <DocumentSheetFooter>
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <div>{copy("accountOpeningBank")}{VENDOR.bank}</div>
                <div>{copy("taxIdNumber")}{VENDOR.taxNo}</div>
                <div>{copy("address")}{VENDOR.addr}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div>{copy("contactPerson")}{VENDOR.contact}</div>
                <DocumentSheetSignature label={copy("sellerSSignature")} />
              </div>
            </div>
          </DocumentSheetFooter>
        </DocumentSheet>
      )}
    </div>
  );
}
