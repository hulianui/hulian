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
