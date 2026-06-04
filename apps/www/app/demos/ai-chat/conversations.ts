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
export const CONVERSATION_GROUPS = ["今天", "昨天", "7 天内"];

export const CONVERSATIONS: ConversationStub[] = [
  { id: "c1", title: "今天的天气", group: "今天", active: true },
  { id: "c2", title: "快速排序实现", group: "今天" },
  { id: "c3", title: "闭包是什么", group: "昨天" },
  { id: "c4", title: "周报草稿", group: "7 天内" },
];
