"use client";
import { useEffect, useState } from "react";
import { Button } from "@hulian/ui";
import type { DemoUser } from "@hulian/mocks";

interface UsersResponse {
  items: DemoUser[];
  total: number;
  pageSize: number;
  page: number;
}

// mock③ MSW 异步加载 + 分页：经 Service Worker 拦截，无需真后端
export function AsyncUsers() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/users?page=${page}`)
      .then((r) => r.json())
      .then((d: UsersResponse) => {
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
            {u.name} · <span className="text-muted">{u.role}</span> ·{" "}
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
          上一页
        </Button>
        <span className="text-sm text-muted">
          第 {page} 页 / 共 {totalPages || "…"} 页
        </span>
        <Button
          size="sm"
          variant="outline"
          loading={loading}
          disabled={!data || page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
