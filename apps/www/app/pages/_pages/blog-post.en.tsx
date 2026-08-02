import { ArticleBodyBlock } from "../../blocks/_blocks/article-body.en";
import { CtaBlock } from "../../blocks/_blocks/cta.en";
export function BlogPostPage() {
    return (<div className="bg-bg">
      <ArticleBodyBlock />
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <CtaBlock />
        </div>
      </section>
    </div>);
}
