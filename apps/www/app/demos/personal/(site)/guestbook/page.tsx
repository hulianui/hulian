import { copy } from "./page.content";
// 留言板页：server 壳 + client 主体（GuestbookClient）。
// 交互链：Skeleton 加载 / Alert+重试失败态 / 写留言 Markdown 表单 / Popconfirm 删除二次确认 / toast 反馈 / Empty 空态。

import { GuestbookClient } from "../../_components/guestbook";

export const metadata = {
  title: copy("guestbookLinYu"),
  description: copy("leaveLinYuAnIdeaSuggestionOrHello"),
};

export default function GuestbookPage() {
  return <GuestbookClient />;
}
