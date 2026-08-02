import { copy } from "./clinic.content";
import {
  dayjs,
  type SchedulerEvent,
  type SchedulerResource,
  type SchedulerTone,
} from "@hulianui/ui";

// 「瀚约 诊所预约管理台」内存 mock —— 全本地、零外链（铁律四）。
// 预约即 SchedulerEvent，resourceId 绑医生；附带 type/patient 元字段供详情/取消用。

export type ApptType = "初诊" | "复诊" | "检查" | "处置" | "停诊";

export interface ClinicAppt extends SchedulerEvent {
  /** = 医生 id（resourceId 同值，供资源视图归列）。 */
  doctorId: string;
  type: ApptType;
  patient: string;
  /** 诊室（详情展示用）。 */
  room?: string;
}

export interface Doctor extends SchedulerResource {
  /** 科室。 */
  dept: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
}

export const DOCTORS: Doctor[] = [
  {
    id: "d1",
    title: copy("liJianguo"),
    subtitle: copy("internalMedicine"),
    dept: copy("internalMedicine"),
  },
  { id: "d2", title: copy("wangMin"), subtitle: copy("surgery"), dept: copy("surgery") },
  { id: "d3", title: copy("zhangTao"), subtitle: copy("pediatrics"), dept: copy("pediatrics") },
  { id: "d4", title: copy("zhaoLi"), subtitle: copy("dermatology"), dept: copy("dermatology") },
];

export const ROOMS = [copy("clinic"), copy("clinicAlternate"), copy("disposalRoom")] as const;

export const PATIENTS: Patient[] = [
  { id: "p1", name: copy("chenXiaoming"), phone: "138****2046" },
  { id: "p2", name: copy("liuYajing"), phone: "139****7783" },
  { id: "p3", name: copy("zhaoGuoqiang"), phone: "137****5512" },
  { id: "p4", name: copy("sunLihua"), phone: "135****9920" },
  { id: "p5", name: copy("zhouJianjun"), phone: "136****3367" },
  { id: "p6", name: copy("wuXiaotong"), phone: "138****1145" },
  { id: "p7", name: copy("zhengWenbo"), phone: "139****8801" },
  { id: "p8", name: copy("huangQiuyi"), phone: "150****4473" },
];

export const TYPE_TONE: Record<ApptType, SchedulerTone> = {
  初诊: "primary",
  复诊: "success",
  检查: "warning",
  处置: "neutral",
  停诊: "danger",
};
export const TYPE_LABELS: Record<ApptType, string> = {
  初诊: copy("initialConsultation"),
  复诊: copy("revisit"),
  检查: copy("check"),
  处置: copy("disposal"),
  停诊: copy("stop"),
};

/** monday(YYYY-MM-DD) + 天偏移 + "HH:mm" → 本地 ISO datetime。 */
function at(monday: string, dayOffset: number, hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return dayjs(monday)
    .add(dayOffset, "day")
    .hour(h)
    .minute(m)
    .second(0)
    .millisecond(0)
    .format("YYYY-MM-DDTHH:mm:ss");
}

function appt(
  monday: string,
  id: string,
  doctorId: string,
  type: ApptType,
  patient: string,
  dayOffset: number,
  start: string,
  end: string,
): ClinicAppt {
  return {
    id,
    title: `${TYPE_LABELS[type]} · ${patient}`,
    start: at(monday, dayOffset, start),
    end: at(monday, dayOffset, end),
    resourceId: doctorId,
    doctorId,
    type,
    patient,
    tone: TYPE_TONE[type],
    subtitle: DOCTORS.find((d) => d.id === doctorId)?.dept,
  };
}

/** 以「本周周一」为锚生成稳定排班（含同医生重叠以演示并排，跨周一~周五）。 */
export function buildAppointments(monday: string): ClinicAppt[] {
  return [
    // 周一
    appt(monday, "a1", "d1", "复诊", copy("chenXiaoming"), 0, "09:00", "09:30"),
    appt(monday, "a2", "d1", "初诊", copy("liuYajing"), 0, "09:30", "10:30"),
    appt(monday, "a3", "d2", "初诊", copy("sunLihua"), 0, "09:00", "10:00"),
    appt(monday, "a4", "d2", "检查", copy("zhouJianjun"), 0, "10:30", "11:30"),
    appt(monday, "a5", "d3", "复诊", copy("wuXiaotong"), 0, "14:00", "14:30"),
    // 周一同医生重叠（演示并排分列）
    appt(monday, "a6", "d1", "处置", copy("zhengWenbo"), 0, "09:15", "09:45"),
    // 周二
    appt(monday, "a7", "d3", "初诊", copy("huangQiuyi"), 1, "10:00", "10:45"),
    appt(monday, "a8", "d4", "复诊", copy("chenXiaoming"), 1, "15:00", "15:30"),
    appt(monday, "a9", "d1", "检查", copy("zhaoGuoqiang"), 1, "11:00", "12:00"),
    // 周三
    appt(monday, "a10", "d2", "复诊", copy("liuYajing"), 2, "09:30", "10:00"),
    appt(monday, "a11", "d2", "初诊", copy("sunLihua"), 2, "10:00", "11:00"),
    appt(monday, "a12", "d4", "初诊", copy("zhouJianjun"), 2, "14:30", "15:30"),
    // 周四
    appt(monday, "a13", "d3", "复诊", copy("wuXiaotong"), 3, "09:00", "09:30"),
    appt(monday, "a14", "d1", "停诊", copy("academicConferences"), 3, "13:00", "17:00"),
    // 周五
    appt(monday, "a15", "d2", "检查", copy("zhengWenbo"), 4, "10:00", "11:00"),
    appt(monday, "a16", "d4", "复诊", copy("huangQiuyi"), 4, "16:00", "16:30"),
  ];
}

/** 停诊登记：为 [startISO,endISO] 间每一天该医生生成一条全时段停诊事件。 */
export function buildLeave(
  doctorId: string,
  startISO: string,
  endISO: string,
  dayStartHour: number,
  dayEndHour: number,
): ClinicAppt[] {
  const out: ClinicAppt[] = [];
  let cur = dayjs(startISO).startOf("day");
  const end = dayjs(endISO).startOf("day");
  const doc = DOCTORS.find((d) => d.id === doctorId);
  let i = 0;
  while ((cur.isBefore(end) || cur.isSame(end)) && i < 31) {
    const day = cur.format("YYYY-MM-DD");
    out.push({
      id: `leave-${doctorId}-${day}`,
      title: copy("blockedClinician", doc?.title ?? ""),
      start: `${day}T${String(dayStartHour).padStart(2, "0")}:00:00`,
      end: `${day}T${String(dayEndHour).padStart(2, "0")}:00:00`,
      resourceId: doctorId,
      doctorId,
      type: "停诊",
      patient: "—",
      tone: "danger",
      subtitle: TYPE_LABELS["停诊"],
    });
    cur = cur.add(1, "day");
    i++;
  }
  return out;
}
