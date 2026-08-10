"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { HighlightedCode } from "@hulianui/ui";
import { useIntlayer } from "next-intlayer";

export function DocsCodeBlock({
  code,
  lang,
  className = "",
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  const content = useIntlayer("shared-chrome");
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[var(--radius)] border border-border bg-surface ${className}`}
    >
      {lang && (
        <span className="pointer-events-none absolute left-3 top-2 select-none font-mono text-xs text-muted-foreground">
          {lang}
        </span>
      )}
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? content.copiedCode : content.copyCode}
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-[min(var(--radius),0.375rem)] border border-border bg-surface px-2 py-1 text-xs text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
        {copied ? content.copiedCode : content.copyCode}
      </button>
      <pre
        tabIndex={0}
        aria-label={lang ? `${lang} ${content.codeLabel}` : content.codeLabel}
        className={`overflow-auto p-4 text-sm leading-relaxed ${lang ? "pt-8" : ""}`}
      >
        <code className="font-mono text-foreground">
          <HighlightedCode code={code} lang={lang} />
        </code>
      </pre>
    </div>
  );
}
