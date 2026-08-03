"use client";
import { useCallback, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@hulianui/ui";
import { useIntlayer } from "next-intlayer";

// 「复制 MD」按钮 —— 把一段 markdown 文档一键拷进剪贴板，喂给 AI 编程助手。
// 组件文档页头 + 入门页共用。dogfood @hulianui/ui Button，复制后短暂切「已复制」。
export function CopyMarkdownButton({
  text,
  label,
  copiedLabel,
  variant = "outline",
  size = "sm",
  className,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
  className?: string;
}) {
  const content = useIntlayer("shared-chrome");
  const resolvedLabel = label ?? content.copyMarkdown;
  const resolvedCopiedLabel = copiedLabel ?? content.copied;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 降级：clipboard 不可用（非安全上下文等）时用临时 textarea
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }, [text]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={copy}
      aria-label={copied ? resolvedCopiedLabel : content.copyAria.replace("{label}", resolvedLabel)}
      className={className}
    >
      {copied ? (
        <Check className="size-4 text-success" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
      {copied ? resolvedCopiedLabel : resolvedLabel}
    </Button>
  );
}
