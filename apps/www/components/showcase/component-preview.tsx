"use client";
import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTab, TabsPanel, CodeBlock } from "@hulianui/ui";
import { DOCS_LOCALE } from "../../lib/docs-locale";

export function componentPreviewLabels(locale: "zh-CN" | "en") {
  return locale === "en"
    ? { preview: "Preview", code: "Code" }
    : { preview: "预览", code: "代码" };
}

export function ComponentPreview({ children, code }: { children: ReactNode; code: string }) {
  const labels = componentPreviewLabels(DOCS_LOCALE);

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-sm">
      <Tabs defaultValue="preview">
        <div className="border-b border-border bg-surface px-2 py-1.5">
          <TabsList variant="solid">
            <TabsTab value="preview">{labels.preview}</TabsTab>
            <TabsTab value="code">{labels.code}</TabsTab>
          </TabsList>
        </div>
        <TabsPanel value="preview" className="mt-0 rounded-none">
          <div className="flex flex-wrap items-center gap-4 bg-bg p-8">{children}</div>
        </TabsPanel>
        <TabsPanel value="code" className="mt-0 rounded-none">
          {/* 已在外层 Tabs 容器内，去掉自带边框圆角避免框中框 */}
          <CodeBlock code={code} className="rounded-none border-0" />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
