import { AgentCardBlock } from "../../blocks/_blocks/agent-card";
import { ChatPanelBlock } from "../../blocks/_blocks/chat-panel";

// AI 对话页 —— 左侧智能体 / 模型列表边栏 + 右侧完整对话面板（消息流含推理 / 工具调用 / 引用 + 自带提示输入），AI 助手类应用主页范式。
// ChatPanelBlock 已自带底部 PromptInput 输入框，故右栏无需再补 PromptInputBlock，避免双输入框。
export function AiChatPage() {
  return (
    <div className="grid gap-6 bg-bg px-6 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <AgentCardBlock />
      </aside>
      <div className="min-w-0 space-y-4">
        <ChatPanelBlock />
      </div>
    </div>
  );
}
