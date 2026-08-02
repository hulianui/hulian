import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    standard: "标准版",
    fullCourseContentCoursewareDownload: "全部课程内容 + 课件下载",
    advanced: "进阶版",
    standardEditionInstructorQAClosingCertificate: "标准版 + 讲师答疑 + 结课证书",
    teamEdition: "团队版",
    advancedSeatsLearningForm: "进阶版 + 5 人席位 + 学习报表",
    enrollCourseTitle: "报名 · {0}",
    confirmCourse: "确认课程",
    instructor: "讲师 ·",
    section: "节",
    approx: "约",
    minutes: "分钟",
    chooseAPlan: "选择套餐",
    done: "完成",
    courses: "课程",
    packages: "套餐",
    pay: "应付",
    clickSubmitToSimulateCompletingThePaymentAndJoiningMy:
      "点「提交」即模拟完成支付并加入「我的学习」。",
    enrollmentSuccessful: "报名成功",
    addedToLearningPlan: "已加入「我的学习」· {0}",
  },
  en: {
    standard: "Standard",
    fullCourseContentCoursewareDownload: "Full course access + downloadable materials",
    advanced: "Pro",
    standardEditionInstructorQAClosingCertificate:
      "Standard plan + instructor Q&A + completion certificate",
    teamEdition: "Team",
    advancedSeatsLearningForm: "Pro plan + 5 seats + progress report",
    enrollCourseTitle: "Enroll · {0}",
    confirmCourse: "Confirm course",
    instructor: "Instructor ·",
    section: "lessons",
    approx: "Approx.",
    minutes: "min",
    chooseAPlan: "Choose a plan",
    done: "Done",
    courses: "Course",
    packages: "Plan",
    pay: "Payment",
    clickSubmitToSimulateCompletingThePaymentAndJoiningMy:
      'Select "Submit" to simulate payment and add the course to My Learning.',
    enrollmentSuccessful: "Enrollment successful",
    addedToLearningPlan: "Added to My Learning · {0}",
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
  key: "demo-learn-components-enroll-dialog",
  content: t(content),
};

export default dictionary;
