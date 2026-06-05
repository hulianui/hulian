import { Skeleton } from "@hulianui/ui";

/**
 * 组件页内容区的导航骨架。
 * App Router 默认会停留在上一个组件直到目标路由就绪 —— 加 loading.tsx 后，
 * 点左侧列表切组件时右侧立刻显示骨架（侧栏布局 layout.tsx 持久不动），消除「干等」。
 * 结构镜像 ComponentDoc：标题 + 预览大块 + 全状态块 + 右侧本页 TOC 占位。
 */
export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl gap-10">
      <div className="min-w-0 flex-1 space-y-8">
        {/* 标题 */}
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        {/* 预览 */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton shape="rect" className="h-64 w-full" />
        </div>
        {/* 全状态 */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton shape="rect" className="h-40 w-full" />
        </div>
      </div>
      {/* 右侧本页 TOC 占位 */}
      <div className="hidden w-44 shrink-0 lg:block">
        <div className="sticky top-2 space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
