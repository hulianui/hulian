/** @jsxImportSource ../../../lib/fixture-jsx */
import { ArticleTocBlock } from "../../blocks/_blocks/article-toc";
import { CtaBlock } from "../../blocks/_blocks/cta";

// 博客文章页（长文指南版式）—— 左正文 + 右 sticky 目录的 ArticleToc，末尾订阅转化。
// 与 blog-post（叙事案例版式）并列，展示博客文章页的两种典型版式变体。
export function BlogPostGuidePage() {
  return (
    <div className="bg-bg">
      <ArticleTocBlock />
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <CtaBlock />
        </div>
      </section>
    </div>
  );
}
