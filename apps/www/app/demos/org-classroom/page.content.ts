import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    title: "组织工位",
    hint: "点座位打开人员卡并改状态。点分区空白处聚焦该部门，再点一次取消。",
  },
  en: {
    title: "Org classroom",
    hint: "Select a seat to open the person card and change status. Click empty floor space to focus the department, then click again to clear it.",
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
  key: "demo-org-classroom-page",
  content: t(content),
};

export default dictionary;
