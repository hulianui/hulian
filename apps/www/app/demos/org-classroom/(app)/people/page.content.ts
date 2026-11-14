import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    title: "人员名录",
    subtitle: "全员联系方式、工位与在岗状态。筛选后可批量调整状态。",
    kw: "关键词",
    kwPlaceholder: "姓名 / 职位 / 邮箱",
    department: "部门",
    status: "状态",
    allDepartments: "全部部门",
    allStatuses: "全部状态",
    colName: "成员",
    colTitle: "职位",
    colDept: "部门",
    colSeat: "工位",
    colStatus: "状态",
    colJoined: "入职日期",
    colActions: "操作",
    viewProfile: "档案",
    setOnDuty: "设为在岗",
    release: "移出工位",
    releaseTitle: "将 {0} 移出工位？",
    releaseDesc: "工位会变成空位，人员档案会保留。",
    releasedToast: "已移出工位",
    releasedToastDesc: "{0} 现在没有工位",
    statusUpdated: "状态已更新",
    statusUpdatedDesc: "{0} 现在{1}",
    batchSelected: "{0} 人已选",
    batchOnDuty: "批量设为在岗",
    batchLeave: "批量设为休假",
    batchDone: "已更新所选成员",
    batchDoneDesc: "{0} 人状态改为{1}",
    batchNoSeats: "所选成员都还没有工位",
    noResults: "没有匹配的成员",
    loadFailed: "人员名录加载失败",
    retry: "重试",
  },
  en: {
    title: "People directory",
    subtitle:
      "Contact details, seats and presence for the whole team. Filter first, then update status in bulk.",
    kw: "Keyword",
    kwPlaceholder: "Name / role / email",
    department: "Department",
    status: "Status",
    allDepartments: "All departments",
    allStatuses: "All statuses",
    colName: "Member",
    colTitle: "Role",
    colDept: "Department",
    colSeat: "Seat",
    colStatus: "Status",
    colJoined: "Joined on",
    colActions: "Actions",
    viewProfile: "Profile",
    setOnDuty: "Set on duty",
    release: "Release seat",
    releaseTitle: "Release {0}'s seat?",
    releaseDesc: "The seat becomes empty and the person profile is kept.",
    releasedToast: "Seat released",
    releasedToastDesc: "{0} no longer has a seat",
    statusUpdated: "Status updated",
    statusUpdatedDesc: "{0} is now {1}",
    batchSelected: "{0} selected",
    batchOnDuty: "Set on duty",
    batchLeave: "Set on leave",
    batchDone: "Selected members updated",
    batchDoneDesc: "{0} people changed to {1}",
    batchNoSeats: "None of the selected members has a seat",
    noResults: "No matching members",
    loadFailed: "Failed to load the people directory",
    retry: "Retry",
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
  key: "demo-org-classroom-app-people-page",
  content: t(content),
};

export default dictionary;
