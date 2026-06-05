"use client";
import type { ReactNode } from "react";
import { CodeBlock, Tabs, TabsList, TabsPanel, TabsTab } from "@hulianui/ui";

// 区块预览器：预览 / 代码 双 Tab。代码 Tab 的 CodeBlock 自带一键复制——
// 这正是「让别人抄」的核心动作。预览容器给整段区块足够留白（区别组件文档的紧凑 flex）。
export function BlockView({ children, code }: { children: ReactNode; code: string }) {
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
          <div className="bg-bg px-6 py-12">{children}</div>
        </TabsPanel>
        <TabsPanel value="code" className="mt-0 rounded-none">
          <CodeBlock code={code} className="max-h-[32rem] overflow-auto rounded-none border-0" />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
