import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    allCourses: "全部课程",
    searchCoursesK: "搜索课程（⌘K）",
    searchCourses: "搜索课程",
    searchCoursesAlternate: "搜索课程…",
    noRelatedCoursesFound: "没有找到相关课程",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    thisPlatformIsAHulianuiUiDemoAndTheCourse:
      "—— 本平台为 @hulianui/ui 演示，课程与讲师均为虚构。",
    learning: "学习",
    courseCatalog: "课程目录",
    learningPath: "学习路径",
    certificate: "证书",
    questionBank: "题库",
    instructor: "讲师",
    becomeAnInstructor: "成为讲师",
    instructorCenter: "讲师中心",
    courseStandards: "课程标准",
    earningsRules: "收益规则",
    aboutHanxue: "关于瀚学",
    aboutUs: "关于我们",
    joinUs: "加入我们",
    contactSupport: "联系客服",
    privacyPolicy: "隐私政策",
    demoSite: "· 演示站点",
    backToDemoGallery: "返回 Demo 画廊",
  },
  en: {
    allCourses: "All courses",
    searchCoursesK: "Search courses (⌘ K)",
    searchCourses: "Search courses",
    searchCoursesAlternate: "Search courses...",
    noRelatedCoursesFound: "No related courses found",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    thisPlatformIsAHulianuiUiDemoAndTheCourse:
      "This is a @hulianui/ui demo. Courses and instructors are fictional.",
    learning: "Learning",
    courseCatalog: "Course catalog",
    learningPath: "Learning path",
    certificate: "Certificate",
    questionBank: "Question bank",
    instructor: "Instructor",
    becomeAnInstructor: "Become an instructor",
    instructorCenter: "Instructor center",
    courseStandards: "Course standards",
    earningsRules: "Earnings rules",
    aboutHanxue: "About HanLearn",
    aboutUs: "About us",
    joinUs: "Join us",
    contactSupport: "Contact support",
    privacyPolicy: "Privacy policy",
    demoSite: "· Demo site",
    backToDemoGallery: "Back to demo gallery",
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
  key: "demo-learn-components-learn-shell",
  content: t(content),
};

export default dictionary;
