"use client";
import { useMemo, useState } from "react";
import {
  CodeBlock,
  Dialog,
  DialogContent,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@hulian/ui";
import { genCode, type ChatMessage, type CodeLang } from "../../_lib/code-gen";

const LANGS: { value: CodeLang; label: string; lang: string }[] = [
  { value: "curl", label: "cURL", lang: "bash" },
  { value: "python", label: "Python", lang: "python" },
  { value: "node", label: "Node.js", lang: "javascript" },
];

export function CodeDialog({
  open,
  onOpenChange,
  baseUrl,
  apiKey,
  model,
  messages,
  temperature,
  maxTokens,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}) {
  const [lang, setLang] = useState<CodeLang>("curl");

  const input = useMemo(
    () => ({ baseUrl, apiKey, model, messages, temperature, maxTokens }),
    [baseUrl, apiKey, model, messages, temperature, maxTokens],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="查看为代码"
        description="把当前模型、参数与会话消息一键转为可运行的接入片段"
        className="w-[min(720px,94vw)]"
      >
        <Tabs value={lang} onValueChange={(v) => setLang(v as CodeLang)}>
          <TabsList>
            {LANGS.map((l) => (
              <TabsTab key={l.value} value={l.value}>
                {l.label}
              </TabsTab>
            ))}
          </TabsList>
          {LANGS.map((l) => (
            <TabsPanel key={l.value} value={l.value} className="mt-3">
              <CodeBlock code={genCode(l.value, input)} lang={l.lang} />
            </TabsPanel>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
