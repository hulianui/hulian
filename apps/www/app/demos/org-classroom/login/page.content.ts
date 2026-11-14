import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    brand: "瀚位 HanSeat",
    brandMark: "位",
    badge: "组织运营 · 内置演示",
    heading: "把工位、成员和面试",
    headingLine2: "放在同一张图上",
    intro: "工位图不是一张静态平面图：点座位改状态、给新人分配工位、按部门聚焦，面试排期和人员档案都从同一份数据长出来。",
    feature1Title: "工位即状态",
    feature1Desc: "座位、人员、在岗状态是同一条记录的不同视角。",
    feature2Title: "面试排期到面试间",
    feature2Desc: "资源视图按房间分列，拖拽即可改期。",
    feature3Title: "一张图打通两处",
    feature3Desc: "在工位图改的状态，人员名录与总览立刻同步。",
    formSubtitle: "登录组织工位管理台",
    forgotPassword: "忘记密码",
    ssoLogin: "企业 SSO 登录",
    demoHint: "演示环境：任意账号密码均可进入。",
  },
  en: {
    brand: "HanSeat",
    brandMark: "S",
    badge: "Workplace ops · Built-in demo",
    heading: "Seats, people and interviews",
    headingLine2: "on one floor plan",
    intro:
      "The seat map is not a static picture: change status, assign seats to new hires, focus a department, and keep interviews and profiles in the same data model.",
    feature1Title: "A seat is a status",
    feature1Desc: "Seat, person and presence are views of the same record.",
    feature2Title: "Interviews by room",
    feature2Desc: "The resource view lists rooms as columns; drag to reschedule.",
    feature3Title: "One map, two places",
    feature3Desc: "Status changes on the map update the directory and overview instantly.",
    formSubtitle: "Sign in to the workplace console",
    forgotPassword: "Forgot password",
    ssoLogin: "Enterprise SSO",
    demoHint: "Demo environment: any account and password will work.",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-org-classroom-login-page",
  content: t(content),
};

export default dictionary;
