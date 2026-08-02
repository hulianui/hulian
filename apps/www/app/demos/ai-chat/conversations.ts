import { copy } from "./conversations.content";
// 左侧会话 rail 的静态假数据（demo 不做多会话持久化/切换重放）。
// 仿 DeepSeek/ChatGPT：按时间分组、纯标题清单（无头像/无预览副文案）。
export interface ConversationStub {
  id: string;
  title: string;
  /** 时间分组段（今天 / 昨天 / 7 天内 …）。 */
  group: string;
  active?: boolean;
}

/** 分组渲染顺序（rail 按此序出现，空组自动跳过）。 */
export const CONVERSATION_GROUPS = ["今天", "昨天", "7 天内"] as const;
export const CONVERSATION_GROUP_LABELS: Record<(typeof CONVERSATION_GROUPS)[number], string> = {
  今天: copy("today"),
  昨天: copy("yesterday"),
  "7 天内": copy("withinSevenDays"),
};

export const CONVERSATIONS: ConversationStub[] = [
  { id: "c1", title: copy("weatherToday"), group: "今天", active: true },
  { id: "c2", title: copy("quickSortImplementation"), group: "今天" },
  { id: "c3", title: copy("whatIsAClosure"), group: "昨天" },
  { id: "c4", title: copy("weeklyDraft"), group: "7 天内" },
];
