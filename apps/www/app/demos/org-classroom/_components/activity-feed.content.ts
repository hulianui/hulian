import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    statusChanged: "{0} 将状态改为{1}",
    seatAssigned: "{0} 入驻 {1}",
    seatReleased: "{0} 释放了 {1}",
    joined: "{0} 加入团队，工位待分配",
    interviewScheduled: "安排了 {0} 的面试",
    interviewCanceled: "取消了 {0} 的面试",
    interviewDone: "{0} 的面试已完成",
    unknownPerson: "未知成员",
    unknownSeat: "未知工位",
    empty: "暂无动态",
  },
  en: {
    statusChanged: "{0} changed status to {1}",
    seatAssigned: "{0} moved into {1}",
    seatReleased: "{0} released {1}",
    joined: "{0} joined the team, seat pending",
    interviewScheduled: "Scheduled an interview with {0}",
    interviewCanceled: "Canceled the interview with {0}",
    interviewDone: "Interview with {0} completed",
    unknownPerson: "Unknown member",
    unknownSeat: "Unknown seat",
    empty: "No activity yet",
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
  key: "demo-org-classroom-components-activity-feed",
  content: t(content),
};

export default dictionary;
