"use client";
import { copy } from "./page.content";

import { useState } from "react";
import { Copy, Send, Webhook } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  CodeBlock,
  Divider,
  Field,
  Input,
  List,
  ListItem,
  NumberField,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Switch,
  Tag,
  toast,
} from "@hulianui/ui";

const BASE_URL = "https://api.hanhub.cn/v1";

const SNIPPETS: Record<string, { lang: string; code: string }> = {
  curl: {
    lang: "bash",
    code: copy("curlValueChatCompletionsHAuthorizationBearer", BASE_URL),
  },
  python: {
    lang: "python",
    code: copy("fromOpenaiImportOpenaiClientOpenaiBase", BASE_URL),
  },
  node: {
    lang: "javascript",
    code: copy("importOpenaiFromOpenaiConstClientNew", BASE_URL),
  },
};

const MEMBERS = [
  { name: copy("linyu"), email: "lin@hanhub.cn", role: copy("owner"), tone: "brand" as const, glyph: copy("forest") },
  { name: copy("zhouNan"), email: "zhou@hanhub.cn", role: copy("administrator"), tone: "success" as const, glyph: copy("week") },
  { name: copy("chenXi"), email: "chen@hanhub.cn", role: copy("developer"), tone: "neutral" as const, glyph: copy("chen") },
  { name: copy("zhaoMin"), email: "zhao@hanhub.cn", role: copy("readOnly"), tone: "neutral" as const, glyph: copy("zhao") },
];

export default function SettingsPage() {
  const [lang, setLang] = useState("curl");
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.hanhub.cn/usage-alert");
  const [defaultRpm, setDefaultRpm] = useState<number | null>(1000);
  const [markupGroup, setMarkupGroup] = useState("standard");
  const [retry, setRetry] = useState(true);
  const [retryCount, setRetryCount] = useState<number | null>(2);

  async function copyBaseUrl() {
    try {
      await navigator.clipboard.writeText(BASE_URL);
    } catch {
      /* 静默：演示环境复制不可用时仍给出反馈 */
    }
    toast({ title: copy("baseUrlCopied"), tone: "info" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{copy("accessSettings")}</h1>
        <p className="text-sm text-muted-foreground">{copy("quickAccessTeamMembersWebhookAlertsDefault")}</p>
      </div>

      {/* 快速接入 */}
      <Card>
        <CardHeader className="font-medium text-foreground">{copy("quickAccess")}</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Base URL</span>
            <code className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1 text-sm text-foreground">
              {BASE_URL}
            </code>
            <Button variant="outline" size="sm" onClick={copyBaseUrl}>
              <Copy className="size-4" />{copy("copy")}</Button>
            <span className="text-xs text-muted-foreground">{copy("openaiCompatibleProtocolChangeBaseUrlKey")}</span>
          </div>

          <Segmented
            value={lang}
            onValueChange={setLang}
            items={[
              { value: "curl", label: "cURL" },
              { value: "python", label: "Python" },
              { value: "node", label: "Node.js" },
            ]}
            aria-label={copy("codeLanguage")}
          />
          <CodeBlock code={SNIPPETS[lang].code} lang={SNIPPETS[lang].lang} />
        </CardBody>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* 团队成员 */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="font-medium text-foreground">{copy("teamMember")}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast({ title: copy("invitationLinkCopied"), tone: "info" })}
            >{copy("inviteMembers")}</Button>
          </CardHeader>
          <CardBody className="p-0">
            <List
              inset
              items={MEMBERS}
              renderItem={(m) => (
                <ListItem actions={[<Tag key="role" tone={m.tone} size="sm">{m.role}</Tag>]}>
                  <ListItem.Meta
                    avatar={<Avatar fallback={m.glyph} />}
                    title={m.name}
                    description={m.email}
                  />
                </ListItem>
              )}
            />
          </CardBody>
        </Card>

        {/* Webhook */}
        <Card>
          <CardHeader className="flex items-center gap-2 font-medium text-foreground">
            <Webhook className="size-4 text-muted-foreground" />{copy("webhookAlert")}</CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Field label={copy("callbackUrl")} description={copy("postToThisAddressWhenTheUsage")}>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://example.com/webhook"
              />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="neutral" size="sm">{copy("usageAlarm")}</Tag>
              <Tag tone="neutral" size="sm">{copy("balanceAlarm")}</Tag>
              <Tag tone="neutral" size="sm">{copy("channelCircuitBreaker")}</Tag>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => toast({ title: copy("testEventSent"), description: webhookUrl, tone: "info" })}
            >
              <Send className="size-4" />{copy("testSending")}</Button>
          </CardBody>
        </Card>
      </div>

      {/* 默认配置 */}
      <Card>
        <CardHeader className="font-medium text-foreground">{copy("defaultConfiguration")}</CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={copy("defaultSpeedLimitReqMin")} description={copy("initialRateLimitForNewKeys")}>
              <NumberField
                value={defaultRpm}
                onValueChange={setDefaultRpm}
                min={1}
                max={10000}
                step={100}
                aria-label={copy("defaultSpeedLimit")}
              />
            </Field>
            <Field label={copy("defaultMagnificationGrouping")} description={copy("determineTheGatewaySPriceIncreaseBased")}>
              <Select
                value={markupGroup}
                onValueChange={(v) => setMarkupGroup(v as string)}
                items={[
                  { value: "economy", label: copy("economy") },
                  { value: "standard", label: copy("standard") },
                  { value: "premium", label: copy("highQuality") },
                ]}
              >
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="economy">{copy("economy2")}</SelectItem>
                  <SelectItem value="standard">{copy("standard2")}</SelectItem>
                  <SelectItem value="premium">{copy("highQuality2")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Divider />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-foreground">{copy("automaticallyRetryOnFailure")}</div>
                <div className="text-xs text-muted-foreground">{copy("upstreamXxSwitchChannelAndTryAgain")}</div>
              </div>
              <Switch checked={retry} onCheckedChange={setRetry} aria-label={copy("automaticallyRetryOnFailure2")} />
            </div>
            {retry && (
              <Field label={copy("numberOfRetries")} className="w-40">
                <NumberField
                  value={retryCount}
                  onValueChange={setRetryCount}
                  min={1}
                  max={5}
                  aria-label={copy("numberOfRetries2")}
                />
              </Field>
            )}
          </div>

          <Button
            className="self-start"
            onClick={() => toast({ title: copy("defaultConfigurationSaved"), tone: "success" })}
          >{copy("saveSettings")}</Button>
        </CardBody>
      </Card>
    </div>
  );
}
