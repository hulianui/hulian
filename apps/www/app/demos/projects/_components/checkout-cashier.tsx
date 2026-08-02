"use client";
import { copy } from "./checkout-cashier.content";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Empty, QRCode, Result, Segmented, Spin, Spinner, Statistic, Tag, toast } from "@hulianui/ui";
import { Wallet } from "lucide-react";
import { checkoutById, payUrl, settlePayment } from "../_data/checkouts";
import { checkoutPayMethodLabel, checkoutStatusTone, rmbUpper, yuan } from "../_data/status";
import { PAY_METHODS, type PayMethod } from "../_data/types";

const FIFTEEN_MIN = 15 * 60 * 1000;
const VENDOR = copy("hulianConstructionEngineeringGroupCoLtd");

const METHOD_HINT: Record<PayMethod, string> = {
  微信支付: copy("pleaseScanWithWechatToCompleteThe"),
  支付宝: copy("pleaseUseAlipayToScanAndComplete"),
  对公网银: copy("pleaseUseCorporateOnlineBankingToScan"),
  银行卡: copy("pleaseUseTheMobileBankingAppTo"),
};

type Phase = "pay" | "paying" | "done" | "expired";

export function CheckoutCashier({ id }: { id: string }) {
  const router = useRouter();
  const co = checkoutById(id);
  const [method, setMethod] = useState<PayMethod>("微信支付");
  // 进收银台给一个实时 15 分钟支付窗口（mock 固定 expireAt 多已过期，演示用实时窗口）。
  // 仅喂给 Statistic.Countdown 的 effect，不直接渲染 → SSR 安全。
  const [deadline] = useState(() => Date.now() + FIFTEEN_MIN);
  const [phase, setPhase] = useState<Phase>(
    co?.status === "已支付" ? "done" : co?.status === "已关闭" ? "expired" : "pay",
  );
  const [serialNo, setSerialNo] = useState(co?.serialNo ?? "");

  if (!co) {
    return <Empty description={copy("theReceiptDoesNotExist")} />;
  }

  function handlePaid() {
    if (!co) return;
    setPhase("paying");
    window.setTimeout(() => {
      co.method = method;
      const paidAt = "2026-06-04 14:30";
      const sn = settlePayment(co, paidAt);
      co.status = "已支付";
      co.paidAt = paidAt;
      co.serialNo = sn;
      setSerialNo(sn);
      setPhase("done");
      // 支付成功 toast 反馈
      toast({ title: copy("paymentSuccessful"), description: copy("valueValueHasArrived", co.code, yuan(co.amount)), tone: "success" });
    }, 900);
  }

  if (phase === "done") {
    return (
      <div className="mx-auto w-full max-w-[560px]">
        <Card variant="outline">
          <CardBody className="p-8">
            <Result
              status="success"
              title={copy("paymentSuccessful2")}
              subTitle={`${co.code} · ${co.client}`}
              content={
                <div className="mx-auto mt-2 w-full max-w-[360px] rounded-[var(--radius)] bg-muted/40 p-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted">{copy("paymentAmount")}</span>
                    <span className="font-semibold tabular-nums">{yuan(co.amount)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">{copy("paymentMethod")}</span>
                    <span>{co.method ? checkoutPayMethodLabel[co.method] : "—"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">{copy("serialNumber")}</span>
                    <span className="tabular-nums text-xs">{serialNo}</span>
                  </div>
                </div>
              }
            >
              <Button onClick={() => router.push("/demos/projects/checkout")}>{copy("returnToPaymentList")}</Button>
              <Button variant="ghost" onClick={() => router.push("/demos/projects/invoices")}>{copy("viewInvoicePayment")}</Button>
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
            <Result status="warning" title={copy("invoiceHasBeenClosed")} subTitle={copy("thePaymentValidityPeriodHasExpiredPlease")}>
              <Button onClick={() => router.push("/demos/projects/checkout")}>{copy("returnToPaymentList2")}</Button>
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
              <span className="text-sm">{VENDOR}{copy("collectMoneyOnline")}</span>
            </div>
            <div className="text-3xl font-semibold tabular-nums text-foreground">{yuan(co.amount)}</div>
            <div className="text-xs text-muted">{rmbUpper(co.amount)}</div>
            <Tag tone={checkoutStatusTone(co.status)} size="sm" dot>
              {co.code} · {co.client}
            </Tag>
          </div>

          {/* 支付有效期倒计时（复用 Statistic.Countdown） */}
          <div className="flex items-center justify-center gap-2 rounded-[var(--radius)] bg-warning/10 py-2 text-warning">
            <span className="text-sm">{copy("payRemainingTime")}</span>
            <Statistic.Countdown
              deadline={deadline}
              format="mm:ss"
              onFinish={() => setPhase("expired")}
              valueStyle={{ fontSize: "1.25rem", color: "var(--color-warning)" }}
            />
          </div>

          {/* 支付方式 */}
          <Segmented
            aria-label={copy("paymentMethod2")}
            value={method}
            onValueChange={(v) => setMethod(v as PayMethod)}
            items={PAY_METHODS.map((m) => ({ value: m, label: checkoutPayMethodLabel[m] }))}
          />

          {/* 二维码 / 支付中 Spinner */}
          <div className="flex flex-col items-center gap-3">
            {phase === "paying" ? (
              <div className="grid size-[204px] place-items-center gap-3 flex-col">
                <Spin />
                <span className="text-sm text-muted">{copy("waitingForPaymentConfirmation")}</span>
              </div>
            ) : (
              <div className="rounded-[var(--radius)] border border-border p-4">
                <QRCode value={`${payUrl(co)}?m=${encodeURIComponent(method)}`} size={172} level="M" />
              </div>
            )}
            <div className="text-sm text-muted">{METHOD_HINT[method]}</div>
          </div>

          {/* 模拟支付 */}
          <Button className="w-full" disabled={phase === "paying"} onClick={handlePaid}>
            {phase === "paying" ? (
              <span className="inline-flex items-center gap-2"><Spinner size="sm" />{copy("processing")}</span>
            ) : copy("iHaveCompletedPayment")}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
