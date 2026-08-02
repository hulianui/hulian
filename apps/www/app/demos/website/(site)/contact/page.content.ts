import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    contactUsHancloud: "联系我们 · 瀚云 HanCloud",
    askAboutPlansBookADemoOrRequestAMigrationAssessmentLeaveYourDetailsAndWeWillReplyWithinOneBusine: "了解套餐、预约演示或获取迁移评估——留下信息，我们一个工作日内回复。",
    email: "邮箱",
    phone: "电话",
    address: "地址",
    text32f100CenturyAvenuePudongShanghai: "上海市浦东新区世纪大道 100 号 32 层",
    supportHours: "服务时间",
    weekdays9002100247ForEnterprise: "工作日 9:00 – 21:00（企业版 7×24）",
    home: "首页",
    contactUs: "联系我们",
    contactSales: "联系销售",
    tellUsAboutYourProject: "聊聊你的项目",
    whetherYouAreEvaluatingAMigrationBookingADemoOrExploringEnterpriseCapabilitiesWeAreHereToHelp: "无论是评估迁移、预约演示，还是想了解企业版能力，我们都很乐意提供帮助。",
    otherWaysToReachUs: "其他联系方式",
    needTechnicalSupport: "寻求技术支持？",
    existingCustomersCanOpenATicketFromTheConsoleProPlansReceiveAResponseWithinFourHoursWhileEnterpr: "现有客户可在控制台内提交工单，专业版 4 小时响应，企业版配备专属客户成功经理。",
  },
  en: {
    contactUsHancloud: "Contact us · HanCloud",
    askAboutPlansBookADemoOrRequestAMigrationAssessmentLeaveYourDetailsAndWeWillReplyWithinOneBusine: "Ask about plans, book a demo, or request a migration assessment. Leave your details and we will reply within one business day.",
    email: "Email",
    phone: "phone",
    address: "Address",
    text32f100CenturyAvenuePudongShanghai: "32F, 100 Century Avenue, Pudong, Shanghai",
    supportHours: "Support hours",
    weekdays9002100247ForEnterprise: "Weekdays, 9:00–21:00 (24/7 for Enterprise)",
    home: "Home",
    contactUs: "Contact us",
    contactSales: "Contact sales",
    tellUsAboutYourProject: "Tell us about your project",
    whetherYouAreEvaluatingAMigrationBookingADemoOrExploringEnterpriseCapabilitiesWeAreHereToHelp: "Whether you are evaluating a migration, booking a demo, or exploring Enterprise capabilities, we are here to help.",
    otherWaysToReachUs: "Other ways to reach us",
    needTechnicalSupport: "Need technical support?",
    existingCustomersCanOpenATicketFromTheConsoleProPlansReceiveAResponseWithinFourHoursWhileEnterpr: "Existing customers can open a ticket from the console. Pro plans receive a response within four hours, while Enterprise includes a dedicated customer success manager.",
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
  key: "demo-website-site-contact-page",
  content: t(content),
};

export default dictionary;
