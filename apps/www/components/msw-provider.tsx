"use client";
import { useEffect, useState, type ReactNode } from "react";

/**
 * App Router 下的 MSW 启动器。
 * 坑：worker 只能在客户端启动，且必须 await worker.start() 完成后再渲染
 * 依赖数据的子树，否则首个请求会漏过拦截。生产环境不启 MSW，直接透传。
 */
export function MswProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(process.env.NODE_ENV === "production");

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    let active = true;
    import("@hulianui/mocks/browser").then(async ({ worker }) => {
      await worker.start({ onUnhandledRequest: "bypass", quiet: true });
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
