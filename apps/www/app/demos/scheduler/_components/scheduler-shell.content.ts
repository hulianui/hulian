import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    appointmentUpdated: "预约已更新",
    appointmentCreated: "已建预约",
    appointmentRescheduled: "预约已改期",
    appointmentCanceled: "已取消预约",
    pleaseSelectAStoppingAreaFirst: "请先选择停诊区间",
    enrolledToStopVisit: "已登记停诊",
    jumpToADayCrescentView: "跳转到某日（切日视图）",
    selectDates: "选择日期",
    doctor: "医生",
    stopLeaveRegistration: "停诊 / 请假登记",
    selectStoppingDoctor: "选择停诊医生",
    startDate: "开始日",
    endDate: "结束日",
    enrollmentStoppage: "登记停诊",
    appointmentToday: "今日预约",
    personS: "人次",
    utilization: "利用率",
    hanyuoClinicScheduleTable: "瀚约 · 诊所排班台",
    draggingBlankToBuildAnAppointmentDraggingEventReschedulingDragging:
      "拖空白建预约 · 拖事件改期 · 拖下缘改时长",
    refreshSchedule: "刷新排班",
    newAppointment: "新建预约",
    retry: "重试",
    noDoctorSelected: "未选择医生",
    checkAtLeastOneDoctorOnTheLeftToSee: "在左侧勾选至少一名医生以查看其排班。",
    patient: "患者",
    type: "类型",
    clinic: "诊室",
    time: "时间",
    mmmDDayHHMm: "M月D日 HH:mm",
    edit: "编辑",
    cancelThisAppointment: "取消该预约？",
    cancelThePostNumberSourceReleaseDemoMemoryStateRefresh:
      "取消后号源释放（demo 内存态，刷新还原）。",
    cancelAppointment: "取消预约",
    thinkAgain: "再想想",
  },
  en: {
    appointmentUpdated: "Appointment updated",
    appointmentCreated: "Appointment created",
    appointmentRescheduled: "Appointment rescheduled",
    appointmentCanceled: "Appointment canceled",
    pleaseSelectAStoppingAreaFirst: "Select an unavailable date range first",
    enrolledToStopVisit: "Unavailability saved",
    jumpToADayCrescentView: "Jump to a date (switches to day view)",
    selectDates: "Select dates",
    doctor: "Doctor",
    stopLeaveRegistration: "Block clinician availability",
    selectStoppingDoctor: "Select a clinician",
    startDate: "Start date",
    endDate: "End date",
    enrollmentStoppage: "Block availability",
    appointmentToday: "Appointments today",
    personS: "visits",
    utilization: "Utilization",
    hanyuoClinicScheduleTable: "Hulian Clinic Scheduler",
    draggingBlankToBuildAnAppointmentDraggingEventReschedulingDragging:
      "Drag an empty slot to create · Drag an appointment to reschedule · Drag its lower edge to change duration",
    refreshSchedule: "Refresh schedule",
    newAppointment: "New appointment",
    retry: "Retry",
    noDoctorSelected: "No doctor selected",
    checkAtLeastOneDoctorOnTheLeftToSee:
      "Select at least one clinician on the left to view their schedule.",
    patient: "Patient",
    type: "Type",
    clinic: "Room",
    time: "Time",
    mmmDDayHHMm: "MMM D, HH:mm",
    edit: "Edit",
    cancelThisAppointment: "Cancel this appointment?",
    cancelThePostNumberSourceReleaseDemoMemoryStateRefresh:
      "Canceling releases the time slot. This demo resets after a refresh.",
    cancelAppointment: "Cancel appointment",
    thinkAgain: "Keep appointment",
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
  key: "demo-scheduler-components-scheduler-shell",
  content: t(content),
};

export default dictionary;
