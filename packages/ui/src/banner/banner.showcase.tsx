"use client";
import { useState } from "react";
import { Megaphone, Sparkles, TriangleAlert, Info, Rocket } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Banner } from "./banner";
import type { BannerTone } from "./banner.types";
import { Button } from "../button/button";
import { Link } from "../link/link";

function Closable() {
  const [open, setOpen] = useState(true);
  if (!open)
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        重新显示
      </Button>
    );
  return (
    <Banner tone="brand" icon={<Sparkles />} onClose={() => setOpen(false)} action={<Link href="#" className="text-current underline">立即查看</Link>}>
      双十一大促开启，全场组件五折
    </Banner>
  );
}

export const bannerShowcase: ShowcaseSpec = {
  controls: [
    { prop: "tone", type: "select", options: ["neutral", "info", "brand", "success", "warning", "danger"], defaultValue: "info" },
    { prop: "variant", type: "select", options: ["soft", "solid"], defaultValue: "soft" },
  ],
  states: [
    {
      name: "soft（默认）",
      render: () => (
        <div className="flex flex-col gap-2">
          <Banner icon={<Info />}>新版本 2.0 已发布，包含 8 个新组件</Banner>
          <Banner tone="success" icon={<Rocket />}>部署成功，服务已切换到新版本</Banner>
          <Banner tone="warning" icon={<TriangleAlert />}>你的会员将在 3 天后到期</Banner>
        </div>
      ),
    },
    {
      name: "solid 填充",
      render: () => (
        <div className="flex flex-col gap-2">
          <Banner variant="solid" tone="brand" icon={<Sparkles />} align="center">
            限时优惠：升级 Pro 立享 8 折
          </Banner>
          <Banner variant="solid" tone="danger" icon={<TriangleAlert />}>
            系统将于 23:00 - 24:00 停机维护
          </Banner>
        </div>
      ),
    },
    {
      name: "带操作 + 可关闭",
      render: () => <Closable />,
    },
    {
      name: "左对齐 + 操作按钮",
      render: () => (
        <Banner
          tone="neutral"
          icon={<Megaphone />}
          align="start"
          action={<Button size="sm" variant="outline">了解更多</Button>}
          onClose={() => {}}
        >
          我们更新了隐私政策
        </Banner>
      ),
    },
    {
      name: "滚动跑马灯（长文案）",
      render: () => (
        <Banner variant="solid" tone="info" icon={<Megaphone />} scrollable>
          欢迎使用瑚琏 UI · 全量国产化设计 token · 暗色模式开箱即用 · 企业中后台 + AI 智能体 + 移动端全覆盖 · 持续更新中
        </Banner>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Banner tone={(p.tone as BannerTone) ?? "info"} variant={(p.variant as "soft" | "solid") ?? "soft"} icon={<Info />} onClose={() => {}}>
      这是一条全宽公告条
    </Banner>
  ),
  toCode: (p) =>
    `<Banner${p.tone && p.tone !== "info" ? ` tone="${p.tone}"` : ""}${p.variant && p.variant !== "soft" ? ` variant="${p.variant}"` : ""} onClose={() => {}}>公告内容</Banner>`,
};
