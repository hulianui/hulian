import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    guestbookLinYu: "留言板 · 林屿",
    leaveLinYuAnIdeaSuggestionOrHello: "给林屿留言，留下你的想法、建议或问候。",
  },
  en: {
    guestbookLinYu: "Guestbook · Lin Yu",
    leaveLinYuAnIdeaSuggestionOrHello: "Leave Lin Yu an idea, suggestion, or hello.",
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
  key: "demo-personal-site-guestbook-page",
  content: t(content),
};

export default dictionary;
