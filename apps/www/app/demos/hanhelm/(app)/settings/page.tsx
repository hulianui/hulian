"use client";
import { copy } from "./page.content";

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
} from "@hulianui/ui";
import type { ChannelStatus } from "@hulianui/ui";
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
  { id: "s-api", name: copy("openapiTaskSubmission"), desc: copy("postV1TasksDirectConnectionToInternal"), status: "online", statusLabel: copy("online") },
  { id: "s-wecom", name: copy("wecomApprovalFlow"), desc: copy("approvalIsGrantedAndTheTaskIs"), status: "online", statusLabel: copy("online2") },
  { id: "s-cron", name: copy("scheduledBatchScheduling"), desc: copy("batchOnboardingForOfflineTasksAtDaily"), status: "degraded", statusLabel: copy("downgrade") },
  { id: "s-mq", name: copy("kafkaEventBus"), desc: copy("topicAiTasksDelayedConsumptionAlert"), status: "offline", statusLabel: copy("offline") },
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
      title: copy("settingsSaved"),
      description: copy("globalSchedulingStrategyAndNotificationConfigurationHave"),
      tone: "success",
    });
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      <PageHeader
        title={copy("setup")}
        subTitle={copy("taskAccessTeamMembersGlobalSchedulingStrategy")}
        extra={
          <Button variant="solid" onClick={handleSave}>{copy("saveTheSettings")}</Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* —— 接入 —— */}
        <Section
          icon={<Webhook className="size-5" />}
          title={copy("taskSourceAccessIsProvided")}
          description={copy("connectsTheExternalSystemSWebhookCredentials")}
        >
          <Field
            label={
              <span className="inline-flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-muted" />{copy("accessKeyToken")}</span>
            }
            description={copy("carryThisKeyWhenExternalSystemsCall")}
          >
            <SecretField
              value={MOCK_TOKEN}
              onCopy={() => toast({ title: copy("theAccessKeyHasBeenCopied"), tone: "neutral" })}
              actions={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast({ title: copy("theKeyHasBeenRegenerated"), description: copy("theOldKeyImmediatelyBecameInvalid"), tone: "danger" })}
                >
                  <RefreshCw className="size-3.5" />{copy("reset")}</Button>
              }
            />
          </Field>

          <div className="mt-4">
            <Text size="sm" tone="muted" className="mb-1.5 block">{copy("sourceReceived")}</Text>
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
          title={copy("teamMembers")}
          description={copy("schedulingPlatformCollaborationMembersAndRolePermissions")}
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
                    label={m.online ? copy("online3") : copy("offline2")}
                  />,
                ]}
              >
                <ListItemMeta
                  avatar={<Avatar fallback={m.avatar} />}
                  title={<span className="text-sm font-medium">{m.name}</span>}
                  description={<span className="text-xs text-muted">{copy("memberId")}{m.id}</span>}
                />
              </ListItem>
            )}
          />
        </Section>

        {/* —— 全局策略 —— */}
        <Section
          icon={<ArrowDownWideNarrow className="size-5" />}
          title={copy("globalSchedulingStrategy")}
          description={copy("taskDefaultValuesAndDegradationBehaviorUpon")}
        >
          <div className="flex flex-col gap-4">
            <Field label={copy("defaultPriority")} description={copy("tasksWithoutExplicitPriorityAreGivenThis")}>
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

            <Field label={copy("globalCostCapYuanTask")} description={copy("ifTheCumulativeCostOfASingle")}>
              <NumberField
                value={costCap}
                onValueChange={setCostCap}
                min={0}
                step={0.5}
                aria-label={copy("globalCostCap")}
              />
            </Field>

            <Field label={copy("defaultDowngradeStrategy")} description={copy("catchAllActionWhenActuatorFailsIs")}>
              <ChoiceboxGroup
                value={degradePolicy}
                onValueChange={(v) => setDegradePolicy(v as string)}
                columns={1}
                aria-label={copy("defaultDowngradeStrategy2")}
              >
                <Choicebox
                  value="cheaper"
                  icon={<ArrowDownWideNarrow className="size-5" />}
                  title={copy("downgradedToACheaperModel")}
                  description={copy("switchToLowCostActuatorsByDowngrade")}
                />
                <Choicebox
                  value="retry"
                  icon={<RefreshCw className="size-5" />}
                  title={copy("retryTheOriginalActuator")}
                  description={copy("indexRetreatRetriesTheCurrentActuatorUp")}
                />
                <Choicebox
                  value="pause"
                  icon={<PauseCircle className="size-5" />}
                  title={copy("pauseAndAlert")}
                  description={copy("tasksAreSuspendedAndNotifiedOnDuty")}
                />
              </ChoiceboxGroup>
            </Field>
          </div>
        </Section>

        {/* —— 通知 —— */}
        <Section
          icon={<Bell className="size-5" />}
          title={copy("alertNotification")}
          description={copy("alertReachChannelsAndTimingOfNotifications")}
        >
          <div className="flex flex-col gap-4">
            <Field label={copy("alertChannels")} description={copy("reachChannelsForSlaBreachesFailureRates")}>
              <ChoiceboxGroup
                multiple
                value={alertChannels}
                onValueChange={(v) => setAlertChannels(v as string[])}
                columns={2}
                aria-label={copy("alertChannels2")}
              >
                <Choicebox value="wecom" title={copy("wechatWork")} description={copy("dutyGroupRobotPushes")} />
                <Choicebox value="sms" title={copy("sms")} description={copy("p0CriticalIsASafetyNet")} />
                <Choicebox value="email" title={copy("email")} description={copy("dailyWeeklyReportSummary")} />
                <Choicebox value="webhook" title="Webhook" description={copy("integrationWithPagerdutyFeishu")} />
              </ChoiceboxGroup>
            </Field>

            <Field label={copy("notifyTheTiming")}>
              <List size="sm" bordered split>
                <ListItem actions={[<Switch key="t" checked={notifyFiring} onCheckedChange={setNotifyFiring} aria-label={copy("notificationIsSentImmediatelyWhenAnAlarm")} />]}>
                  <ListItemMeta
                    title={<span className="text-[13px] font-medium">{copy("notificationIsSentImmediatelyWhenAnAlarm2")}</span>}
                    description={<span className="text-[11px] text-muted">{copy("realTimePushNotificationsAtTheInstant")}</span>}
                  />
                </ListItem>
                <ListItem actions={[<Switch key="r" checked={notifyResolved} onCheckedChange={setNotifyResolved} aria-label={copy("alertAndRestorationNotification")} />]}>
                  <ListItemMeta
                    title={<span className="text-[13px] font-medium">{copy("alertAndRestorationNotification2")}</span>}
                    description={<span className="text-[11px] text-muted">{copy("whenTheIndicatorFallsBackToThe")}</span>}
                  />
                </ListItem>
                <ListItem actions={[<Switch key="d" checked={notifyDigest} onCheckedChange={setNotifyDigest} aria-label={copy("dailySummarySummary")} />]}>
                  <ListItemMeta
                    title={<span className="text-[13px] font-medium">{copy("dailySummarySummary2")}</span>}
                    description={<span className="text-[11px] text-muted">{copy("dailySummaryOfYesterdaySSlaCosts")}</span>}
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
