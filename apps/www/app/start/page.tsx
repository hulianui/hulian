import type { Metadata } from "next";
import { Markdown } from "@hulianui/ui";
import { SiteNavbar } from "../../components/site-navbar";
import { CopyMarkdownButton } from "../../components/copy-markdown-button";
import { AI_GUIDE_MD } from "../../lib/ai-guide";

export const metadata: Metadata = {
  title: "快速开始 · AI 接入 · 瑚琏 Hulian",
  description: "把这份文档复制给 AI 编程助手，即可正确地用瑚琏 @hulianui/ui 搭界面。",
};

export default function StartPage() {
  return (
    <>
      <SiteNavbar />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        <header className="flex items-start justify-between gap-4 pb-6">
          <div className="min-w-0">
            <h1 className="text-[1.7rem] font-semibold tracking-tight">快速开始 · AI 接入</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              这一整页本身就是一篇 Markdown —— 复制给 AI 编程助手，它即可正确地用瑚琏搭界面。
            </p>
          </div>
          <CopyMarkdownButton text={AI_GUIDE_MD} label="复制全文" className="shrink-0" />
        </header>

        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <Markdown size="sm">{AI_GUIDE_MD}</Markdown>
        </article>
      </main>
    </>
  );
}
