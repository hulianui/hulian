/** @jsxImportSource ../../../lib/fixture-jsx */
import { ArticleBodyBlock } from "../../blocks/_blocks/article-body";
import { CtaBlock } from "../../blocks/_blocks/cta";

// 博客文章页 —— 文章正文(自带文章头) + 订阅行动号召,沉浸阅读后引导留存。
export function BlogPostPage() {
  return (
    <div className="bg-bg">
      <ArticleBodyBlock />
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <CtaBlock />
        </div>
      </section>
    </div>
  );
}
