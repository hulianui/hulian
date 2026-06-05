"use client";
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
  success: { dot: "online", label: "成功", tone: "success" },
  error: { dot: "offline", label: "错误", tone: "danger" },
  rate_limited: { dot: "degraded", label: "限流", tone: "warning" },
  timeout: { dot: "offline", label: "超时", tone: "danger" },
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
    { color: "success", label: "+0ms", children: <Step title="入站" detail={`接收请求 · ${log.id}`} /> },
    { color: "success", label: `+${inbound}ms`, children: <Step title="鉴权" detail={`密钥「${log.keyName}」校验通过`} /> },
    { color: "success", label: `+${inbound + auth}ms`, children: <Step title="选渠道" detail={`路由至「${log.channel}」`} /> },
    {
      color: ok ? "primary" : "danger",
      label: `+${inbound + auth + route}ms`,
      children: <Step title="上游调用" detail={ok ? `上游返回 ${log.httpStatus} · 耗时 ${upstream}ms` : `上游异常 ${log.httpStatus} · 耗时 ${upstream}ms`} />,
    },
  ];
  if (ok) {
    items.push({
      color: "success",
      label: `+${total - billing}ms`,
      children: <Step title="计费" detail={`prompt ${log.promptTokens} + completion ${log.completionTokens} tok · ${formatUsd(log.costUsd)}`} />,
    });
    items.push({ color: "success", label: `+${total}ms`, children: <Step title="出站" detail="响应回传客户端" /> });
  } else {
    items.push({ color: "danger", label: `+${total}ms`, children: <Step title="出站" detail="返回错误响应（不计费）" /> });
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
        title={log ? `请求详情 · ${log.id}` : ""}
        className="w-[min(760px,94vw)]"
      >
        {log && meta && (
          <div className="flex flex-col gap-5">
            {/* 概要 */}
            <Descriptions bordered column={2} layout="horizontal">
              <DescriptionsItem label="请求 ID" span={2}>
                <span className="font-mono text-sm">{log.id}</span>
              </DescriptionsItem>
              <DescriptionsItem label="时间">{log.time.replace("T", " ").slice(0, 19)}</DescriptionsItem>
              <DescriptionsItem label="状态">
                <span className="inline-flex items-center gap-2">
                  <StatusDot status={meta.dot} label={meta.label} />
                  <Tag tone={meta.tone} size="sm" variant="soft">
                    HTTP {log.httpStatus}
                  </Tag>
                </span>
              </DescriptionsItem>
              <DescriptionsItem label="模型">
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
              <DescriptionsItem label="渠道">{log.channel}</DescriptionsItem>
              <DescriptionsItem label="密钥" span={2}>
                {log.keyName}
              </DescriptionsItem>
              <DescriptionsItem label="延迟">
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
              <CardHeader className="text-sm font-medium text-foreground">计费明细</CardHeader>
              <CardBody className="flex flex-col gap-1.5 text-sm">
                {log.costUsd > 0 && model ? (
                  <>
                    <Row
                      k={`输入 ${log.promptTokens} tok × $${model.inPrice}/1M`}
                      v={formatUsd(inCost)}
                    />
                    <Row
                      k={`输出 ${log.completionTokens} tok × $${model.outPrice}/1M`}
                      v={formatUsd(outCost)}
                    />
                    <Row k={`网关倍率 ×${model.markup}`} v="已计入" muted />
                    <div className="mt-1 flex items-center justify-between border-t border-border pt-2 font-semibold text-primary">
                      <span>合计</span>
                      <span className="tabular-nums">{formatUsd(log.costUsd)}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-muted">本次请求未成功，不计费（{formatUsd(0)}）。</span>
                )}
              </CardBody>
            </Card>

            {/* request / response body */}
            <div className="grid gap-4">
              <Card variant="outline">
                <CardHeader className="text-sm font-medium text-foreground">请求体 request</CardHeader>
                <CardBody>
                  <JsonViewer
                    data={log.request}
                    rootName="request"
                    defaultExpandedDepth={2}
                    onCopyPath={(p) => toast({ title: "已复制", description: p, tone: "info" })}
                  />
                </CardBody>
              </Card>
              <Card variant="outline">
                <CardHeader className="text-sm font-medium text-foreground">响应体 response</CardHeader>
                <CardBody>
                  <JsonViewer
                    data={log.response}
                    rootName="response"
                    defaultExpandedDepth={2}
                    onCopyPath={(p) => toast({ title: "已复制", description: p, tone: "info" })}
                  />
                </CardBody>
              </Card>
            </div>

            {/* 调用链路 */}
            <div>
              <div className="mb-3 text-sm font-medium text-foreground">调用链路</div>
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
