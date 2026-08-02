import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    instructor: "讲师",
    assistantTeacherXiaoyan: "助教-小研",
    courseAssistant: "课程助教",
    xiaXiaoman: "夏小满",
    classmates: "同学",
    chenQi: "陈起",
    saySomethingBeforeYouPublish: "说点什么再发布吧",
    me: "我",
    learners: "学员",
    justNow: "刚刚",
    discussionPublished: "已发布讨论",
    theReplyFunctionIsThePlaceholderOfTheDemo: "回复功能为演示占位",
    reply: "回复",
    joinTheDiscussionTypeMentionAnInstructorOrClassmate: "参与讨论，输入 @ 提及讲师或同学…",
    postDiscussion: "发布讨论",
    publish: "发布",
    noDiscussionsYet: "还没有讨论",
    beTheFirstToAskAQuestion: "来做第一个提问的人吧",
  },
  en: {
    instructor: "Instructor",
    assistantTeacherXiaoyan: "Teaching assistant · Xiao Yan",
    courseAssistant: "Course assistant",
    xiaXiaoman: "Xia Xiaoman",
    classmates: "Classmate",
    chenQi: "Chen Qi",
    saySomethingBeforeYouPublish: "Say something before you publish",
    me: "Me",
    learners: "Learners",
    justNow: "Just now",
    discussionPublished: "Discussion published",
    theReplyFunctionIsThePlaceholderOfTheDemo: "Replies are not available in this demo.",
    reply: "Reply",
    joinTheDiscussionTypeMentionAnInstructorOrClassmate:
      "Join the discussion. Type @ to mention an instructor or classmate...",
    postDiscussion: "New discussion",
    publish: "Publish",
    noDiscussionsYet: "No discussions yet",
    beTheFirstToAskAQuestion: "Be the first to ask a question",
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
  key: "demo-learn-components-discussion-tab",
  content: t(content),
};

export default dictionary;
