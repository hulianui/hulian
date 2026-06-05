"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Descriptions,
  Heading,
  Result,
  Tag,
  Textarea,
  Timeline,
  toast,
} from "@hulianui/ui";
import { ticketById } from "../_data/tickets";
import type { TicketPriority, TicketStatus } from "../_data/types";
import { CS_ROOT } from "./nav-config";

const PRIORITY_TONE: Record<TicketPriority, "neutral" | "brand" | "warning" | "danger"> = {
  低: "neutral",
  中: "brand",
  高: "warning",
  紧急: "danger",
};
const STATUS_TONE: Record<TicketStatus, "neutral" | "brand" | "warning" | "success"> = {
  待处理: "neutral",
  处理中: "brand",
  待回复: "warning",
  已解决: "success",
};

export function TicketDetail({ id }: { id: string }) {
  const ticket = ticketById(id);
  const [reply, setReply] = useState("");

  if (!ticket) {
    return (
      <Result status="404" title="工单不存在" subTitle={`未找到工单 #${id}，可能已被删除。`}>
        <Button render={<Link href={`${CS_ROOT}/tickets`} />}>返回工单列表</Button>
      </Result>
    );
  }

  const submit = () => {
    if (!reply.trim()) {
      toast({ title: "请输入回复内容", tone: "danger" });
      return;
    }
    toast({ title: "回复已提交", description: `已回复工单 #${ticket.id}`, tone: "info" });
    setReply("");
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href={`${CS_ROOT}/tickets`} />} className="px-2">
          <ArrowLeft className="size-4" /> 返回
        </Button>
        <Heading level={1} size="lg">
          #{ticket.id} · {ticket.subject}
        </Heading>
        <Tag tone={STATUS_TONE[ticket.status]} size="sm">
          {ticket.status}
        </Tag>
        <Tag tone={PRIORITY_TONE[ticket.priority]} size="sm" dot pulse={ticket.priority === "紧急"}>
          {ticket.priority}
        </Tag>
      </div>

      <Card>
        <CardHeader>工单概要</CardHeader>
        <CardBody>
          <Descriptions
            column={2}
            items={[
              { label: "客户", children: ticket.customerName },
              { label: "渠道", children: ticket.channel },
              { label: "受理人", children: ticket.assignee },
              { label: "创建时间", children: ticket.createdAt },
              { label: "更新时间", children: ticket.updatedAt },
              { label: "问题描述", span: 2, children: ticket.description },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>处理进展</CardHeader>
        <CardBody>
          <Timeline
            items={ticket.timeline.map((t, i) => ({
              label: `${t.at} · ${t.actor}`,
              children: t.text,
              color: i === ticket.timeline.length - 1 ? ("primary" as const) : ("success" as const),
            }))}
            pending={ticket.status !== "已解决" ? "等待坐席跟进…" : false}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>回复客户</CardHeader>
        <CardBody>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="输入回复内容，提交后将同步至客户…"
            rows={4}
            disabled={ticket.status === "已解决"}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReply("")}>
              清空
            </Button>
            <Button onClick={submit} disabled={ticket.status === "已解决"}>
              提交回复
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
