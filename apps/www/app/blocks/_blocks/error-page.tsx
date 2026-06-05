// 错误页区块 —— 404 页面级反馈。Result 组件呈现：大号 404 + 标题 + 说明 + 双按钮。
// 点缀 DotPattern 特效背景（径向遮罩淡出，不抢主体内容）。
// 复制后改：Result 的 status / title / subTitle、按钮 onClick、巨型数字文案。
// status 可换 "403"(无权限) / "500"(服务异常)，Result 会自动切换语义图标色。

import { Button, DotPattern, Result } from "@hulianui/ui";
import { ArrowLeft, LifeBuoy } from "lucide-react";

export function ErrorPageBlock() {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
      {/* 特效背景：点阵 + 径向遮罩淡出 */}
      <DotPattern
        className="pointer-events-none absolute inset-0 size-full text-border [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"
        aria-hidden
      />

      <div className="relative flex flex-col items-center px-6 py-20 sm:py-28">
        {/* 巨型 404 占位数字，token 渐变描金 */}
        <div
          className="select-none text-[7rem] font-black leading-none tracking-tight sm:text-[10rem]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--color-primary), var(--color-chart-2))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
          aria-hidden
        >
          404
        </div>

        <Result
          status="404"
          icon={null}
          title="页面走丢了"
          subTitle="你访问的页面不存在或已被迁移。检查一下网址，或回到首页继续探索瀚云控制台。"
        >
          <Button>
            <ArrowLeft className="size-4" />
            返回首页
          </Button>
          <Button variant="outline">
            <LifeBuoy className="size-4" />
            联系支持
          </Button>
        </Result>
      </div>
    </div>
  );
}
