import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    unlockThisSectionAfterSigningUp: "报名后解锁本节",
    tryTheSectionMarkedTryItForFreeFirst: "可先免费试看带「试看」标记的小节",
    tryItOut: "试看",
    backToCourseCatalog: "返回课程目录",
    completedThisSection: "已完成本节",
    thisSectionHasEnded: "本节已结束",
    nextSection: "下一节 ·",
    playNextSection: "播放下一节",
    alreadyInTheLastSection: "🎉 已是最后一节",
    markedIncomplete: "已标记为未完成",
    markedAsDone: "已标记为完成",
    completed: "已完成",
    markComplete: "标记完成",
    favoriteCourses: "收藏课程",
    addedToWishlist: "已加入收藏",
    shareCourse: "分享课程",
    shareLinkCopied: "分享链接已复制",
    introduction: "简介",
    notes: "笔记",
    discussion: "讨论",
    takeCourseNotesOnceYouVeSignedUp: "报名后即可记录课程笔记",
    lessonDurationJoiner: "节 · 约",
    minutes: "分钟",
    learningProgress: "学习进度",
    signUpToLearn: "报名学习",
    courseSection: "课程章节",
  },
  en: {
    unlockThisSectionAfterSigningUp: "Enroll to unlock this lesson",
    tryTheSectionMarkedTryItForFreeFirst: 'Try the section marked "Try it" for free first',
    tryItOut: "Try it out",
    backToCourseCatalog: "Back to course catalog",
    completedThisSection: "Lesson complete",
    thisSectionHasEnded: "You have reached the end of this lesson.",
    nextSection: "Next lesson ·",
    playNextSection: "Play next lesson",
    alreadyInTheLastSection: "🎉 You have reached the final lesson",
    markedIncomplete: "Marked incomplete",
    markedAsDone: "Marked complete",
    completed: "Completed",
    markComplete: "Mark complete",
    favoriteCourses: "Save course",
    addedToWishlist: "Added to wishlist",
    shareCourse: "Share course",
    shareLinkCopied: "Share link copied",
    introduction: "Introduction",
    notes: "Notes",
    discussion: "Discussion",
    takeCourseNotesOnceYouVeSignedUp: "Take course notes once you've signed up",
    lessonDurationJoiner: "lessons · about",
    minutes: "min",
    learningProgress: "Learning progress",
    signUpToLearn: "Enroll to learn",
    courseSection: "Course lesson",
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
  key: "demo-learn-components-course-player-client",
  content: t(content),
};

export default dictionary;
