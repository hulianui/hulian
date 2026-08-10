"use client";
import { useRef, useState } from "react";
import { Button, PromptInput, PromptSuggestions, Tag, Text, toast, } from "@hulianui/ui";
import { Sparkles, Globe, Paperclip } from "lucide-react";
const SUGGESTIONS = [
    "Help me write a product requirements document",
    "Implement a virtual list with React + TypeScript",
    "Explain retrieval-augmented generation (RAG) for large language models",
    "Analyze competitors and create a SWOT report",
    "Refactor this code to use async/await",
    "Help me draft a business email",
];
const MODELS = [
    { value: "claude-opus", label: "Claude Opus 4" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gemini-pro", label: "Gemini 2.5 Pro" },
    { value: "hulian", label: "Hulian 1.0" },
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
        if (overLimit || !text.trim())
            return;
        setLoading(true);
        stopRef.current = false;
        const timer = setTimeout(() => {
            if (!stopRef.current) {
                setLoading(false);
                toast({ title: "Sent (demo)", description: text.slice(0, 40) + (text.length > 40 ? "..." : ""), tone: "info" });
                setValue("");
            }
        }, 1800);
        return () => clearTimeout(timer);
    };
    const handleStop = () => {
        stopRef.current = true;
        setLoading(false);
        toast({ title: "Generation stopped", tone: "neutral" });
    };
    const cycleModel = () => {
        setModelIdx((i) => (i + 1) % MODELS.length);
        toast({ title: `Switched to ${MODELS[(modelIdx + 1) % MODELS.length].label}`, tone: "info" });
    };
    return (<div className="mx-auto w-full max-w-2xl space-y-4">

      <PromptSuggestions title="Try one of these prompts" suggestions={SUGGESTIONS} onSelect={handleSelect} className="justify-center"/>


      <div className="rounded-xl border border-border bg-bg shadow-sm">
        <PromptInput value={value} onValueChange={setValue} onSubmit={handleSubmit} loading={loading} onStop={handleStop} placeholder="Enter a prompt or choose a suggestion above..." maxRows={8} actions={<div className="flex items-center gap-2">
              <button type="button" onClick={() => setDeepThink((v) => !v)} aria-pressed={deepThink} className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                deepThink
                    ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
            ].join(" ")}>
                <Sparkles className="size-3.5" aria-hidden/>
                Deep reasoning
              </button>
              <button type="button" onClick={() => setWebSearch((v) => !v)} aria-pressed={webSearch} className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                webSearch
                    ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
            ].join(" ")}>
                <Globe className="size-3.5" aria-hidden/>
                Internet search
              </button>
            </div>} trailing={<Button variant="ghost" size="iconSm" aria-label="Add attachment" className="shrink-0 text-muted-foreground hover:text-foreground">
              <Paperclip className="size-4"/>
            </Button>}/>


        <div className="flex items-center justify-between border-t border-border px-3 py-1.5">
          <button type="button" onClick={cycleModel} className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-surface-hover" aria-label="Switch model">
            <Tag size="sm" tone="brand" variant="soft">
              {model.label}
            </Tag>
            <Text as="span" size="xs" tone="muted">
              Click to switch
            </Text>
          </button>
          <Text as="span" size="xs" tone={overLimit ? "danger" : "muted"} className="tabular-nums">
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </Text>
        </div>
      </div>

      <Text as="p" size="xs" tone="muted" className="text-center">
        AI responses are illustrative. This front-end demo is not connected to a live model.
      </Text>
    </div>);
}
