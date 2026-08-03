"use client";
import { useEffect, useState } from "react";
import { Button } from "@hulianui/ui";
import { makeUsers, type DemoUser } from "@hulianui/mocks";
import { DOCS_LOCALE } from "../../lib/docs-locale";

interface UsersResponse {
  items: DemoUser[];
  total: number;
  pageSize: number;
  page: number;
}

const PAGE_SIZE = 8;
const roleLabels = {
  管理员: "Administrator",
  编辑: "Editor",
  访客: "Guest",
} as const;

function roleLabel(role: string) {
  return DOCS_LOCALE === "en" ? roleLabels[role as keyof typeof roleLabels] ?? role : role;
}

// 静态导出(prod)无后端 + 不启 MSW → 直接用 @hulianui/mocks 客户端分页（与 handler 同口径：makeUsers(60)/PAGE_SIZE=8）。
// dev 仍走 fetch 经 MSW Service Worker 拦截，保留「MSW 演示」语义。
function loadPage(page: number): Promise<UsersResponse> {
  if (process.env.NODE_ENV === "production") {
    const all = makeUsers(60);
    const start = (page - 1) * PAGE_SIZE;
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            total: all.length,
            pageSize: PAGE_SIZE,
            page,
            items: all.slice(start, start + PAGE_SIZE),
          }),
        500,
      ),
    );
  }
  return fetch(`/api/users?page=${page}`).then((r) => r.json() as Promise<UsersResponse>);
}

// mock③ 异步加载 + 分页：dev 经 MSW Service Worker 拦截、prod 静态导出客户端分页，皆无需真后端
export function AsyncUsers() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadPage(page).then((d) => {
      if (active) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [page]);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="space-y-3">
      <ul className="min-h-[14rem] space-y-1 text-sm">
        {data?.items.map((u) => (
          <li key={u.id} className="rounded bg-surface px-3 py-1.5">
            {u.name} · <span className="text-muted">{roleLabel(u.role)}</span> ·{" "}
            <span className="text-muted">{u.email}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          {DOCS_LOCALE === "en" ? "Previous" : "上一页"}
        </Button>
        <span className="text-sm text-muted">
          {DOCS_LOCALE === "en"
            ? `Page ${page} of ${totalPages || "…"}`
            : `第 ${page} 页 / 共 ${totalPages || "…"} 页`}
        </span>
        <Button
          size="sm"
          variant="outline"
          loading={loading}
          disabled={!data || page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          {DOCS_LOCALE === "en" ? "Next" : "下一页"}
        </Button>
      </div>
    </div>
  );
}
