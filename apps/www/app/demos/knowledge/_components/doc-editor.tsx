"use client";
import { useEffect, useRef, useState } from "react";
import { Check, CloudUpload, FileText } from "lucide-react";
import { MarkdownEditor, Tag } from "@hulianui/ui";
import { useKnowledge } from "./knowledge-shell";

type SaveState = "idle" | "saving" | "saved";

// 去 markdown 标记后的字数（粗略：剥离常见符号）。
function wordCount(md: string): number {
  return md.replace(/[#>*`_\-[\]()!]/g, "").replace(/\s+/g, "").length;
}

export function DocEditor({ nodeId }: { nodeId: string }) {
  const { v } = useKnowledge();
  const node = v.get(nodeId);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [count, setCount] = useState(() => wordCount(node?.content ?? ""));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 切换文档时重置保存态与字数。
  useEffect(() => {
    setSaveState("idle");
    setCount(wordCount(v.get(nodeId)?.content ?? ""));
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [nodeId, v]);

  if (!node) return null;

  const onChange = (md: string) => {
    setCount(wordCount(md));
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    // 防抖自动保存：停止输入 700ms 后落库 → 已保存。
    timer.current = setTimeout(() => {
      v.updateContent(nodeId, md);
      setSaveState("saved");
      timer.current = setTimeout(() => setSaveState("idle"), 2000);
    }, 700);
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-6 py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-5 shrink-0 text-muted" />
          <h1 className="truncate text-lg font-semibold tracking-tight">{node.name.replace(/\.md$/, "")}</h1>
          {node.status && <Tag size="sm" tone={node.status === "added" ? "success" : "warning"}>{node.status === "added" ? "新增" : "已改动"}</Tag>}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
          <span className="tabular-nums">{count} 字</span>
          <span aria-live="polite" className="flex items-center gap-1">
            {saveState === "saving" && (
              <>
                <CloudUpload className="size-3.5 animate-pulse" /> 保存中…
              </>
            )}
            {saveState === "saved" && (
              <>
                <Check className="size-3.5 text-success" /> 已保存
              </>
            )}
            {saveState === "idle" && <span>最后编辑 · {node.author}</span>}
          </span>
        </div>
      </div>

      <MarkdownEditor
        key={nodeId}
        value={node.content ?? ""}
        onChange={onChange}
        minRows={16}
        placeholder="开始编写文档内容……支持标题、列表、代码块、引用。"
        className="flex-1"
        aria-label={`编辑文档 ${node.name}`}
      />
    </div>
  );
}
