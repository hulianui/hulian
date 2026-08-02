"use client";
import { copy } from "./log-detail-drawer.content";

import {
  Card,
  CardBody,
  CardHeader,
  Descriptions,
  DescriptionsItem,
  Drawer,
  DrawerContent,
  JsonViewer,
  StatusDot,
  Tag,
  Timeline,
  toast,
  type ChannelStatus,
  type TimelineItemProps,
} from "@hulianui/ui";
import type { RequestLog } from "../../_data/types";
import { modelOf, providerOf } from "../../_data/providers";
import { costOf, formatUsd } from "../../_lib/pricing";

const statusMeta: Record<RequestLog["status"], { dot: ChannelStatus; label: string; tone: "success" | "danger" | "warning" }> = {
  success: { dot: "online", label: copy("success"), tone: "success" },
  error: { dot: "offline", label: copy("error"), tone: "danger" },
  rate_limited: { dot: "degraded", label: copy("currentLimiting"), tone: "warning" },
  timeout: { dot: "offline", label: copy("timeout"), tone: "danger" },
};

/** 把单条日志的总延迟拆成 6 段链路（按比例编点，纯展示）。 */
function callTimeline(log: RequestLog): TimelineItemProps[] {
  const ok = log.status === "success";
  const total = Math.max(log.latencyMs, 1);
  // 网关自身环节占比小，上游调用是大头。
  const inbound = Math.round(total * 0.01) + 1;
  const auth = Math.round(total * 0.015) + 1;
  const route = Math.round(total * 0.02) + 1;
  const upstream = ok ? Math.round(total * 0.93) : total - inbound - auth - route;
  const billing = ok ? Math.round(total * 0.015) + 1 : 0;

  const items: TimelineItemProps[] = [
    { color: "success", label: "+0ms", children: <Step title={copy("inbound")} detail={copy("receiveRequestValue", log.id)} /> },
    { color: "success", label: `+${inbound}ms`, children: <Step title={copy("authentication")} detail={copy("keyValueVerificationPassed", log.keyName)} /> },
    { color: "success", label: `+${inbound + auth}ms`, children: <Step title={copy("chooseChannel")} detail={copy("routeToValue", log.channel)} /> },
    {
      color: ok ? "primary" : "danger",
      label: `+${inbound + auth + route}ms`,
      children: <Step title={copy("upstreamCall")} detail={ok ? copy("upstreamReturnsValueTakesValueMs", log.httpStatus, upstream) : copy("upstreamExceptionValueTookValueMs", log.httpStatus, upstream)} />,
    },
  ];
  if (ok) {
    items.push({
      color: "success",
      label: `+${total - billing}ms`,
      children: <Step title={copy("billing")} detail={`prompt ${log.promptTokens} + completion ${log.completionTokens} tok · ${formatUsd(log.costUsd)}`} />,
    });
    items.push({ color: "success", label: `+${total}ms`, children: <Step title={copy("outbound")} detail={copy("responseBackToClient")} /> });
  } else {
    items.push({ color: "danger", label: `+${total}ms`, children: <Step title={copy("outbound2")} detail={copy("returnErrorResponseNotBilled")} /> });
  }
  return items;
}

function Step({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="text-sm">
      <span className="font-medium text-foreground">{title}</span>
      <div className="text-xs text-muted">{detail}</div>
    </div>
  );
}

export function LogDetailDrawer({ log, onClose }: { log: RequestLog | null; onClose: () => void }) {
  const model = log ? modelOf(log.model) : undefined;
  const provider = model ? providerOf(model.provider) : undefined;
  const meta = log ? statusMeta[log.status] : null;

  // 计费明细拆分（input / output 分开 × 倍率）。
  const inCost = log && model ? costOf(log.promptTokens, 0, model.inPrice, model.outPrice, model.markup) : 0;
  const outCost = log && model ? costOf(0, log.completionTokens, model.inPrice, model.outPrice, model.markup) : 0;

  return (
    <Drawer open={log !== null} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent
        side="right"
        title={log ? copy("requestDetailsValue", log.id) : ""}
        className="w-[min(760px,94vw)]"
      >
        {log && meta && (
          <div className="flex flex-col gap-5">
            {/* 概要 */}
            <Descriptions bordered column={2} layout="horizontal">
              <DescriptionsItem label={copy("requestId")} span={2}>
                <span className="font-mono text-sm">{log.id}</span>
              </DescriptionsItem>
              <DescriptionsItem label={copy("time")}>{log.time.replace("T", " ").slice(0, 19)}</DescriptionsItem>
              <DescriptionsItem label={copy("status")}>
                <span className="inline-flex items-center gap-2">
                  <StatusDot status={meta.dot} label={meta.label} />
                  <Tag tone={meta.tone} size="sm" variant="soft">
                    HTTP {log.httpStatus}
                  </Tag>
                </span>
              </DescriptionsItem>
              <DescriptionsItem label={copy("model")}>
                {provider && (
                  <span
                    className="mr-1.5 inline-flex size-4 items-center justify-center rounded-[3px] align-text-bottom text-[9px] font-bold text-white"
                    style={{ backgroundColor: provider.color }}
                  >
                    {provider.glyph}
                  </span>
                )}
                {model?.name ?? log.model}
              </DescriptionsItem>
              <DescriptionsItem label={copy("channel")}>{log.channel}</DescriptionsItem>
              <DescriptionsItem label={copy("key")} span={2}>
                {log.keyName}
              </DescriptionsItem>
              <DescriptionsItem label={copy("delay")}>
                <span className="tabular-nums">{log.latencyMs.toLocaleString()} ms</span>
              </DescriptionsItem>
              <DescriptionsItem label="Tokens">
                <span className="tabular-nums">
                  {log.promptTokens.toLocaleString()} prompt · {log.completionTokens.toLocaleString()} completion
                </span>
              </DescriptionsItem>
            </Descriptions>

            {/* 计费明细 */}
            <Card variant="outline">
              <CardHeader className="text-sm font-medium text-foreground">{copy("billingDetails")}</CardHeader>
              <CardBody className="flex flex-col gap-1.5 text-sm">
                {log.costUsd > 0 && model ? (
                  <>
                    <Row
                      k={copy("enterValueTokValueM", log.promptTokens, model.inPrice)}
                      v={formatUsd(inCost)}
                    />
                    <Row
                      k={copy("outputValueTokValueM", log.completionTokens, model.outPrice)}
                      v={formatUsd(outCost)}
                    />
                    <Row k={copy("gatewayMultiplierValue", model.markup)} v={copy("alreadyIncluded")} muted />
                    <div className="mt-1 flex items-center justify-between border-t border-border pt-2 font-semibold text-primary">
                      <span>{copy("total")}</span>
                      <span className="tabular-nums">{formatUsd(log.costUsd)}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-muted">{copy("thisRequestWasUnsuccessfulAndWillNot")}{formatUsd(0)}）。</span>
                )}
              </CardBody>
            </Card>

            {/* request / response body */}
            <div className="grid gap-4">
              <Card variant="outline">
                <CardHeader className="text-sm font-medium text-foreground">{copy("requestBodyRequest")}</CardHeader>
                <CardBody>
                  <JsonViewer
                    data={log.request}
                    rootName="request"
                    defaultExpandedDepth={2}
                    onCopyPath={(p) => toast({ title: copy("copied"), description: p, tone: "info" })}
                  />
                </CardBody>
              </Card>
              <Card variant="outline">
                <CardHeader className="text-sm font-medium text-foreground">{copy("responseBodyResponse")}</CardHeader>
                <CardBody>
                  <JsonViewer
                    data={log.response}
                    rootName="response"
                    defaultExpandedDepth={2}
                    onCopyPath={(p) => toast({ title: copy("copied2"), description: p, tone: "info" })}
                  />
                </CardBody>
              </Card>
            </div>

            {/* 调用链路 */}
            <div>
              <div className="mb-3 text-sm font-medium text-foreground">{copy("callLink")}</div>
              <Timeline items={callTimeline(log)} />
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{k}</span>
      <span className={muted ? "text-muted" : "tabular-nums text-foreground"}>{v}</span>
    </div>
  );
}
