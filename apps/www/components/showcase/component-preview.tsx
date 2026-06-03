"use client";
import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@hulian/ui";
import { CodeBlock } from "./code-block";

export function ComponentPreview({ children, code }: { children: ReactNode; code: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border">
      <Tabs defaultValue="preview">
        <div className="border-b border-border bg-surface px-2 py-1.5">
          <TabsList variant="solid">
            <TabsTab value="preview">预览</TabsTab>
            <TabsTab value="code">代码</TabsTab>
          </TabsList>
        </div>
        <TabsPanel value="preview" className="mt-0 rounded-none">
          <div className="flex flex-wrap items-center gap-4 bg-bg p-8">{children}</div>
        </TabsPanel>
        <TabsPanel value="code" className="mt-0 rounded-none">
          <CodeBlock code={code} />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
