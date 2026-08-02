import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    learnAboutPackagesAndQuotes: "了解套餐与报价",
    bookAProductDemo: "预约产品演示",
    migrationAndTechnologyAssessment: "迁移与技术评估",
    technicalSupport: "技术支持",
    other: "其他",
    enterYourName: "请填写称呼",
    enterYourEmailAddress: "请填写邮箱",
    enterAValidEmailAddress: "邮箱格式不正确",
    selectAnInquiryType: "请选择需求类型",
    brieflyDescribeWhatYouNeed: "请简单描述你的需求",
    pleaseCheckTheForm: "请检查表单",
    completeTheRequiredFieldsAndCorrectAnyInvalidEntries: "还有必填项未填写或格式不正确。",
    theServerIsBusyTryAgainShortlySimulatedDemoFailure: "服务器繁忙，请稍后重试（演示模拟失败）。",
    receivedThankYou: "已收到，谢谢！",
    ourTeamWillContactYouAt: "我们的团队会尽快通过",
    shortly: "与你联系。",
    contactUs: "联系我们",
    leaveYourDetailsAndWeLlReplyWithinOneBusinessDay: "留下信息，我们会在一个工作日内回复。",
    name: "称呼",
    yourName: "你怎么称呼",
    companyEmail: "公司邮箱",
    companyTeam: "公司 / 团队",
    optional: "选填",
    companyOrTeamName: "公司或团队名称",
    inquiryType: "需求类型",
    pleaseSelect: "请选择",
    leaveAMessage: "留言",
    brieflyDescribeYourBusinessScenarioAndGoals: "简单描述你的业务场景与目标……",
    submissionFailed: "提交失败",
    tryAgainTheDemoWillSimulateASuccessfulSubmission: "再点一次试试，演示将模拟成功提交。",
    submitting: "提交中…",
    submitInquiry: "提交需求",
  },
  en: {
    learnAboutPackagesAndQuotes: "Learn about packages and quotes",
    bookAProductDemo: "Book a product demo",
    migrationAndTechnologyAssessment: "Migration and Technology Assessment",
    technicalSupport: "Technical support",
    other: "Other",
    enterYourName: "Enter your name",
    enterYourEmailAddress: "Enter your email address",
    enterAValidEmailAddress: "Enter a valid email address",
    selectAnInquiryType: "Select an inquiry type",
    brieflyDescribeWhatYouNeed: "Briefly describe what you need",
    pleaseCheckTheForm: "Please check the form",
    completeTheRequiredFieldsAndCorrectAnyInvalidEntries: "Complete the required fields and correct any invalid entries.",
    theServerIsBusyTryAgainShortlySimulatedDemoFailure: "The server is busy. Try again shortly (simulated demo failure).",
    receivedThankYou: "Received, thank you!",
    ourTeamWillContactYouAt: "Our team will contact you at",
    shortly: "shortly.",
    contactUs: "Contact us",
    leaveYourDetailsAndWeLlReplyWithinOneBusinessDay: "Leave your details and we'll reply within one business day.",
    name: "Name",
    yourName: "Your name",
    companyEmail: "Company email",
    companyTeam: "Company / team",
    optional: "Optional",
    companyOrTeamName: "Company or team name",
    inquiryType: "Inquiry type",
    pleaseSelect: "Please select",
    leaveAMessage: "Leave a message",
    brieflyDescribeYourBusinessScenarioAndGoals: "Briefly describe your business scenario and goals...",
    submissionFailed: "Submission failed",
    tryAgainTheDemoWillSimulateASuccessfulSubmission: "Try again; the demo will simulate a successful submission.",
    submitting: "Submitting...",
    submitInquiry: "Submit inquiry",
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
  key: "demo-website-components-contact-form",
  content: t(content),
};

export default dictionary;
