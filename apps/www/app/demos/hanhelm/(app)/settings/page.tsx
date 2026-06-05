"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowDownWideNarrow,
  Bell,
  KeyRound,
  PauseCircle,
  RefreshCw,
  Webhook,
} from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Choicebox,
  ChoiceboxGroup,
  Field,
  List,
  ListItem,
  ListItemMeta,
  NumberField,
  PageHeader,
  SecretField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  StatusDot,
  Switch,
  Tag,
  Text,
  toast,
} from "@hulian/ui";
import type { ChannelStatus } from "@hulian/ui";
import { MEMBERS } from "../../_data/members";

const MOCK_TOKEN = "whk_hanhelm_live_8c1f4a92e7d6b035af18cd24ef60ab73";

// 已接任务来源（mock）。
interface Source {
  id: string;
  name: string;
  desc: string;
  status: ChannelStatus;
  statusLabel: string;
}
const SOURCES: Source[] = [
  { id: "s-api", name: "OpenAPI 任务提交", desc: "POST /v1/tasks · 内部业务系统直连", status: "online", statusLabel: "在线" },
  { id: "s-wecom", name: "企业微信审批流", desc: "审批通过自动建任务", status: "online", statusLabel: "在线" },
  { id: "s-cron", name: "定时批处理调度", desc: "每日 02:00 离线任务批量入队", status: "degraded", statusLabel: "降级" },
  { id: "s-mq", name: "Kafka 事件总线", desc: "topic: ai-tasks · 消费滞后告警", status: "offline", statusLabel: "离线" },
];

// 角色 → Tag 语义色。
const ROLE_TONE: Record<string, "brand" | "warning" | "neutral"> = {
  调度平台负责人: "brand",
  "路由策略工程师": "neutral",
  "执行器运维 SRE": "warning",
  "成本治理分析师": "neutral",
  "SLA 与告警值班": "warning",
  "Agent 编排开发": "neutral",
};

/** 区块容器：标题 + 描述 + 内容。 */
function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card variant="outline">
      <CardHeader className="px-5 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-primary/10 text-primary">
            {icon}
          </span>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-foreground">{title}</div>
            {description && <div className="mt-0.5 text-xs text-muted">{description}</div>}
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-5 pb-5">{children}</CardBody>
    </Card>
  );
}

export default function SettingsPage() {
  // 全局策略
  const [defaultPriority, setDefaultPriority] = useState("P2");
  const [costCap, setCostCap] = useState<number | null>(8);
  const [degradePolicy, setDegradePolicy] = useState<string>("cheaper");

  // 通知渠道
  const [alertChannels, setAlertChannels] = useState<string[]>(["wecom", "sms"]);
  const [notifyFiring, setNotifyFiring] = useState(true);
  const [notifyResolved, setNotifyResolved] = useState(false);
  const [notifyDigest, setNotifyDigest] = useState(true);

  const handleSave = () => {
    toast({
      title: "设置已保存",
      description: "全局调度策略与通知配置已生效（mock）。",
      tone: "info",
    });
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      <PageHeader
        title="设置"
        subTitle="任务接入 · 团队成员 · 全局调度策略 · 告警通知"
        extra={
          <Button variant="solid" onClick={handleSave}>
            保存设置
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* —— 接入 —— */}
        <Section
          icon={<Webhook className="size-5" />}
          title="任务来源接入"
          description="对接外部系统的 Webhook 凭证与已接来源"
        >
          <Field
            label={
              <span className="inline-flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-muted" />
                接入密钥 Token
              </span>
            }
            description="外部系统调用任务提交 API 时携带此密钥；泄露请立即吊销重置。"
          >
            <SecretField
              value={MOCK_TOKEN}
              onCopy={() => toast({ title: "已复制接入密钥", tone: "neutral" })}
              actions={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast({ title: "已重新生成密钥", description: "旧密钥即刻失效。", tone: "danger" })}
                >
                  <RefreshCw className="size-3.5" />
                  重置
                </Button>
              }
            />
          </Field>

          <div className="mt-4">
            <Text size="sm" tone="muted" className="mb-1.5 block">
              已接来源
            </Text>
            <List
              size="sm"
              bordered
              split
              items={SOURCES}
              renderItem={(s) => (
                <ListItem
                  key={s.id}
                  actions={[
                    <StatusDot key="dot" status={s.status} size="md" label={s.statusLabel} />,
                  ]}
                >
                  <ListItemMeta
                    title={<span className="text-[13px] font-medium">{s.name}</span>}
                    description={<span className="text-[11px] text-muted">{s.desc}</span>}
                  />
                </ListItem>
              )}
            />
          </div>
        </Section>

        {/* —— 团队成员 —— */}
        <Section
          icon={<KeyRound className="size-5" />}
          title="团队成员"
          description="调度平台协作成员与角色权限"
        >
          <List
            size="md"
            bordered
            split
            items={MEMBERS}
            renderItem={(m) => (
              <ListItem
                key={m.id}
                actions={[
                  <Tag key="role" tone={ROLE_TONE[m.role] ?? "neutral"} size="sm" variant="soft">
                    {m.role}
                  </Tag>,
                  <StatusDot
                    key="online"
                    status={m.online ? "online" : "offline"}
                    size="md"
                    label={m.online ? "在线" : "离线"}
                  />,
                ]}
              >
                <ListItemMeta
                  avatar={<Avatar fallback={m.avatar} />}
                  title={<span className="text-sm font-medium">{m.name}</span>}
                  description={<span className="text-xs text-muted">成员 ID · {m.id}</span>}
                />
              </ListItem>
            )}
          />
        </Section>

        {/* —— 全局策略 —— */}
        <Section
          icon={<ArrowDownWideNarrow className="size-5" />}
          title="全局调度策略"
          description="任务默认值与失败时的降级行为"
        >
          <div className="flex flex-col gap-4">
            <Field label="默认优先级" description="未显式指定优先级的任务采用此默认值。">
              <Select
                items={["P0", "P1", "P2", "P3"].map((p) => ({ value: p, label: p }))}
                value={defaultPriority}
                onValueChange={(v) => setDefaultPriority((v as string) ?? defaultPriority)}
              >
                <SelectTrigger className="w-full" />
                <SelectContent>
                  {["P0", "P1", "P2", "P3"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="全局成本上限（元 / 任务）" description="单任务累计成本超过上限即触发降级 / 暂停。">
              <NumberField
                value={costCap}
                onValueChange={setCostCap}
                min={0}
                step={0.5}
                aria-label="全局成本上限"
              />
            </Field>

            <Field label="默认降级策略" description="执行器失败 / 超载 / 超预算时的兜底动作。">
              <ChoiceboxGroup
                value={degradePolicy}
                onValueChange={(v) => setDegradePolicy(v as string)}
                columns={1}
                aria-label="默认降级策略"
              >
                <Choicebox
                  value="cheaper"
                  icon={<ArrowDownWideNarrow className="size-5" />}
                  title="降级到便宜模型"
                  description="按降级链切换至低成本执行器，保完成不保质量。"
                />
                <Choicebox
                  value="retry"
                  icon={<RefreshCw className="size-5" />}
                  title="原执行器重试"
                  description="指数退避重试当前执行器，最多 3 次后转人工。"
                />
                <Choicebox
                  value="pause"
                  icon={<PauseCircle className="size-5" />}
                  title="暂停并告警"
                  description="挂起任务并通知值班，等待人工介入决策。"
                />
              </ChoiceboxGroup>
            </Field>
          </div>
        </Section>

        {/* —— 通知 —— */}
        <Section
          icon={<Bell className="size-5" />}
          title="告警通知"
          description="告警触达渠道与通知时机"
        >
          <div className="flex flex-col gap-4">
            <Field label="告警渠道" description="SLA 违约 / 失败率 / 队列积压 / 成本超预算时的触达渠道（可多选）。">
              <ChoiceboxGroup
                multiple
                value={alertChannels}
                onValueChange={(v) => setAlertChannels(v as string[])}
                columns={2}
                aria-label="告警渠道"
              >
                <Choicebox value="wecom" title="企业微信" description="值班群机器人推送" />
                <Choicebox value="sms" title="短信" description="P0 critical 兜底" />
                <Choicebox value="email" title="邮件" description="日报 / 周报汇总" />
                <Choicebox value="webhook" title="Webhook" description="对接 PagerDuty / 飞书" />
              </ChoiceboxGroup>
            </Field>

            <Field label="通知时机">
              <List size="sm" bordered split>
                <ListItem actions={[<Switch key="t" checked={notifyFiring} onCheckedChange={setNotifyFiring} aria-label="告警触发即通知" />]}>
                  <ListItemMeta
                    title={<span className="text-[13px] font-medium">告警触发即通知</span>}
                    description={<span className="text-[11px] text-muted">规则命中阈值的瞬间实时推送。</span>}
                  />
                </ListItem>
                <ListItem actions={[<Switch key="r" checked={notifyResolved} onCheckedChange={setNotifyResolved} aria-label="告警恢复通知" />]}>
                  <ListItemMeta
                    title={<span className="text-[13px] font-medium">告警恢复通知</span>}
                    description={<span className="text-[11px] text-muted">指标回落至阈值内时推送恢复消息。</span>}
                  />
                </ListItem>
                <ListItem actions={[<Switch key="d" checked={notifyDigest} onCheckedChange={setNotifyDigest} aria-label="每日汇总摘要" />]}>
                  <ListItemMeta
                    title={<span className="text-[13px] font-medium">每日汇总摘要</span>}
                    description={<span className="text-[11px] text-muted">每日 09:00 汇总昨日 SLA / 成本 / 失败概览。</span>}
                  />
                </ListItem>
              </List>
            </Field>
          </div>
        </Section>
      </div>
    </div>
  );
}
