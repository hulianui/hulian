import { copy } from "./labels.content";
import type { ConversationChannel, CustomerLevel, TicketPriority, TicketStatus } from "./types";

export const channelLabel: Record<ConversationChannel, string> = {
  网页: copy("web"),
  App: copy("app"),
  微信: copy("wechat"),
  电话: copy("phone"),
};

export const ticketPriorityLabel: Record<TicketPriority, string> = {
  低: copy("low"),
  中: copy("medium"),
  高: copy("high"),
  紧急: copy("urgent"),
};

export const ticketStatusLabel: Record<TicketStatus, string> = {
  待处理: copy("pending"),
  处理中: copy("inProgress"),
  待回复: copy("waitingForReply"),
  已解决: copy("resolved"),
};

export const customerLevelLabel: Record<CustomerLevel, string> = {
  普通: copy("levelRegular"),
  银卡: copy("levelSilver"),
  金卡: copy("levelGold"),
  黑卡: copy("levelBlack"),
};

export const quickReplies = [
  copy("quickGreeting"),
  copy("quickChecking"),
  copy("quickTicket"),
  copy("quickMoreHelp"),
];
