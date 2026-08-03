"use client";
import { copy } from "./page.content";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Heading,
  Input,
  Segmented,
  Slider,
  Switch,
  Text,
  Textarea,
  toast,
} from "@hulianui/ui";

export default function SettingsPage() {
  const [nickname, setNickname] = useState(copy("xiaoLian"));
  const [signature, setSignature] = useState(copy("iMHappyToServeYouIf"));
  const [autoAccept, setAutoAccept] = useState(true);
  const [maxConcurrent, setMaxConcurrent] = useState(5);
  const [autoTransfer, setAutoTransfer] = useState(true);
  const [autoReply, setAutoReply] = useState(true);
  const [welcome, setWelcome] = useState(copy("helloIAmYourDedicatedCustomerService"));
  const [worktime, setWorktime] = useState("work");

  const save = () => {
    toast({ title: copy("settingsSaved"), description: copy("customerServicePreferencesHaveBeenUpdatedDemo"), tone: "success" });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Heading level={1} size="xl">{copy("customerServiceSettings")}</Heading>
          <Text tone="muted" className="mt-1">{copy("configureAgentReceptionPreferencesAndAutomationRules")}</Text>
        </div>
        <Button onClick={save}>{copy("saveSettings")}</Button>
      </div>

      {/* 坐席资料 */}
      <Card>
        <CardHeader>{copy("agentInformation")}</CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={copy("agentNickname")}>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={copy("nameDisplayedToCustomers")} />
          </Field>
          <Field label={copy("personalizedSignature")} description={copy("dialogWindowSubtitleDisplay")} className="sm:col-span-1">
            <Input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder={copy("oneSentenceSignature")} />
          </Field>
        </CardBody>
      </Card>

      {/* 接待设置 */}
      <Card>
        <CardHeader>{copy("receptionSettings")}</CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{copy("automaticallyConnectToNewSessions")}</div>
              <Text size="sm" tone="muted">{copy("newSessionsAreAutomaticallyAssignedToMe")}</Text>
            </div>
            <Switch checked={autoAccept} onCheckedChange={setAutoAccept} aria-label={copy("automaticallyConnectToNewSessions2")} />
          </div>

          <Field label={copy("maximumSimultaneousReceptionValueSessions", maxConcurrent)} description={copy("sessionsExceedingTheUpperLimitAreQueued")}>
            <Slider
              value={maxConcurrent}
              onValueChange={(v) => setMaxConcurrent(Array.isArray(v) ? v[0] : (v as number))}
              min={1}
              max={10}
              step={1}
              showValue
            />
          </Field>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{copy("automaticallyTransferAfterLeaving")}</div>
              <Text size="sm" tone="muted">{copy("transferTheOngoingConversationToAnotherPerson")}</Text>
            </div>
            <Switch checked={autoTransfer} onCheckedChange={setAutoTransfer} aria-label={copy("automaticallyTransferAfterLeaving2")} />
          </div>
        </CardBody>
      </Card>

      {/* 自动回复 */}
      <Card>
        <CardHeader>{copy("automaticReply")}</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{copy("enableWelcomeMessage")}</div>
              <Text size="sm" tone="muted">{copy("automaticallySendAWelcomeMessageWhenThe")}</Text>
            </div>
            <Switch checked={autoReply} onCheckedChange={setAutoReply} aria-label={copy("enableWelcomeMessage2")} />
          </div>
          <Field label={copy("welcomeMessageContent")}>
            <Textarea
              value={welcome}
              onChange={(e) => setWelcome(e.target.value)}
              rows={3}
              disabled={!autoReply}
              placeholder={copy("automaticallySentWhenTheCustomerAccesses")}
            />
          </Field>
        </CardBody>
      </Card>

      {/* 工作时段 */}
      <Card>
        <CardHeader>{copy("workingHours")}</CardHeader>
        <CardBody>
          <Field label={copy("receptionHours")} description={copy("intelligentAssistantsWillBeOnDutyDuring")}>
            <Segmented
              value={worktime}
              onValueChange={setWorktime}
              items={[
                { value: "all", label: copy("localizedText") },
                { value: "work", label: copy("workingHours2") },
                { value: "custom", label: copy("customize") },
              ]}
            />
          </Field>
        </CardBody>
      </Card>
    </div>
  );
}
