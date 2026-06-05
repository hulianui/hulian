"use client";
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
} from "@hulian/ui";

const BASE_URL = "https://api.hanhub.cn/v1";

const SNIPPETS: Record<string, { lang: string; code: string }> = {
  curl: {
    lang: "bash",
    code: `curl ${BASE_URL}/chat/completions \\
  -H "Authorization: Bearer $HANHUB_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-opus-4-7",
    "messages": [{"role": "user", "content": "你好"}]
  }'`,
  },
  python: {
    lang: "python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="${BASE_URL}",
    api_key="$HANHUB_KEY",
)

resp = client.chat.completions.create(
    model="claude-opus-4-7",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)`,
  },
  node: {
    lang: "javascript",
    code: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${BASE_URL}",
  apiKey: process.env.HANHUB_KEY,
});

const resp = await client.chat.completions.create({
  model: "claude-opus-4-7",
  messages: [{ role: "user", content: "你好" }],
});
console.log(resp.choices[0].message.content);`,
  },
};

const MEMBERS = [
  { name: "林屿", email: "lin@hanhub.cn", role: "拥有者", tone: "brand" as const, glyph: "林" },
  { name: "周楠", email: "zhou@hanhub.cn", role: "管理员", tone: "success" as const, glyph: "周" },
  { name: "陈曦", email: "chen@hanhub.cn", role: "开发者", tone: "neutral" as const, glyph: "陈" },
  { name: "赵敏", email: "zhao@hanhub.cn", role: "只读", tone: "neutral" as const, glyph: "赵" },
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
    toast({ title: "已复制 base_url", tone: "info" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">接入设置</h1>
        <p className="text-sm text-muted">快速接入 · 团队成员 · Webhook 告警 · 默认配置</p>
      </div>

      {/* 快速接入 */}
      <Card>
        <CardHeader className="font-medium text-foreground">快速接入</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Base URL</span>
            <code className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1 text-sm text-foreground">
              {BASE_URL}
            </code>
            <Button variant="outline" size="sm" onClick={copyBaseUrl}>
              <Copy className="size-4" />
              复制
            </Button>
            <span className="text-xs text-muted">OpenAI 兼容协议 · 改 base_url + key 即可接入</span>
          </div>

          <Segmented
            value={lang}
            onValueChange={setLang}
            items={[
              { value: "curl", label: "cURL" },
              { value: "python", label: "Python" },
              { value: "node", label: "Node.js" },
            ]}
            aria-label="代码语言"
          />
          <CodeBlock code={SNIPPETS[lang].code} lang={SNIPPETS[lang].lang} />
        </CardBody>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* 团队成员 */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="font-medium text-foreground">团队成员</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast({ title: "邀请链接已复制", tone: "info" })}
            >
              邀请成员
            </Button>
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
            <Webhook className="size-4 text-muted" />
            Webhook 告警
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Field label="回调 URL" description="用量超阈值 / 余额不足时 POST 到该地址">
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://example.com/webhook"
              />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="neutral" size="sm">用量告警</Tag>
              <Tag tone="neutral" size="sm">余额告警</Tag>
              <Tag tone="neutral" size="sm">渠道熔断</Tag>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => toast({ title: "测试事件已发送", description: webhookUrl, tone: "info" })}
            >
              <Send className="size-4" />
              测试发送
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* 默认配置 */}
      <Card>
        <CardHeader className="font-medium text-foreground">默认配置</CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="默认限速（req/min）" description="新建密钥的初始限速">
              <NumberField
                value={defaultRpm}
                onValueChange={setDefaultRpm}
                min={1}
                max={10000}
                step={100}
                aria-label="默认限速"
              />
            </Field>
            <Field label="默认倍率分组" description="决定网关在上游价基础上的加价">
              <Select
                value={markupGroup}
                onValueChange={(v) => setMarkupGroup(v as string)}
                items={[
                  { value: "economy", label: "经济（1.0×）" },
                  { value: "standard", label: "标准（1.05×）" },
                  { value: "premium", label: "高优（1.1×）" },
                ]}
              >
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="economy">经济（1.0×）</SelectItem>
                  <SelectItem value="standard">标准（1.05×）</SelectItem>
                  <SelectItem value="premium">高优（1.1×）</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Divider />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-foreground">失败自动重试</div>
                <div className="text-xs text-muted">上游 5xx / 超时时切换渠道重试</div>
              </div>
              <Switch checked={retry} onCheckedChange={setRetry} aria-label="失败自动重试" />
            </div>
            {retry && (
              <Field label="重试次数" className="w-40">
                <NumberField
                  value={retryCount}
                  onValueChange={setRetryCount}
                  min={1}
                  max={5}
                  aria-label="重试次数"
                />
              </Field>
            )}
          </div>

          <Button
            className="self-start"
            onClick={() => toast({ title: "默认配置已保存", tone: "info" })}
          >
            保存设置
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
