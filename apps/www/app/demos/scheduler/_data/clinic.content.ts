import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    liJianguo: "李建国",
    internalMedicine: "内科",
    wangMin: "王敏",
    surgery: "外科",
    zhangTao: "张涛",
    pediatrics: "儿科",
    zhaoLi: "赵丽",
    dermatology: "皮肤科",
    clinic: "1 诊室",
    clinicAlternate: "2 诊室",
    disposalRoom: "处置室",
    chenXiaoming: "陈晓明",
    liuYajing: "刘雅静",
    zhaoGuoqiang: "赵国强",
    sunLihua: "孙丽华",
    zhouJianjun: "周建军",
    wuXiaotong: "吴小桐",
    zhengWenbo: "郑文博",
    huangQiuyi: "黄秋怡",
    revisit: "复诊",
    initialConsultation: "初诊",
    check: "检查",
    disposal: "处置",
    stop: "停诊",
    academicConferences: "学术会议",
    blockedClinician: "停诊 · {0}",
  },
  en: {
    liJianguo: "Li Jianguo",
    internalMedicine: "Internal Medicine",
    wangMin: "Wang Min",
    surgery: "Surgery",
    zhangTao: "Zhang Tao",
    pediatrics: "Pediatrics",
    zhaoLi: "Zhao Li",
    dermatology: "Dermatology",
    clinic: "Clinic Room 1",
    clinicAlternate: "Clinic Room 2",
    disposalRoom: "Procedure Room",
    chenXiaoming: "Chen Xiaoming",
    liuYajing: "Liu Yajing",
    zhaoGuoqiang: "Zhao Guoqiang",
    sunLihua: "Sun Lihua",
    zhouJianjun: "Zhou Jianjun",
    wuXiaotong: "Wu Xiaotong",
    zhengWenbo: "Zheng Wenbo",
    huangQiuyi: "Huang Qiuyi",
    revisit: "Follow-up",
    initialConsultation: "Initial visit",
    check: "Exam",
    disposal: "Procedure",
    stop: "Blocked",
    academicConferences: "Academic conference",
    blockedClinician: "Blocked · {0}",
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
  key: "demo-scheduler-data-clinic",
  content: t(content),
};

export default dictionary;
