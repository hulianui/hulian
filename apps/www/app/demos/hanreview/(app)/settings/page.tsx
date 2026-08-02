"use client";
import { copy } from "./page.content";

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
import { MEMBERS, MEMBER_ROLE_LABEL } from "../../_data/members";

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
      <Section title={copy("connectedToTheWarehouse")} desc={copy("configureWebhooksPrCommitEventsTriggerAutomatic")}>
        <SecretField
          value="whsec_8f3c1a9b7e2d4f6a0c5b8e1d3a7f9c2e"
          maskStrategy="prefix-suffix"
          onCopy={() => toast({ title: copy("theWebhookKeyHasBeenCopied"), tone: "info" })}
          actions={
            <Button variant="ghost" size="sm" onClick={() => toast({ title: copy("theWebhookKeyHasBeenReset"), tone: "danger" })}>{copy("reset")}</Button>
          }
        />
        <List
          items={REPOS}
          renderItem={(r) => (
            <ListItem key={r.id} actions={[<StatusDot key="s" status="online" label={copy("connected")} />]}>
              <ListItem.Meta
                avatar={<GitBranch className="size-4 text-muted" />}
                title={r.name}
                description={copy("defaultBranchValue", r.defaultBranch)}
              />
            </ListItem>
          )}
        />
        <Button variant="outline" size="sm" className="self-start" onClick={() => toast({ title: copy("openTheAccessWizard"), tone: "info" })}>
          <Plus className="size-4" />{copy("connectingToTheNewWarehouse")}</Button>
      </Section>

      <Section title={copy("teamMembers")} desc={copy("whoCanViewAndHandleTheReview")}>
        <List
          items={MEMBERS}
          renderItem={(m) => (
            <ListItem key={m.email} actions={[<Tag key="r" tone={ROLE_TONE[m.role]} size="sm">{MEMBER_ROLE_LABEL[m.role]}</Tag>]}>
              <User name={m.name} description={m.email} avatarProps={{ fallback: m.name.slice(0, 1) }} />
            </ListItem>
          )}
        />
      </Section>

      <Section title={copy("notification")} desc={copy("howTheReviewResultsRemindedTheTeam")}>
        <NotifyRow label={copy("theGateWasBlockedAndBlocked")} desc={copy("prNotifiesTheAuthorWhenTheQuality")} defaultOn />
        <NotifyRow label={copy("aSeriousProblem")} desc={copy("criticalIssuesAreDetectedImmediately")} defaultOn />
        <NotifyRow label={copy("dailyQualitySummary")} desc={copy("summarizeChangesInQualityScoresFromEach")} />
        <div>
          <div className="mb-2 text-xs text-muted">{copy("notificationChannels")}</div>
          <ChoiceboxGroup multiple defaultValue={[copy("sendingAFlyingLetter")]} columns={3} aria-label={copy("notificationChannels2")}>
            <Choicebox value={copy("sendingAFlyingLetter2")} title={copy("sendingAFlyingLetter3")} description={copy("swarmOfRobots")} />
            <Choicebox value={copy("email")} title={copy("email2")} description={copy("pushNotificationsAccordingToThePerson")} />
            <Choicebox value="Webhook" title="Webhook" description={copy("customCallbacks")} />
          </ChoiceboxGroup>
        </div>
      </Section>

      <Section title={copy("aiBudget")} desc={copy("controlTheSpendingOfMonthlyModelCalls")}>
        <div className="flex items-end gap-4">
          <div>
            <div className="mb-1 text-xs text-muted">{copy("monthlyBudget")}</div>
            <NumberField value={budget} onValueChange={setBudget} min={0} step={100} aria-label={copy("monthlyBudget2")} />
          </div>
          <div className="flex-1">
            <Meter value={1284} max={budget ?? 2000} label={copy("thisMonthISpent")} showValue />
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs text-muted">{copy("excessStrategy")}</div>
          <ChoiceboxGroup defaultValue="downgrade" columns={2} aria-label={copy("excessStrategy2")}>
            <Choicebox value="downgrade" title={copy("downgradedToAnEconomicModel")} description={copy("afterOverBudgetingSwitchToHaikuDeepseek")} />
            <Choicebox value="pause" title={copy("suspensionOfReview")} description={copy("afterExceedingTheBudgetTheQueueIs")} />
          </ChoiceboxGroup>
        </div>
      </Section>
    </div>
  );
}
