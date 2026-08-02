"use client";
import { copy } from "./ticket-detail.content";

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
import { channelLabel, ticketPriorityLabel, ticketStatusLabel } from "../_data/labels";

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
      <Result status="404" title={copy("workOrderDoesNotExist")} subTitle={copy("ticketValueNotFoundMayHaveBeen", id)}>
        <Button render={<Link href={`${CS_ROOT}/tickets`} />}>{copy("returnToWorkOrderList")}</Button>
      </Result>
    );
  }

  const submit = () => {
    if (!reply.trim()) {
      toast({ title: copy("pleaseEnterTheReplyContent"), tone: "danger" });
      return;
    }
    toast({ title: copy("replySubmitted"), description: copy("repliedToTicketValue", ticket.id), tone: "success" });
    setReply("");
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href={`${CS_ROOT}/tickets`} />} className="px-2">
          <ArrowLeft className="size-4" />{copy("return")}</Button>
        <Heading level={1} size="lg">
          #{ticket.id} · {ticket.subject}
        </Heading>
        <Tag tone={STATUS_TONE[ticket.status]} size="sm">
          {ticketStatusLabel[ticket.status]}
        </Tag>
        <Tag tone={PRIORITY_TONE[ticket.priority]} size="sm" dot pulse={ticket.priority === "紧急"}>
          {ticketPriorityLabel[ticket.priority]}
        </Tag>
      </div>

      <Card>
        <CardHeader>{copy("workOrderSummary")}</CardHeader>
        <CardBody>
          <Descriptions
            column={2}
            items={[
              { label: copy("customer"), children: ticket.customerName },
              { label: copy("channel"), children: channelLabel[ticket.channel] },
              { label: copy("assignee"), children: ticket.assignee },
              { label: copy("creationTime"), children: ticket.createdAt },
              { label: copy("updateTime"), children: ticket.updatedAt },
              { label: copy("problemDescription"), span: 2, children: ticket.description },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>{copy("processingProgress")}</CardHeader>
        <CardBody>
          <Timeline
            items={ticket.timeline.map((t, i) => ({
              label: `${t.at} · ${t.actor}`,
              children: t.text,
              color: i === ticket.timeline.length - 1 ? ("primary" as const) : ("success" as const),
            }))}
            pending={ticket.status !== "已解决" ? copy("waitingForAgent") : false}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>{copy("replyToCustomer")}</CardHeader>
        <CardBody>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={copy("enterTheReplyContentAndItWill")}
            rows={4}
            disabled={ticket.status === "已解决"}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReply("")}>{copy("clear")}</Button>
            <Button onClick={submit} disabled={ticket.status === "已解决"}>{copy("submitReply")}</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
