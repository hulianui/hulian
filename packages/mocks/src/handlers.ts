import { http, HttpResponse, delay } from "msw";
import { makeUsers } from "./factories";

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
];
