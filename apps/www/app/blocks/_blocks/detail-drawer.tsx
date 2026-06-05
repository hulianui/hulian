"use client";

// 详情抽屉区块 —— 按钮触发右滑 Drawer，展示单条记录的
// Descriptions 字段表 + 状态 Tag/StatusDot + Timeline 操作历史。
// 数据全内联，复制即独立运行。

import { useState } from "react";
import { FileText } from "lucide-react";
import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  DrawerContent,
  StatusDot,
  Tag,
  Timeline,
  type TimelineItemProps,
} from "@hulianui/ui";

interface Ticket {
  id: string;
  title: string;
  reporter: string;
  assignee: string;
  priority: "高" | "中" | "低";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  desc: string;
}

const TICKET: Ticket = {
  id: "TK-20260605-042",
  title: "生产环境登录接口 503 偶发",
  reporter: "陈晓雨",
  assignee: "王磊",
  priority: "高",
  status: "in_progress",
  createdAt: "2026-06-05 09:12",
  updatedAt: "2026-06-05 14:38",
  desc: "部分用户反馈登录时收到 503，复现概率约 15%，初步定位为网关层连接池耗尽。",
};

const STATUS_DOT_MAP: Record<Ticket["status"], { dot: "online" | "offline" | "degraded" | "maintenance"; label: string }> = {
  open: { dot: "maintenance", label: "待处理" },
  in_progress: { dot: "degraded", label: "处理中" },
  resolved: { dot: "online", label: "已解决" },
  closed: { dot: "offline", label: "已关闭" },
};

const STATUS_TAG_TONE: Record<Ticket["status"], "neutral" | "warning" | "success" | "danger"> = {
  open: "neutral",
  in_progress: "warning",
  resolved: "success",
  closed: "danger",
};

const PRIORITY_TONE: Record<Ticket["priority"], "danger" | "warning" | "neutral"> = {
  高: "danger",
  中: "warning",
  低: "neutral",
};

const HISTORY: TimelineItemProps[] = [
  {
    color: "success",
    label: "09:12",
    children: (
      <div className="text-sm">
        <span className="font-medium text-foreground">陈晓雨</span>
        <span className="text-muted"> 创建工单并标记优先级「高」</span>
      </div>
    ),
  },
  {
    color: "primary",
    label: "09:35",
    children: (
      <div className="text-sm">
        <span className="font-medium text-foreground">系统</span>
        <span className="text-muted"> 自动分配给 </span>
        <span className="font-medium text-foreground">王磊</span>
      </div>
    ),
  },
  {
    color: "primary",
    label: "10:08",
    children: (
      <div className="text-sm">
        <span className="font-medium text-foreground">王磊</span>
        <span className="text-muted"> 开始处理，状态变更为「处理中」</span>
      </div>
    ),
  },
  {
    color: "warning",
    label: "11:44",
    children: (
      <div className="text-sm">
        <span className="font-medium text-foreground">王磊</span>
        <span className="text-muted"> 追加备注：连接池最大值从 200 调至 800，观察中</span>
      </div>
    ),
  },
  {
    color: "default",
    label: "14:38",
    children: (
      <div className="text-sm">
        <span className="font-medium text-foreground">王磊</span>
        <span className="text-muted"> 等待压测验证，预计 16:00 前给出结论</span>
      </div>
    ),
  },
];

export function DetailDrawerBlock() {
  const [open, setOpen] = useState(false);

  const ticket = TICKET;
  const dotMeta = STATUS_DOT_MAP[ticket.status];

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* 触发区 —— 模拟列表行的操作入口 */}
      <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <FileText className="size-4 text-muted" />
          <div>
            <div className="text-sm font-medium text-foreground">{ticket.id}</div>
            <div className="text-xs text-muted">{ticket.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusDot status={dotMeta.dot} label={dotMeta.label} />
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            查看详情
          </Button>
        </div>
      </div>

      {/* 右滑抽屉 */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          side="right"
          title={`工单详情 · ${ticket.id}`}
          description={ticket.title}
          className="w-[min(520px,92vw)]"
        >
          <div className="flex flex-col gap-6">
            {/* 字段概要 */}
            <Descriptions bordered column={2} layout="horizontal">
              <DescriptionsItem label="工单编号" span={2}>
                <span className="font-mono text-sm">{ticket.id}</span>
              </DescriptionsItem>
              <DescriptionsItem label="状态">
                <span className="inline-flex items-center gap-2">
                  <StatusDot status={dotMeta.dot} label={dotMeta.label} />
                  <Tag tone={STATUS_TAG_TONE[ticket.status]} size="sm" variant="soft">
                    {dotMeta.label}
                  </Tag>
                </span>
              </DescriptionsItem>
              <DescriptionsItem label="优先级">
                <Tag tone={PRIORITY_TONE[ticket.priority]} size="sm">
                  {ticket.priority}
                </Tag>
              </DescriptionsItem>
              <DescriptionsItem label="报告人">{ticket.reporter}</DescriptionsItem>
              <DescriptionsItem label="负责人">{ticket.assignee}</DescriptionsItem>
              <DescriptionsItem label="创建时间">{ticket.createdAt}</DescriptionsItem>
              <DescriptionsItem label="最近更新">{ticket.updatedAt}</DescriptionsItem>
              <DescriptionsItem label="问题描述" span={2}>
                <span className="text-sm text-muted">{ticket.desc}</span>
              </DescriptionsItem>
            </Descriptions>

            {/* 操作历史 */}
            <div>
              <div className="mb-3 text-sm font-medium text-foreground">操作历史</div>
              <Timeline items={HISTORY} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
