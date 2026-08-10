/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

// 提示输入区 Block —— 自包含、可整段复制。
// PromptInput 多行输入 + PromptSuggestions 建议 chips（点击填入）+ 字数统计 + 模型角标。
// 点击建议自动填入输入框并聚焦；发送触发 toast 反馈。

import { useRef, useState } from "react";
import {
  Button,
  PromptInput,
  PromptSuggestions,
  Tag,
  Text,
  toast,
} from "../../../lib/fixture-ui";
import { Sparkles, Globe, Paperclip } from "lucide-react";

const SUGGESTIONS = [
  "帮我写一份产品需求文档",
  "用 React + TypeScript 实现一个虚拟列表",
  "解释一下大模型的 RAG 检索增强技术",
  "分析竞品并生成 SWOT 报告",
  "将以下代码重构为 async/await 写法",
  "帮我起草一封商务邮件",
];

const MODELS = [
  { value: "claude-opus", label: "Claude Opus 4" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gemini-pro", label: "Gemini 2.5 Pro" },
  { value: "hulian", label: "瑚琏 1.0" },
];

const MAX_CHARS = 4000;

export function PromptInputBlock() {
  const [value, setValue] = useState("");
  const [deepThink, setDeepThink] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [modelIdx, setModelIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const stopRef = useRef(false);

  const charCount = value.length;
  const overLimit = charCount > MAX_CHARS;
  const model = MODELS[modelIdx];

  const handleSelect = (v: string) => {
    setValue(v);
  };

  const handleSubmit = (text: string) => {
    if (overLimit || !text.trim()) return;
    setLoading(true);
    stopRef.current = false;
    const timer = setTimeout(() => {
      if (!stopRef.current) {
        setLoading(false);
        toast({ title: "已发送（演示）", description: text.slice(0, 40) + (text.length > 40 ? "…" : ""), tone: "info" });
        setValue("");
      }
    }, 1800);
    return () => clearTimeout(timer);
  };

  const handleStop = () => {
    stopRef.current = true;
    setLoading(false);
    toast({ title: "已停止生成", tone: "neutral" });
  };

  const cycleModel = () => {
    setModelIdx((i) => (i + 1) % MODELS.length);
    toast({ title: `已切换到 ${MODELS[(modelIdx + 1) % MODELS.length].label}`, tone: "info" });
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* 建议 chips */}
      <PromptSuggestions
        title="试试这些提示"
        suggestions={SUGGESTIONS}
        onSelect={handleSelect}
        className="justify-center"
      />

      {/* 输入区 */}
      <div className="rounded-xl border border-border bg-bg shadow-sm">
        <PromptInput
          value={value}
          onValueChange={setValue}
          onSubmit={handleSubmit}
          loading={loading}
          onStop={handleStop}
          placeholder="输入你的提示词，或从上方选择建议…"
          maxRows={8}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeepThink((v) => !v)}
                aria-pressed={deepThink}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  deepThink
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                ].join(" ")}
              >
                <Sparkles className="size-3.5" aria-hidden />
                深度思考
              </button>
              <button
                type="button"
                onClick={() => setWebSearch((v) => !v)}
                aria-pressed={webSearch}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  webSearch
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                ].join(" ")}
              >
                <Globe className="size-3.5" aria-hidden />
                联网搜索
              </button>
            </div>
          }
          trailing={
            <Button
              variant="ghost"
              size="iconSm"
              aria-label="添加附件"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="size-4" />
            </Button>
          }
        />

        {/* 底部信息条 */}
        <div className="flex items-center justify-between border-t border-border px-3 py-1.5">
          <button
            type="button"
            onClick={cycleModel}
            className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-surface-hover"
            aria-label="切换模型"
          >
            <Tag size="sm" tone="brand" variant="soft">
              {model.label}
            </Tag>
            <Text as="span" size="xs" tone="muted">
              点击切换
            </Text>
          </button>
          <Text
            as="span"
            size="xs"
            tone={overLimit ? "danger" : "muted"}
            className="tabular-nums"
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </Text>
        </div>
      </div>

      <Text as="p" size="xs" tone="muted" className="text-center">
        AI 回复仅供参考，本区块为纯前端演示，未接入真实模型。
      </Text>
    </div>
  );
}
