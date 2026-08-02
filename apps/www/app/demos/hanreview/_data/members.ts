import type { Member } from "./types";
import { copy } from "./members.content";

// avatar 一律省略，靠组件 fallback 首字母（避免远程头像资源被门禁拦截）。
export const MEMBERS: Member[] = [
  { name: copy("luHeng"), role: "管理员", email: "luheng@hanreview.dev" },
  { name: copy("shenZhiwei"), role: "审查者", email: "shenzhiwei@hanreview.dev" },
  { name: copy("zhouMubai"), role: "审查者", email: "zhoumubai@hanreview.dev" },
  { name: copy("linXi"), role: "审查者", email: "linxi@hanreview.dev" },
  { name: copy("guYuanzhou"), role: "只读", email: "guyuanzhou@hanreview.dev" },
  { name: copy("aiReviewer"), role: "审查者", email: "agent@hanreview.dev" },
];

export const MEMBER_ROLE_LABEL: Record<Member["role"], string> = {
  管理员: copy("administrator"),
  审查者: copy("reviewer"),
  只读: copy("viewOnly"),
};
