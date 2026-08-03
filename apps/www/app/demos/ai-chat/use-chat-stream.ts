"use client";
import { copy } from "./use-chat-stream.content";
import { useCallback, useReducer, useRef, useState } from "react";
import { selectScript, scriptToEvents, chatEventDelayMs, type ChatEvent } from "@hulianui/mocks";
import { DOCS_LOCALE } from "../../../lib/docs-locale";
import { chatReducer, type ChatMsg } from "./chat-types";

let seq = 0;
const nextId = () => `m${++seq}`;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type ChatScript = ReturnType<typeof selectScript>;

export function selectEnglishScriptId(message: string): ChatScript["id"] {
  const normalized = message.toLowerCase();
  if (/weather|temperature|forecast/.test(normalized)) return "weather";
  if (/quick\s*sort|quicksort|code|function|algorithm/.test(normalized)) return "code";
  if (/closure|lexical scope/.test(normalized)) return "explain";
  return "fallback";
}

function englishScript(id: ChatScript["id"]): ChatScript {
  switch (id) {
    case "weather":
      return {
        id,
        thinking: copy("weatherThinking"),
        tool: {
          name: "get_weather",
          input: copy("weatherInput"),
          output: copy("weatherOutput"),
        },
        answer: copy("weatherAnswer"),
        citations: [],
      };
    case "code":
      return { id, thinking: copy("codeThinking"), answer: copy("codeAnswer"), citations: [] };
    case "explain":
      return {
        id,
        thinking: copy("closureThinking"),
        answer: copy("closureAnswer"),
        citations: [
          {
            index: 1,
            title: "Closures - MDN Web Docs",
            source: "developer.mozilla.org",
            href: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures",
          },
        ],
      };
    case "fallback":
      return {
        id,
        thinking: copy("fallbackThinking"),
        answer: copy("fallbackAnswer"),
        citations: [],
      };
  }
}

export function useChatStream() {
  const [messages, dispatch] = useReducer(chatReducer, [] as ChatMsg[]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ kind: "reset" });
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (loading) return;
      const assistantId = nextId();
      dispatch({ kind: "user_send", id: nextId(), text });
      dispatch({ kind: "assistant_start", id: assistantId });
      setLoading(true);
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        // 静态导出(prod)无后端 + 不启 MSW → 客户端内存生成同款事件流
        // （与 MSW handler 同口径：selectScript/scriptToEvents/chatEventDelayMs 单一真源）。
        // dev 仍走 fetch 经 MSW Service Worker 拦截，保留「真流式」语义。同 async-users 的 prod 回退模式。
        if (process.env.NODE_ENV === "production" || DOCS_LOCALE === "en") {
          const script =
            DOCS_LOCALE === "en" ? englishScript(selectEnglishScriptId(text)) : selectScript(text);
          for (const event of scriptToEvents(script)) {
            if (ac.signal.aborted) throw new DOMException("Aborted", "AbortError");
            dispatch({ kind: "event", id: assistantId, event });
            await sleep(chatEventDelayMs(event));
          }
          return;
        }
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
          signal: ac.signal,
        });
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          // 按 SSE 帧（\n\n）切分，逐帧 dispatch
          let idx;
          while ((idx = buf.indexOf("\n\n")) !== -1) {
            const frame = buf.slice(0, idx).trim();
            buf = buf.slice(idx + 2);
            if (frame.startsWith("data:")) {
              const event = JSON.parse(frame.slice(5).trim()) as ChatEvent;
              dispatch({ kind: "event", id: assistantId, event });
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          dispatch({ kind: "aborted", id: assistantId });
        } else {
          throw err;
        }
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading],
  );

  return { messages, loading, send, stop, reset };
}
