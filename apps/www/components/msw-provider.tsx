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
    // worker 脚本在 public/ 下，而 public/ 挂在 basePath 之下（中文站是 /zh）。
    // MSW 默认去请求根路径的 /mockServiceWorker.js —— 那个地址只有在 basePath 为空时才存在，
    // 双语布局落地之后中文 dev 站一直是 404。
    const basePath = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "";
    import("@hulianui/mocks/browser")
      .then(({ worker }) =>
        worker.start({
          onUnhandledRequest: "bypass",
          quiet: true,
          serviceWorker: {
            url: `${basePath}/mockServiceWorker.js`,
            options: { scope: `${basePath}/` },
          },
        }),
      )
      .catch((error) => {
        // 起不来就降级成「没有 mock」，而不是「没有站」。
        // 之前这里没有 catch：worker.start() 一 reject，下面那句 setReady 永远不执行，
        // 于是 `if (!ready) return null` 把**整站**变成空白页 —— 一个 mock 起不来的代价
        // 不该是整个文档站看不见，何况唯一的线索还只是控制台里一条 MSW 的报错。
        console.warn("[docs] MSW 未启动，页面将直接透传网络请求：", error);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
