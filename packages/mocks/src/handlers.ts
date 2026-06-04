import { http, HttpResponse, delay } from "msw";
import { makeUsers } from "./factories";
import { selectScript, scriptToEvents } from "./chat-script";

const ALL = makeUsers(60);
const PAGE_SIZE = 8;

export const handlers = [
  http.get("/api/users", async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const start = (page - 1) * PAGE_SIZE;
    await delay(500); // 模拟网络延迟，让 loading 态可见
    return HttpResponse.json({
      total: ALL.length,
      pageSize: PAGE_SIZE,
      page,
      items: ALL.slice(start, start + PAGE_SIZE),
    });
  }),

  // AI 对话 demo：按用户消息选预设脚本，编码成 SSE 事件流逐帧吐出，模拟真流式。
  http.post("/api/chat", async ({ request }) => {
    const body = (await request.json()) as { message?: string };
    const events = scriptToEvents(selectScript(body.message ?? ""));
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (const ev of events) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
          // 思考/正文吐字快，工具调用与收尾留出节奏感
          const ms =
            ev.type === "tool"
              ? 600
              : ev.type === "tool_result"
                ? 500
                : ev.type === "thinking_delta"
                  ? 18
                  : ev.type === "text_delta"
                    ? 22
                    : 120;
          await delay(ms);
        }
        controller.close();
      },
    });
    return new HttpResponse(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }),
];
