import { FaqBlock } from "../../blocks/_blocks/faq.en";
import { ContactFormBlock } from "../../blocks/_blocks/contact-form.en";
import { CtaBlock } from "../../blocks/_blocks/cta.en";
export function FaqPage() {
    return (<div className="bg-bg">
      <FaqBlock />
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <ContactFormBlock />
        </div>
      </section>
      <CtaBlock />
    </div>);
}
