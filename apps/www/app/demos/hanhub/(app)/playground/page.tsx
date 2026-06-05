"use client";
import { useMemo, useState } from "react";
import { Code2, RotateCcw } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  ChatMessage,
  Conversation,
  Empty,
  NumberField,
  PromptInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Slider,
  StreamingText,
  Tag,
  Textarea,
  type SelectProps,
} from "@hulian/ui";
import { models, modelOf, providerOf } from "../../_data/providers";
import { apiKeys } from "../../_data/keys";
import { costOfModel, formatUsd, formatPrice } from "../../_lib/pricing";
import type { ChatMessage as GenMessage } from "../../_lib/code-gen";
import { useRun } from "./use-run";
import { CodeDialog } from "./code-dialog";

const BASE_URL = "https://api.hanhub.cn/v1";
const API_KEY = apiKeys[0]?.secret ?? "sk-hanhub-...";

const selectItems: SelectProps["items"] = models.map((m) => ({ value: m.id, label: m.name }));

export default function PlaygroundPage() {
  const [modelId, setModelId] = useState(models[0].id);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState<number | null>(1024);
  const [topP, setTopP] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState("你是瀚枢 HanHub 的 AI 助手，回答简洁、专业、口语化。");
  const [codeOpen, setCodeOpen] = useState(false);

  const model = modelOf(modelId);
  const provider = model ? providerOf(model.provider) : undefined;
  const { turns, streaming, send, stop, reset, promptTokens, completionTokens } = useRun(model, systemPrompt);

  const sessionCost = model ? costOfModel(promptTokens, completionTokens, model) : 0;

  // 当前会话消息（供代码生成）。
  const genMessages: GenMessage[] = useMemo(() => {
    const msgs: GenMessage[] = systemPrompt.trim()
      ? [{ role: "system", content: systemPrompt.trim() }]
      : [];
    for (const t of turns) msgs.push({ role: t.role, content: t.content });
    if (msgs.length === (systemPrompt.trim() ? 1 : 0)) {
      msgs.push({ role: "user", content: "你好，介绍一下你自己。" });
    }
    return msgs;
  }, [systemPrompt, turns]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Playground</h1>
          <p className="text-sm text-muted">在线调试模型与参数 · mock 流式回复 · 一键导出接入代码</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset} disabled={turns.length === 0}>
            <RotateCcw className="size-4" /> 清空
          </Button>
          <Button size="sm" onClick={() => setCodeOpen(true)}>
            <Code2 className="size-4" /> 查看为代码
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr_240px]">
        {/* 左：模型 + 参数 */}
        <Card className="flex flex-col gap-4 self-start p-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">模型</label>
            <Select items={selectItems} value={modelId} onValueChange={(v) => setModelId(v as string)}>
              <SelectTrigger className="w-full" />
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {model && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-muted">
                <Tag tone="neutral" size="sm" variant="soft">
                  {formatPrice(model.inPrice)} / {formatPrice(model.outPrice)} 每 1M
                </Tag>
              </div>
            )}
          </div>

          <ParamSlider label="Temperature" value={temperature} min={0} max={2} step={0.1} onChange={setTemperature} />
          <ParamSlider label="Top P" value={topP} min={0} max={1} step={0.05} onChange={setTopP} />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Max Tokens</label>
            <NumberField value={maxTokens} onValueChange={setMaxTokens} min={1} max={model?.maxOutput ?? 32000} step={256} aria-label="最大输出 tokens" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">系统提示</label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              autoResize
              placeholder="设定模型的角色与行为…"
            />
          </div>
        </Card>

        {/* 中：对话 */}
        <Card className="flex min-h-[520px] flex-col">
          <Conversation className="flex-1 p-4">
            {turns.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <Empty description="发送第一条消息，开始调试对话" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {turns.map((t, i) => {
                  const isStreamingTail = streaming && i === turns.length - 1 && t.role === "assistant";
                  return (
                    <ChatMessage
                      key={t.id}
                      role={t.role}
                      name={t.role === "user" ? "我" : model?.name ?? "助手"}
                      avatar={
                        t.role === "assistant" && provider ? (
                          <Avatar
                            size="sm"
                            fallback={
                              <span
                                className="flex size-full items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: provider.color }}
                              >
                                {provider.glyph}
                              </span>
                            }
                          />
                        ) : undefined
                      }
                      loading={t.role === "assistant" && t.content === "" && streaming}
                    >
                      {t.role === "assistant" ? (
                        <StreamingText text={t.content} streaming={isStreamingTail} />
                      ) : (
                        t.content
                      )}
                    </ChatMessage>
                  );
                })}
              </div>
            )}
          </Conversation>
          <div className="border-t border-border p-3">
            <PromptInput
              onSubmit={send}
              loading={streaming}
              onStop={stop}
              placeholder={`向 ${model?.name ?? "模型"} 发消息…`}
            />
          </div>
        </Card>

        {/* 右：实时计费 */}
        <Card className="self-start">
          <CardHeader className="text-sm font-medium text-foreground">实时计费</CardHeader>
          <CardBody className="flex flex-col gap-3">
            <Metric label="Prompt tokens" value={promptTokens.toLocaleString()} />
            <Metric label="Completion tokens" value={completionTokens.toLocaleString()} />
            <Metric label="总 tokens" value={(promptTokens + completionTokens).toLocaleString()} />
            <div className="border-t border-border pt-3">
              <div className="text-xs text-muted">本次会话成本</div>
              <div className="mt-0.5 text-2xl font-semibold tabular-nums text-primary">
                {formatUsd(sessionCost)}
              </div>
              {model && (
                <div className="mt-1 text-xs text-muted">
                  含网关倍率 ×{model.markup} · 按字符估算 token
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <CodeDialog
        open={codeOpen}
        onOpenChange={setCodeOpen}
        baseUrl={BASE_URL}
        apiKey={API_KEY}
        model={modelId}
        messages={genMessages}
        temperature={temperature}
        maxTokens={maxTokens ?? undefined}
      />
    </div>
  );
}

function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-muted">{label}</label>
        <span className="text-xs tabular-nums text-foreground">{value}</span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
        aria-label={label}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="tabular-nums font-medium text-foreground">{value}</span>
    </div>
  );
}
