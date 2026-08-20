import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { Markdown } from "@hulianui/ui";
import { SiteNavbar } from "../../components/site-navbar";
import { CopyMarkdownButton } from "../../components/copy-markdown-button";
import { aiGuide, aiGuideBody } from "../../lib/ai-guide";
import { DOCS_LOCALE } from "../../lib/docs-locale";

const content = getIntlayer("start", DOCS_LOCALE);
const guide = aiGuide(DOCS_LOCALE);
// 页面渲染剥掉正文自带的标题与引言（页头已说过）；复制按钮仍拿完整原文。
const guideBody = aiGuideBody(guide);

export const metadata: Metadata = {
  title: `${content.metadataTitle}`,
  description: `${content.metadataDescription}`,
};

export default function StartPage() {
  return (
    <>
      <SiteNavbar />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        <header className="flex items-start justify-between gap-4 pb-6">
          <div className="min-w-0">
            <h1 className="text-[1.7rem] font-semibold tracking-tight">{content.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{content.description}</p>
          </div>
          <CopyMarkdownButton text={guide} label={String(content.copy)} className="shrink-0" />
        </header>

        <article className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <Markdown size="sm">{guideBody}</Markdown>
        </article>
      </main>
    </>
  );
}
