import { AgentCardBlock } from "../../blocks/_blocks/agent-card.en";
import { ChatPanelBlock } from "../../blocks/_blocks/chat-panel.en";
export function AiChatPage() {
    return (<div className="grid gap-6 bg-bg px-6 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <AgentCardBlock />
      </aside>
      <div className="min-w-0 space-y-4">
        <ChatPanelBlock />
      </div>
    </div>);
}
