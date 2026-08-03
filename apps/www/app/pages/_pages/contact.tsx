/** @jsxImportSource ../../../lib/fixture-jsx */
import { ContactFormBlock } from "../../blocks/_blocks/contact-form";
import { FaqBlock } from "../../blocks/_blocks/faq";
import { CtaBlock } from "../../blocks/_blocks/cta";

// 联系页 —— 联系表单 + 常见问题 + 行动号召,销售线索收集。
export function ContactPage() {
  return (
    <div className="bg-bg">
      <section className="px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <ContactFormBlock />
        </div>
      </section>
      <FaqBlock />
      <CtaBlock />
    </div>
  );
}
