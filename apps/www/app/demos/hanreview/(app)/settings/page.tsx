"use client";
import { useState } from "react";
import { GitBranch, Plus } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Choicebox,
  ChoiceboxGroup,
  List,
  ListItem,
  Meter,
  NumberField,
  SecretField,
  StatusDot,
  Switch,
  Tag,
  User,
  toast,
} from "@hulianui/ui";
import { REPOS } from "../../_data/repos";
import { MEMBERS } from "../../_data/members";

const ROLE_TONE = { 管理员: "brand", 审查者: "success", 只读: "neutral" } as const;

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {desc && <div className="mt-0.5 text-xs text-muted">{desc}</div>}
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">{children}</CardBody>
    </Card>
  );
}

function NotifyRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn ?? false);
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm text-foreground">{label}</div>
        <div className="text-xs text-muted">{desc}</div>
      </div>
      <Switch checked={on} onCheckedChange={setOn} aria-label={label} />
    </div>
  );
}

export default function SettingsPage() {
  const [budget, setBudget] = useState<number | null>(2000);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-1">
      <Section title="接入仓库" desc="配置 Webhook，PR/提交事件触发自动审查">
        <SecretField
          value="whsec_8f3c1a9b7e2d4f6a0c5b8e1d3a7f9c2e"
          maskStrategy="prefix-suffix"
          onCopy={() => toast({ title: "Webhook 密钥已复制", tone: "info" })}
          actions={
            <Button variant="ghost" size="sm" onClick={() => toast({ title: "已重置 Webhook 密钥", tone: "danger" })}>
              重置
            </Button>
          }
        />
        <List
          items={REPOS}
          renderItem={(r) => (
            <ListItem key={r.id} actions={[<StatusDot key="s" status="online" label="已接入" />]}>
              <ListItem.Meta
                avatar={<GitBranch className="size-4 text-muted" />}
                title={r.name}
                description={`默认分支 ${r.defaultBranch}`}
              />
            </ListItem>
          )}
        />
        <Button variant="outline" size="sm" className="self-start" onClick={() => toast({ title: "打开接入向导", tone: "info" })}>
          <Plus className="size-4" /> 接入新仓库
        </Button>
      </Section>

      <Section title="团队成员" desc="谁可以查看与处理审查">
        <List
          items={MEMBERS}
          renderItem={(m) => (
            <ListItem key={m.email} actions={[<Tag key="r" tone={ROLE_TONE[m.role]} size="sm">{m.role}</Tag>]}>
              <User name={m.name} description={m.email} avatarProps={{ fallback: m.name.slice(0, 1) }} />
            </ListItem>
          )}
        />
      </Section>

      <Section title="通知" desc="审查结果如何提醒团队">
        <NotifyRow label="门禁阻断" desc="PR 被质量门禁阻断时通知作者" defaultOn />
        <NotifyRow label="严重问题" desc="发现 critical 级问题立即通知" defaultOn />
        <NotifyRow label="每日质量摘要" desc="每天汇总各仓库质量分变化" />
        <div>
          <div className="mb-2 text-xs text-muted">通知渠道</div>
          <ChoiceboxGroup multiple defaultValue={["飞书"]} columns={3} aria-label="通知渠道">
            <Choicebox value="飞书" title="飞书" description="群机器人" />
            <Choicebox value="邮件" title="邮件" description="按人推送" />
            <Choicebox value="Webhook" title="Webhook" description="自定义回调" />
          </ChoiceboxGroup>
        </div>
      </Section>

      <Section title="AI 预算" desc="控制每月审查的模型调用花费">
        <div className="flex items-end gap-4">
          <div>
            <div className="mb-1 text-xs text-muted">月度预算（¥）</div>
            <NumberField value={budget} onValueChange={setBudget} min={0} step={100} aria-label="月度预算" />
          </div>
          <div className="flex-1">
            <Meter value={1284} max={budget ?? 2000} label="本月已消耗 ¥1,284" showValue />
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs text-muted">超额策略</div>
          <ChoiceboxGroup defaultValue="downgrade" columns={2} aria-label="超额策略">
            <Choicebox value="downgrade" title="降级到经济模型" description="超预算后改用 Haiku/DeepSeek 继续审查" />
            <Choicebox value="pause" title="暂停审查" description="超预算后队列挂起，等待下月或追加预算" />
          </ChoiceboxGroup>
        </div>
      </Section>
    </div>
  );
}
