import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    idle: "在岗",
    busy: "忙碌",
    meeting: "会议中",
    leave: "休假",
    interview: "面试中",

    screen: "初试",
    tech: "复试",
    final: "终面",

    scheduled: "待开始",
    ongoing: "进行中",
    done: "已完成",
    canceled: "已取消",

    up: "朝上",
    right: "朝右",
    down: "朝下",
    left: "朝左",

    seatLabel: "{0} · {1}排{2}列",
    unassigned: "未分配",
  },
  en: {
    idle: "On duty",
    busy: "Busy",
    meeting: "In meeting",
    leave: "On leave",
    interview: "Interviewing",

    screen: "Screening",
    tech: "Technical",
    final: "Final",

    scheduled: "Scheduled",
    ongoing: "In progress",
    done: "Completed",
    canceled: "Canceled",

    up: "Up",
    right: "Right",
    down: "Down",
    left: "Left",

    seatLabel: "{0} · R{1}C{2}",
    unassigned: "Unassigned",
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
  key: "demo-org-classroom-lib-labels",
  content: t(content),
};

export default dictionary;
