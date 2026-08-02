import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "coral": "瑚",
    "hanreviewHanreview": "瀚审 HanReview",
    "coral2": "瑚",
    "switchToBrightColors": "切换到亮色",
    "switchToDark": "切换到暗色",
    "notification": "通知",
    "noNewNotificationsYet": "暂无新通知",
    "alertsAboutAccessControlSeriousIssuesAnd": "门禁阻断、严重问题等提醒会在此汇总",
    "zhouMingxuan": "周明轩",
    "headOfRD": "研发负责人",
    "zhou": "周",
  },
  en: {
    "coral": "Coral",
    "hanreviewHanreview": "HanReview",
    "coral2": "Coral",
    "switchToBrightColors": "Switch to bright colors",
    "switchToDark": "Switch to dark",
    "notification": "Notification",
    "noNewNotificationsYet": "No new notifications yet",
    "alertsAboutAccessControlSeriousIssuesAnd": "Quality-gate and critical-finding alerts appear here",
    "zhouMingxuan": "Zhou Mingxuan",
    "headOfRD": "Head of R&D",
    "zhou": "Zhou",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-components-review-shell",
  content: t(content),
};

export default dictionary;
