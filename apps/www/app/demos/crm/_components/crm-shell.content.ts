import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "coral": "瑚",
    "hulianCrm": "瑚琏 CRM",
    "coral2": "瑚",
    "switchToBrightColors": "切换到亮色",
    "switchToDark": "切换到暗色",
    "notification": "通知",
    "noNewNotificationsYet": "暂无新通知",
    "remindersSuchAsNewBusinessOpportunitiesAnd": "新商机、跟进到期等提醒会在此汇总",
    "linWanqing": "林晚晴",
    "salesDirector": "销售总监",
    "forest": "林",
  },
  en: {
    "coral": "coral",
    "hulianCrm": "Hulian CRM",
    "coral2": "coral",
    "switchToBrightColors": "switch to bright colors",
    "switchToDark": "switch to dark",
    "notification": "Notification",
    "noNewNotificationsYet": "No new notifications yet",
    "remindersSuchAsNewBusinessOpportunitiesAnd": "Reminders such as new business opportunities and follow-up due dates will be summarized here.",
    "linWanqing": "Lin Wanqing",
    "salesDirector": "Sales Director",
    "forest": "forest",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-crm-components-crm-shell",
  content: t(content),
};

export default dictionary;
