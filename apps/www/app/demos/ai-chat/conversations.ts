// 左侧会话 rail 的静态假数据（demo 不做多会话持久化/切换重放）。
export interface ConversationStub {
  id: string;
  title: string;
  preview: string;
  active?: boolean;
}
export const CONVERSATIONS: ConversationStub[] = [
  { id: "c1", title: "今天的天气", preview: "北京今天多云转晴…", active: true },
  { id: "c2", title: "快速排序实现", preview: "function quickSort…" },
  { id: "c3", title: "闭包是什么", preview: "函数与其词法作用域的组合…" },
  { id: "c4", title: "周报草稿", preview: "本周完成了 demo 区…" },
];
