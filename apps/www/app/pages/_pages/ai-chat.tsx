import { ChatPanelBlock } from "../../blocks/_blocks/chat-panel";

// AI 对话页 —— 完整对话面板（消息流含推理 / 工具调用 / 引用 + 底部提示输入），AI 助手类应用主页范式。
export function AiChatPage() {
  return (
    <div className="bg-bg px-6 py-10">
      <ChatPanelBlock />
    </div>
  );
}
