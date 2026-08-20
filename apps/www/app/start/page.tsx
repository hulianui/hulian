import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { Anchor, Markdown, extractHeadings, type AnchorItem } from "@hulianui/ui";
import { SiteNavbar } from "../../components/site-navbar";
import { CopyMarkdownButton } from "../../components/copy-markdown-button";
import { aiGuide, aiGuideBody } from "../../lib/ai-guide";
import { DOCS_LOCALE } from "../../lib/docs-locale";

const content = getIntlayer("start", DOCS_LOCALE);
const guide = aiGuide(DOCS_LOCALE);
// 页面渲染剥掉正文自带的标题与引言（页头已说过）；复制按钮仍拿完整原文。
const guideBody = aiGuideBody(guide);

// 目录从**页面实际渲染的那一份**抽 —— 拿完整原文抽会多出一条页面上并不存在的 H1 条目。
// 与 <Markdown headingIds> 共用 extractHeadings 的 slug 规则，href 与 DOM 里的 id 必然一致。
const toc: AnchorItem[] = [];
for (const h of extractHeadings(guideBody)) {
  // 目录标签用 plainText：标题里的 `代码` / **粗体** 标记不该原样显示在目录里
  const item: AnchorItem = { href: `#${h.id}`, title: h.plainText };
  const parent = toc[toc.length - 1];
  // h3 收进上一条 h2 之下（Anchor 只支持一层嵌套）；没有父级时按顶级处理。
  if (h.level >= 3 && parent) (parent.children ??= []).push(item);
  else toc.push(item);
}

export const metadata: Metadata = {
  title: `${content.metadataTitle}`,
  description: `${content.metadataDescription}`,
};

export default function StartPage() {
  return (
    <>
      <SiteNavbar />
      {/* 比原先宽（max-w-5xl 而非 3xl）：右侧要容下本页目录。正文列自己再收一次 ——
          目录被隐藏的窄屏上仍维持原先 max-w-3xl 的可读行宽，不因为加目录而把长文摊宽。 */}
      <main className="mx-auto flex max-w-5xl gap-10 px-6 pb-20 pt-10">
        <div className="mx-auto min-w-0 max-w-3xl flex-1 lg:mx-0 lg:max-w-none">
          <header className="flex items-start justify-between gap-4 pb-6">
            <div className="min-w-0">
              <h1 className="text-[1.7rem] font-semibold tracking-tight">{content.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{content.description}</p>
            </div>
            <CopyMarkdownButton text={guide} label={String(content.copy)} className="shrink-0" />
          </header>

          {/* scroll-mt 由页面给（组件不替调用方留）：直接开 #锚点 深链时避开 sticky 顶栏(4rem)，
              与下方 Anchor 的 offsetTop 取同一档，否则落点与高亮各差一截。 */}
          <article className="rounded-xl border border-border bg-surface p-6 shadow-sm [&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20 sm:p-8">
            <Markdown size="sm" headingIds>
              {guideBody}
            </Markdown>
          </article>
        </div>

        {/* 本页目录：真·瑚琏 Anchor（dogfood），与组件文档页一致。本页的滚动体是 window
            （不同于 /components 那套 DocsShell 的内层 <main>），故不传 getContainer。 */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-24">
            <p className="mb-2 pl-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {content.onThisPage}
            </p>
            <Anchor items={toc} offsetTop={88} aria-label={String(content.onThisPage)} />
          </div>
        </aside>
      </main>
    </>
  );
}
