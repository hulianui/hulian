import { dayjs, type SchedulerEvent, type SchedulerResource, type SchedulerTone } from "@hulianui/ui";

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
  { id: "d1", title: "李建国", subtitle: "内科", dept: "内科" },
  { id: "d2", title: "王敏", subtitle: "外科", dept: "外科" },
  { id: "d3", title: "张涛", subtitle: "儿科", dept: "儿科" },
  { id: "d4", title: "赵丽", subtitle: "皮肤科", dept: "皮肤科" },
];

export const ROOMS = ["1 诊室", "2 诊室", "处置室"] as const;

export const PATIENTS: Patient[] = [
  { id: "p1", name: "陈晓明", phone: "138****2046" },
  { id: "p2", name: "刘雅静", phone: "139****7783" },
  { id: "p3", name: "赵国强", phone: "137****5512" },
  { id: "p4", name: "孙丽华", phone: "135****9920" },
  { id: "p5", name: "周建军", phone: "136****3367" },
  { id: "p6", name: "吴小桐", phone: "138****1145" },
  { id: "p7", name: "郑文博", phone: "139****8801" },
  { id: "p8", name: "黄秋怡", phone: "150****4473" },
];

export const TYPE_TONE: Record<ApptType, SchedulerTone> = {
  初诊: "primary",
  复诊: "success",
  检查: "warning",
  处置: "neutral",
  停诊: "danger",
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
    title: `${type} · ${patient}`,
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
    appt(monday, "a1", "d1", "复诊", "陈晓明", 0, "09:00", "09:30"),
    appt(monday, "a2", "d1", "初诊", "刘雅静", 0, "09:30", "10:30"),
    appt(monday, "a3", "d2", "初诊", "孙丽华", 0, "09:00", "10:00"),
    appt(monday, "a4", "d2", "检查", "周建军", 0, "10:30", "11:30"),
    appt(monday, "a5", "d3", "复诊", "吴小桐", 0, "14:00", "14:30"),
    // 周一同医生重叠（演示并排分列）
    appt(monday, "a6", "d1", "处置", "郑文博", 0, "09:15", "09:45"),
    // 周二
    appt(monday, "a7", "d3", "初诊", "黄秋怡", 1, "10:00", "10:45"),
    appt(monday, "a8", "d4", "复诊", "陈晓明", 1, "15:00", "15:30"),
    appt(monday, "a9", "d1", "检查", "赵国强", 1, "11:00", "12:00"),
    // 周三
    appt(monday, "a10", "d2", "复诊", "刘雅静", 2, "09:30", "10:00"),
    appt(monday, "a11", "d2", "初诊", "孙丽华", 2, "10:00", "11:00"),
    appt(monday, "a12", "d4", "初诊", "周建军", 2, "14:30", "15:30"),
    // 周四
    appt(monday, "a13", "d3", "复诊", "吴小桐", 3, "09:00", "09:30"),
    appt(monday, "a14", "d1", "停诊", "学术会议", 3, "13:00", "17:00"),
    // 周五
    appt(monday, "a15", "d2", "检查", "郑文博", 4, "10:00", "11:00"),
    appt(monday, "a16", "d4", "复诊", "黄秋怡", 4, "16:00", "16:30"),
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
      title: `停诊 · ${doc?.title ?? ""}`,
      start: `${day}T${String(dayStartHour).padStart(2, "0")}:00:00`,
      end: `${day}T${String(dayEndHour).padStart(2, "0")}:00:00`,
      resourceId: doctorId,
      doctorId,
      type: "停诊",
      patient: "—",
      tone: "danger",
      subtitle: "停诊",
    });
    cur = cur.add(1, "day");
    i++;
  }
  return out;
}
