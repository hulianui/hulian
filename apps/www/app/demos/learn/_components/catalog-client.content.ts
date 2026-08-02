import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    all: "全部",
    myLearning: "我的学习",
    continueWithYourEnrolled: "继续你已报名的",
    courses: "门课程",
    overallCompletion: "总体完成度",
    courseCatalog: "课程目录",
    and: "和",
    learnersTogetherToTurnLearningIntoVisibleProgress: "名学员一起，把学习变成可见的进步",
    filterByCategory: "分类筛选",
    mostPopular: "最热门",
    highlyRated: "评分高",
    latest: "最新",
    sort: "排序",
    courseFailedToLoad: "课程加载失败",
    retry: "重试",
    youHavenTEnrolledInAnyCoursesYet: "还没有报名任何课程",
    noEligibleCourses: "没有符合条件的课程",
    goToTheCourseCatalogToPickAnInterestingStart: "去课程目录挑一门感兴趣的开始吧",
    takeALookAtAnotherCategoryOrSort: "换个分类或排序看看",
    shoppingClasses: "逛逛课程",
    seeAllCourses: "查看全部课程",
  },
  en: {
    all: "All",
    myLearning: "My Learning",
    continueWithYourEnrolled: "Continue your enrolled courses",
    courses: "Courses",
    overallCompletion: "Overall progress",
    courseCatalog: "Course catalog",
    and: "and",
    learnersTogetherToTurnLearningIntoVisibleProgress:
      "learners are making visible progress together",
    filterByCategory: "Filter by category",
    mostPopular: "Most popular",
    highlyRated: "Highly rated",
    latest: "Latest",
    sort: "Sort",
    courseFailedToLoad: "Course failed to load",
    retry: "Retry",
    youHavenTEnrolledInAnyCoursesYet: "You haven't enrolled in any courses yet",
    noEligibleCourses: "No matching courses",
    goToTheCourseCatalogToPickAnInterestingStart:
      "Browse the course catalog and choose a course to begin.",
    takeALookAtAnotherCategoryOrSort: "Try another category or sort order.",
    shoppingClasses: "Browse courses",
    seeAllCourses: "See all courses",
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
  key: "demo-learn-components-catalog-client",
  content: t(content),
};

export default dictionary;
