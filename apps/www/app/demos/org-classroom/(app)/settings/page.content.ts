import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    title: "设置",
    subtitle: "平面图朝向、面试时间轴与状态提示。保存后立刻作用到工位图和面试安排。",
    mapSection: "平面图",
    northDeg: "真北角度",
    northDegDesc: "只影响指南针指向，不改变座位布局。",
    defaultView: "默认视角",
    defaultViewDesc: "进入工位图时楼层的初始朝向。",
    showLegend: "显示状态图例",
    showLegendDesc: "在工位图上方显示各状态人数。",
    scheduleSection: "排期与通知",
    workStart: "上班时间",
    workEnd: "下班时间",
    workHoursDesc: "面试安排的时间轴范围。",
    notifyStatus: "状态变更提示",
    notifyStatusDesc: "在工位图人员卡里改状态时弹出提示。",
    save: "保存设置",
    savedToast: "设置已保存",
    savedToastDesc: "新的平面图与排期设置已生效。",
    endBeforeStart: "下班时间必须晚于上班时间",
    restoreDefaults: "恢复默认设置",
    restoreTitle: "恢复默认设置？",
    restoreDesc: "当前未保存的修改会被丢弃。",
    restoredToast: "已恢复默认设置",
    dangerSection: "危险区域",
    resetData: "重置演示数据",
    resetDataDesc: "清空本次演示里新增的工位、面试与状态变更，回到初始数据。",
    resetDataTitle: "重置全部演示数据？",
    resetDataConfirm: "这会丢掉演示过程中的所有改动，且无法撤销。",
    resetDataDone: "演示数据已重置",
    cancel: "取消",
  },
  en: {
    title: "Settings",
    subtitle:
      "Floor orientation, interview timeline and status prompts. Saved changes apply to the seat map and schedule immediately.",
    mapSection: "Seat map",
    northDeg: "True north",
    northDegDesc: "Only rotates the compass; seat layout is unchanged.",
    defaultView: "Default view",
    defaultViewDesc: "Initial orientation of the floor when opening the seat map.",
    showLegend: "Show status legend",
    showLegendDesc: "Display per-status counts above the seat map.",
    scheduleSection: "Schedule and notifications",
    workStart: "Work start",
    workEnd: "Work end",
    workHoursDesc: "Timeline range used by the interview scheduler.",
    notifyStatus: "Status change prompt",
    notifyStatusDesc: "Show a toast when changing status in the seat map person card.",
    save: "Save settings",
    savedToast: "Settings saved",
    savedToastDesc: "The new seat map and schedule settings are active.",
    endBeforeStart: "Work end must be later than work start",
    restoreDefaults: "Restore defaults",
    restoreTitle: "Restore default settings?",
    restoreDesc: "Unsaved changes will be discarded.",
    restoredToast: "Defaults restored",
    dangerSection: "Danger zone",
    resetData: "Reset demo data",
    resetDataDesc:
      "Clear seats, interviews and status changes added during this demo and return to the initial data.",
    resetDataTitle: "Reset all demo data?",
    resetDataConfirm: "Every change made during the demo is lost and cannot be undone.",
    resetDataDone: "Demo data reset",
    cancel: "Cancel",
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
  key: "demo-org-classroom-app-settings-page",
  content: t(content),
};

export default dictionary;
