"use client";
import { copy } from "./copilot-panel.content";
import { Bot, Check, Sparkles, Wrench } from "lucide-react";
import {
  AgentPlan,
  Button,
  PromptInput,
  StreamingText,
  ThinkingBlock,
  ToolCall,
  type AgentTask,
} from "@hulianui/ui";
import type { AiSuggestion } from "../../_data/types";

const PLAN: AgentTask[] = [
  { title: copy("welcomeViewersPreviewOffers"), status: "done" },
  { title: copy("presentProduct1SherpaJacket"), status: "running", detail: copy("watchTime412Conversion68") },
  { title: copy("sendA70OffFlashSaleCoupon"), status: "pending" },
  { title: copy("runAGiveawayThenPresentProduct3"), status: "pending" },
];

/** 弹幕情绪占比（由当前在线/互动派生的示意值）。 */
function sentimentLine(comments: number): string {
  const pos = 60 + (comments % 18);
  const neu = Math.floor((100 - pos) * 0.7);
  return `${copy("positive")}${pos}${copy("neutral")}${neu}${copy("questions")}${100 - pos - neu}${copy("questionsFocusOnSizingAndDelivery")}`;
}

export function CopilotPanel({
  suggestions,
  comments,
  onAdopt,
  onAsk,
}: {
  suggestions: AiSuggestion[];
  comments: number;
  onAdopt: (id: string) => void;
  onAsk: (q: string) => void;
}) {
  const recent = [...suggestions].reverse();
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[var(--radius)] border border-border bg-surface">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3.5 py-3">
        <span className="grid size-7 place-items-center rounded-full bg-primary/12 text-primary">
          <Bot className="size-4" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-foreground">{copy("aiLiveCopilot")}</div>
          <div className="text-[11px] text-muted-foreground">{copy("monitorChatAnswerQuestionsGetPromptsRunTheRoom")}</div>
        </div>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" />

          {copy("active")}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3.5">
        <AgentPlan title={copy("streamStrategy")} tasks={PLAN} />

        <ThinkingBlock title={copy("analyzeChatSentimentInRealTime")} duration={copy("duration")} defaultOpen>
          <StreamingText text={sentimentLine(comments)} streaming />
        </ThinkingBlock>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />  {copy("copilotSuggestions")}
          </div>
          {recent.length === 0 && (
            <div className="rounded-[var(--radius)] border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">

              {copy("theCopilotIsListeningToChatSuggestionsWillAppearShortly")}
            </div>
          )}
          {recent.map((s) => (
            <SuggestionCard key={s.id} s={s} onAdopt={onAdopt} />
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <PromptInput placeholder={copy("askTheCopilotForExampleSuggestAClosingPitch")} onSubmit={(v) => v.trim() && onAsk(v.trim())} />
      </div>
    </div>
  );
}

function SuggestionCard({ s, onAdopt }: { s: AiSuggestion; onAdopt: (id: string) => void }) {
  if (s.kind === "action") {
    return (
      <ToolCall
        name={s.tool}
        icon={<Wrench className="size-3.5" />}
        status={s.adopted ? "success" : "pending"}
        output={s.adopted ? s.text : undefined}
        defaultOpen={false}
      >
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-muted-foreground">{s.text}</span>
          {!s.adopted && (
            <Button size="sm" onClick={() => onAdopt(s.id)}>

              {copy("run")}
            </Button>
          )}
        </div>
      </ToolCall>
    );
  }
  if (s.kind === "reply") {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-bg p-2.5">
        {s.context && <div className="mb-1 text-[11px] text-muted-foreground">{copy("viewerAsked")}{s.context}</div>}
        <div className="text-xs leading-relaxed text-foreground">
          <StreamingText text={s.text} streaming={!s.adopted} />
        </div>
        <div className="mt-2 flex items-center justify-end gap-1.5">
          {s.adopted ? (
            <span className="flex items-center gap-1 text-[11px] text-success">
              <Check className="size-3.5" />  {copy("replyPostedToChat")}
            </span>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onAdopt(s.id)}>

              {copy("useAndReply")}
            </Button>
          )}
        </div>
      </div>
    );
  }
  // tip
  return (
    <div className="rounded-[var(--radius)] border border-chart-2/30 bg-chart-2/8 px-2.5 py-2 text-xs leading-relaxed text-foreground">
      💡 {s.text}
    </div>
  );
}
