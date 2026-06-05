"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Empty, QRCode, Result, Segmented, Spin, Spinner, Statistic, Tag, toast } from "@hulianui/ui";
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
    return <Empty description="收款单不存在" />;
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
      toast({ title: "支付成功", description: `${co.code} · ${yuan(co.amount)} 已到账`, tone: "info" });
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
            <Result status="warning" title="收款单已关闭" subTitle="支付有效期已过，请返回列表重新发起收款">
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

          {/* 支付有效期倒计时（复用 Statistic.Countdown） */}
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

          {/* 二维码 / 支付中 Spinner */}
          <div className="flex flex-col items-center gap-3">
            {phase === "paying" ? (
              <div className="grid size-[204px] place-items-center gap-3 flex-col">
                <Spin />
                <span className="text-sm text-muted">等待支付确认…</span>
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
              <span className="inline-flex items-center gap-2"><Spinner size="sm" />处理中</span>
            ) : "我已完成支付"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
