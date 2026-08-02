import { ContactFormBlock } from "../../blocks/_blocks/contact-form.en";
import { FaqBlock } from "../../blocks/_blocks/faq.en";
import { CtaBlock } from "../../blocks/_blocks/cta.en";
export function ContactPage() {
    return (<div className="bg-bg">
      <section className="px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <ContactFormBlock />
        </div>
      </section>
      <FaqBlock />
      <CtaBlock />
    </div>);
}
