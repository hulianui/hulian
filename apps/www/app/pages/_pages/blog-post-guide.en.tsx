import { ArticleTocBlock } from "../../blocks/_blocks/article-toc.en";
import { CtaBlock } from "../../blocks/_blocks/cta.en";
export function BlogPostGuidePage() {
    return (<div className="bg-bg">
      <ArticleTocBlock />
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <CtaBlock />
        </div>
      </section>
    </div>);
}
