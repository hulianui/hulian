import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    deleteThisMessage: "确定删除这条留言？",
    messageDeleted: "留言已删除",
    deleteMessage: "删除留言",
    me: "我",
    author: "作者",
    nameAndMessageAreRequired: "昵称和内容不能为空",
    justNow: "刚刚",
    messagePublished: "留言已发布 🎉",
    guestbook: "留言板",
    shareAnIdeaSuggestionOrHelloIReplyToEveryMessageISee: "留下你的想法、建议或问候，我看到了都会回复。",
    visitorsHaveBeenHere: "位访客到过这里",
    writeAMessage: "写留言",
    nickname: "昵称",
    yourName: "你的名字",
    rating: "评分",
    message: "内容",
    markdownSupported: "支持 Markdown…",
    publishing: "发布中…",
    publishMessage: "发布留言",
    leaveAMessage: "留言",
    text: "（",
    text2: "）",
    failedToLoad: "加载失败",
    retry: "重试",
    noMessagesYetBeTheFirst: "还没有留言，来抢沙发",
  },
  en: {
    deleteThisMessage: "Delete this message?",
    messageDeleted: "Message deleted",
    deleteMessage: "Delete message",
    me: "me",
    author: "Author",
    nameAndMessageAreRequired: "Name and message are required",
    justNow: "just now",
    messagePublished: "Message published 🎉",
    guestbook: "Guestbook",
    shareAnIdeaSuggestionOrHelloIReplyToEveryMessageISee: "Share an idea, suggestion, or hello. I reply to every message I see.",
    visitorsHaveBeenHere: " visitors have been here",
    writeAMessage: "Write a message",
    nickname: "Nickname",
    yourName: "your name",
    rating: "Rating",
    message: "Message",
    markdownSupported: "Markdown supported...",
    publishing: "Publishing...",
    publishMessage: "Publish message",
    leaveAMessage: "Leave a message",
    text: " (",
    text2: ")",
    failedToLoad: "Failed to load",
    retry: "Retry",
    noMessagesYetBeTheFirst: "No messages yet. Be the first.",
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
  key: "demo-personal-components-guestbook",
  content: t(content),
};

export default dictionary;
