"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelMeta } from "../../_data/types";

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** 该轮的 token 计量（assistant 出 completion，user 出 prompt）。 */
  promptTokens?: number;
  completionTokens?: number;
}

/** 极简字符级 token 估算：中文按 ~1.6 字/token、英文按 ~4 字符/token，混排取折中。 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const cjk = (text.match(/[一-鿿　-〿＀-￯]/g) ?? []).length;
  const rest = text.length - cjk;
  return Math.max(1, Math.ceil(cjk / 1.6 + rest / 4));
}

// 预置的 mock 回复池（按问题轮换，纯本地，不接真 API）。
const REPLIES = [
  "好的，我来帮你梳理一下。瀚枢 HanHub 作为多厂商 LLM 网关，核心价值是「一个 base_url + 一把密钥」即可路由十余家上游，并自动做加权负载均衡与被动失败转移。\n\n你可以在「健康探测」页查看各上游渠道的实时延迟与成功率，在「用量日志」逐请求追溯计费明细。",
  "这是一个很好的问题。简单来说：网关在收到请求后，会按渠道权重与优先级选择健康的上游，调用成功则按 input/output token 分别计价并乘以分组倍率，失败则触发熔断转移到备用渠道。\n\n整个链路通常在 1 秒内完成，详细耗时拆解可在日志详情的「调用链路」时间线里看到。",
  "明白。基于当前参数配置，我建议你优先选择性价比更高的模型来处理批量任务，把旗舰模型留给需要复杂推理的场景。这样既能保证质量，又能把每百万 token 的成本压下来。\n\n右侧计费面板会实时累计本次会话的 prompt / completion 用量与预估花费。",
  "没问题。我已经理解你的需求。按 OpenAI 兼容协议，你只需把 base_url 指向 https://api.hanhub.cn/v1，换上瀚枢密钥，原有的 OpenAI SDK 代码无需改动即可切换到任意上游模型。\n\n点击上方「查看为代码」可一键生成 curl / Python / Node 三种语言的接入片段。",
];

export function useRun(model: ModelMeta | undefined, systemPrompt: string) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [streaming, setStreaming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const replyIdx = useRef(0);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const send = useCallback(
    (text: string) => {
      if (streaming || !text.trim()) return;
      const userTurn: ChatTurn = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
        promptTokens: estimateTokens(systemPrompt) + estimateTokens(text),
      };
      const full = REPLIES[replyIdx.current % REPLIES.length];
      replyIdx.current += 1;
      const assistantId = `a-${Date.now()}`;
      setTurns((t) => [...t, userTurn, { id: assistantId, role: "assistant", content: "", completionTokens: 0 }]);
      setStreaming(true);

      let i = 0;
      timerRef.current = setInterval(() => {
        i += 2;
        const chunk = full.slice(0, i);
        setTurns((t) =>
          t.map((turn) =>
            turn.id === assistantId
              ? { ...turn, content: chunk, completionTokens: estimateTokens(chunk) }
              : turn,
          ),
        );
        if (i >= full.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setStreaming(false);
        }
      }, 24);
    },
    [streaming, systemPrompt],
  );

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setStreaming(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setTurns([]);
    replyIdx.current = 0;
  }, [stop]);

  const promptTokens = turns.reduce((s, t) => s + (t.promptTokens ?? 0), 0);
  const completionTokens = turns.reduce((s, t) => s + (t.completionTokens ?? 0), 0);

  return { turns, streaming, send, stop, reset, promptTokens, completionTokens };
}
