"use client";
import type { ReactNode } from "react";
import { CodeBlock, Tabs, TabsList, TabsPanel, TabsTab } from "@hulianui/ui";

// 页面预览器:预览 / 代码 双 Tab。预览是整页,放进受限滚动容器(像活预览窗格);
// 代码 = 页面组合源码(展示「如何用区块拼整页」)。CodeBlock 自带一键复制。
export function PageView({ children, code }: { children: ReactNode; code: string }) {
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
          {/* 整页在受限高度内独立滚动,模拟真实视口 */}
          <div className="max-h-[78vh] overflow-auto">{children}</div>
        </TabsPanel>
        <TabsPanel value="code" className="mt-0 rounded-none">
          <CodeBlock code={code} className="max-h-[78vh] overflow-auto rounded-none border-0" />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
