/** @jsxImportSource ../../../lib/fixture-jsx */
// 活动流时间线区块 —— 按时间倒序的事件列表。
// 每项：Avatar + 操作者 + 动作描述 + 相对时间 + 可选 Tag。
// 数据全内联，无外部依赖，复制即独立运行。

import { Avatar, Tag, Text, Timeline, type TimelineItemProps } from "@hulianui/ui";

interface Activity {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  tag?: { label: string; tone: "success" | "danger" | "warning" | "brand" | "neutral" };
  color: "success" | "primary" | "warning" | "danger" | "default";
}

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    actor: "张晓明",
    action: "将工单",
    target: "TK-20260605-042 · 生产环境登录接口 503 偶发",
    time: "刚刚",
    tag: { label: "已解决", tone: "success" },
    color: "success",
  },
  {
    id: "2",
    actor: "李思远",
    action: "评论了需求",
    target: "DM-2026-089 · 用户导出 Excel 支持自定义列",
    time: "5 分钟前",
    color: "primary",
  },
  {
    id: "3",
    actor: "王雪梅",
    action: "关闭了",
    target: "BUG-1102 · 移动端日期选择器在 iOS 16 显示异常",
    time: "22 分钟前",
    tag: { label: "已关闭", tone: "danger" },
    color: "danger",
  },
  {
    id: "4",
    actor: "陈建国",
    action: "创建了变更单",
    target: "RFC-0031 · 数据库连接池最大值从 200 调至 800",
    time: "1 小时前",
    tag: { label: "待审批", tone: "warning" },
    color: "warning",
  },
  {
    id: "5",
    actor: "刘芳",
    action: "合并了 PR",
    target: "#2347 · feat: 日志系统接入 OpenTelemetry",
    time: "2 小时前",
    tag: { label: "已合并", tone: "brand" },
    color: "success",
  },
  {
    id: "6",
    actor: "赵磊",
    action: "发布了版本",
    target: "v3.12.0 · 包含 14 个 bugfix、3 个新特性",
    time: "昨天 18:30",
    color: "primary",
  },
  {
    id: "7",
    actor: "周晨",
    action: "归档了项目",
    target: "旧官网迁移专项（已完结）",
    time: "昨天 15:10",
    tag: { label: "已归档", tone: "neutral" },
    color: "default",
  },
  {
    id: "8",
    actor: "吴凯",
    action: "上线了变更",
    target: "网关限流阈值从 1000 QPS → 2000 QPS（已灰度 10%）",
    time: "2 天前",
    color: "warning",
  },
];

function ActivityItem({ act }: { act: Activity }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar fallback={act.actor.slice(0, 1)} size="sm" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
          <span className="font-medium text-foreground">{act.actor}</span>
          <span className="text-muted">{act.action}</span>
          {act.tag && (
            <Tag tone={act.tag.tone} size="sm" variant="soft">
              {act.tag.label}
            </Tag>
          )}
        </div>
        <div className="mt-0.5 truncate text-xs text-muted">{act.target}</div>
        <Text size="xs" tone="muted" className="mt-1 tabular-nums">
          {act.time}
        </Text>
      </div>
    </div>
  );
}

const TIMELINE_ITEMS: TimelineItemProps[] = ACTIVITIES.map((act) => ({
  color: act.color,
  children: <ActivityItem act={act} />,
}));

export function ActivityTimelineBlock() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">最近动态</span>
        <Text size="sm" tone="muted">
          最近 7 天 · {ACTIVITIES.length} 条
        </Text>
      </div>
      <Timeline items={TIMELINE_ITEMS} />
    </div>
  );
}
