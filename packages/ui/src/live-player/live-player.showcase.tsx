"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { LivePlayer } from "./live-player";

function LivePlayerDemo({ orientation = "landscape" }: { orientation?: "portrait" | "landscape" }) {
  const [followed, setFollowed] = useState(false);
  const [quality, setQuality] = useState("超清");
  return (
    <div className={orientation === "portrait" ? "w-56" : "w-full max-w-xl"}>
      <LivePlayer
        src="/demo/sample-video.mp4"
        orientation={orientation}
        viewers={12840}
        qualities={["蓝光", "超清", "高清", "标清"]}
        quality={quality}
        onQualityChange={setQuality}
        host={{
          name: "瀚选优品·主播阿楠",
          meta: "粉丝 28.6w",
          followed,
          onFollow: () => setFollowed(true),
        }}
        footer={
          <div className="bg-gradient-to-t from-black/50 to-transparent p-3 text-xs text-white/80">
            说点什么…
          </div>
        }
      />
    </div>
  );
}

export const livePlayerShowcase: ShowcaseSpec = {
  controls: [],
  examples: [
    {
      title: "基础用法",
      description: "传 src 即播放（内部固定 muted/loop/autoPlay）；LIVE 呼吸徽标默认开启。",
      code: `<div className="w-full max-w-xl">
  <LivePlayer src="/stream.mp4" viewers={12840} />
</div>`,
      render: () => (
        <div className="w-full max-w-xl">
          <LivePlayer src="/demo/sample-video.mp4" viewers={12840} />
        </div>
      ),
    },
    {
      title: "主播条 + 关注",
      description: "host 传入主播信息；带 onFollow 时渲染关注钮，followed 切换为「已关注」。",
      code: `<LivePlayer
  src="/stream.mp4"
  viewers={12840}
  host={{
    name: "瀚选优品·主播阿楠",
    meta: "粉丝 28.6w",
    onFollow: () => follow(),
  }}
/>`,
      render: () => (
        <div className="w-full max-w-xl">
          <LivePlayer
            src="/demo/sample-video.mp4"
            viewers={12840}
            host={{ name: "瀚选优品·主播阿楠", meta: "粉丝 28.6w", onFollow: () => {} }}
          />
        </div>
      ),
    },
    {
      title: "清晰度菜单 + 底部互动栏",
      description: "qualities 渲染清晰度切换菜单；footer 插槽放互动条。完整受控示例见下。",
      code: `<LivePlayer
  src="/stream.mp4"
  viewers={12840}
  qualities={["蓝光", "超清", "高清", "标清"]}
  quality={quality}
  onQualityChange={setQuality}
  host={{ name: "主播阿楠", meta: "粉丝 28.6w", followed, onFollow }}
  footer={<div className="bg-gradient-to-t from-black/50 to-transparent p-3 text-xs text-white/80">说点什么…</div>}
/>`,
      render: () => <LivePlayerDemo />,
    },
    {
      title: "竖屏沉浸",
      description: "orientation=\"portrait\" 锁 9/16 竖屏比例，移动端直播间用。",
      code: `<div className="w-56">
  <LivePlayer src="/stream.mp4" orientation="portrait" viewers={12840} />
</div>`,
      render: () => <LivePlayerDemo orientation="portrait" />,
    },
  ],
  states: [
    { name: "横屏直播（LIVE 呼吸徽标 · 在线跳数 · 清晰度菜单 · 主播关注）", render: () => <LivePlayerDemo /> },
    { name: "竖屏（9/16 沉浸）", render: () => <LivePlayerDemo orientation="portrait" /> },
  ],
  renderWithProps: () => <LivePlayerDemo />,
  toCode: () => `<LivePlayer
  src="/stream.mp4"
  viewers={12840}
  qualities={["蓝光", "超清", "高清"]}
  host={{ name: "主播", onFollow }}
  overlay={<Danmaku items={items} />}
  footer={<InteractionBar />}
/>`,
};
