import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    receivedIWillReplySoon: "已收到，我会尽快回复",
    iUsuallyReplyWithin24HoursYouAreAlsoWelcomeToEmailMeDirectly: "通常 24 小时内回信。也欢迎直接发邮件给我。",
    letSTalk: "聊聊",
    haveAnIdeaLetSBuildSomethingTogether: "有想法？一起做点东西",
    whetherYouWantToCollaborateAskForAdviceOrSimplyMeetAFellowMakerLeaveANoteOrBookAVirtualCoffee: "不管是合作、咨询，还是单纯想认识同好——给我留个言，或者约一杯线上咖啡。",
    preferDirectContact: "更喜欢直接联系？",
    bookACoffee: "约杯咖啡",
    yourEmail: "你的邮箱",
    iWillUseItToReply: "我会用它回信给你",
    wantToBookAOneOnOneConversation: "想约个 1:1 的时间？",
    optionalChooseADayForAVirtualCoffee: "可选——选一天，我们约线上咖啡",
    leaveAMessage: "留言",
    whatWouldYouLikeToDiscussCollaborationConsultingOrJustSayingHello: "想聊什么？合作、咨询、或只是打个招呼",
    hiLinYuIWouldLikeToTalkAbout: "嗨，林屿，我想和你聊聊……",
    sendMessage: "发送留言",
    openThePublicGuestbook: "去公开留言板",
  },
  en: {
    receivedIWillReplySoon: "Received. I will reply soon.",
    iUsuallyReplyWithin24HoursYouAreAlsoWelcomeToEmailMeDirectly: "I usually reply within 24 hours. You are also welcome to email me directly.",
    letSTalk: "Let's talk",
    haveAnIdeaLetSBuildSomethingTogether: "Have an idea? Let's build something together",
    whetherYouWantToCollaborateAskForAdviceOrSimplyMeetAFellowMakerLeaveANoteOrBookAVirtualCoffee: "Whether you want to collaborate, ask for advice, or simply meet a fellow maker, leave a note or book a virtual coffee.",
    preferDirectContact: "Prefer direct contact?",
    bookACoffee: "Book a coffee",
    yourEmail: "Your email",
    iWillUseItToReply: "I will use it to reply",
    wantToBookAOneOnOneConversation: "Want to book a one-on-one conversation?",
    optionalChooseADayForAVirtualCoffee: "Optional: choose a day for a virtual coffee",
    leaveAMessage: "Leave a message",
    whatWouldYouLikeToDiscussCollaborationConsultingOrJustSayingHello: "What would you like to discuss: collaboration, consulting, or just saying hello?",
    hiLinYuIWouldLikeToTalkAbout: "Hi Lin Yu, I would like to talk about...",
    sendMessage: "Send message",
    openThePublicGuestbook: "Open the public guestbook",
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
  key: "demo-personal-components-sections-contact",
  content: t(content),
};

export default dictionary;
