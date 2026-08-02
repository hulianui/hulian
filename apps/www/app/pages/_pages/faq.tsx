/** @jsxImportSource ../../../lib/fixture-jsx */
import { FaqBlock } from "../../blocks/_blocks/faq";
import { ContactFormBlock } from "../../blocks/_blocks/contact-form";
import { CtaBlock } from "../../blocks/_blocks/cta";

// FAQ 帮助页 —— 常见问题自带标题区 + 联系我们答疑 + 行动号召,自助优先、答疑兜底。
export function FaqPage() {
  return (
    <div className="bg-bg">
      <FaqBlock />
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <ContactFormBlock />
        </div>
      </section>
      <CtaBlock />
    </div>
  );
}
