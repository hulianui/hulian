import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    pleaseSelectPatient: "请选择患者",
    pleaseSelectAStartTime: "请选择起诊时间",
    pleaseSelectAnEndTime: "请选择结束时间",
    editAppointment: "编辑预约",
    newAppointment: "新建预约",
    save: "保存",
    buildAppointment: "建预约",
    patient: "患者",
    searchSelectPatients: "搜索 / 选择患者",
    searchForPatientNamePhone: "搜索患者姓名 / 手机…",
    attendingPhysician: "接诊医生",
    clinic: "诊室",
    appointmentType: "预约类型",
    visitStartTime: "起诊时间",
    endTime: "结束时间",
  },
  en: {
    pleaseSelectPatient: "Please select patient",
    pleaseSelectAStartTime: "Please select a start time",
    pleaseSelectAnEndTime: "Please select an end time",
    editAppointment: "Edit appointment",
    newAppointment: "New appointment",
    save: "Save",
    buildAppointment: "Create appointment",
    patient: "Patient",
    searchSelectPatients: "Search or select a patient",
    searchForPatientNamePhone: "Search by patient name or phone...",
    attendingPhysician: "Clinician",
    clinic: "Room",
    appointmentType: "Appointment type",
    visitStartTime: "Visit start time",
    endTime: "End time",
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
  key: "demo-scheduler-components-appointment-form",
  content: t(content),
};

export default dictionary;
