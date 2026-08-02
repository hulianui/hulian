import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    text: "“",
    text2: "”",
    whatCustomersSay: "客户怎么说",
    trustedByTeamsThatCareAboutCraft: "被认真做产品的团队信赖",
    fromStartupsToPublicCompaniesTeamsUseHancloudToShipIdeasFasterAndMoreReliably: "从初创到上市公司，他们用瀚云更快、更稳地把想法送到用户面前。",
  },
  en: {
    text: "\"",
    text2: "\"",
    whatCustomersSay: "What customers say",
    trustedByTeamsThatCareAboutCraft: "Trusted by teams that care about craft",
    fromStartupsToPublicCompaniesTeamsUseHancloudToShipIdeasFasterAndMoreReliably: "From startups to public companies, teams use HanCloud to ship ideas faster and more reliably.",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-website-components-sections-testimonials",
  content: t(content),
};

export default dictionary;
