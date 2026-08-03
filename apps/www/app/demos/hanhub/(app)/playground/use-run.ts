"use client";
import { copy } from "./use-run.content";

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
  copy("okayLetMeSortItOutFor"),
  copy("thisIsAVeryGoodQuestionTo"),
  copy("gotItBasedOnTheCurrentParameter"),
  copy("noProblemIUnderstandYourNeedsAccording"),
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
