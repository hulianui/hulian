import type { Member } from "./types";

// avatar 一律省略，靠组件 fallback 首字母（避免远程头像资源被门禁拦截）。
export const MEMBERS: Member[] = [
  { name: "陆衡", role: "管理员", email: "luheng@hanreview.dev" },
  { name: "沈知微", role: "审查者", email: "shenzhiwei@hanreview.dev" },
  { name: "周慕白", role: "审查者", email: "zhoumubai@hanreview.dev" },
  { name: "林夕", role: "审查者", email: "linxi@hanreview.dev" },
  { name: "顾远舟", role: "只读", email: "guyuanzhou@hanreview.dev" },
  { name: "AI 审查官", role: "审查者", email: "agent@hanreview.dev" },
];
