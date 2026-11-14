import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    title: "人员档案",
    description: "联系方式、工位与最近动态",
    email: "邮箱",
    phone: "电话",
    department: "部门",
    seat: "工位",
    status: "状态",
    joinedOn: "入职日期",
    recentActivity: "最近动态",
    noSeat: "尚未分配工位",
    setOnDuty: "设为在岗",
    locate: "在工位图中查看",
    close: "关闭",
    statusUpdated: "状态已更新",
    statusUpdatedDesc: "{0} 现在{1}",
  },
  en: {
    title: "Person profile",
    description: "Contact details, seat and recent activity",
    email: "Email",
    phone: "Phone",
    department: "Department",
    seat: "Seat",
    status: "Status",
    joinedOn: "Joined on",
    recentActivity: "Recent activity",
    noSeat: "No seat assigned",
    setOnDuty: "Set on duty",
    locate: "Show on seat map",
    close: "Close",
    statusUpdated: "Status updated",
    statusUpdatedDesc: "{0} is now {1}",
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
  key: "demo-org-classroom-components-person-drawer",
  content: t(content),
};

export default dictionary;
