"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Video } from "./video";

// 本地测试素材（放在 apps/www/public/demo 下，离线可用、不依赖外网 CDN）。
const MP4 = "/demo/sample-video.mp4";
const HLS = "/demo/hls/stream.m3u8";
const POSTER = "/demo/sample-poster.jpg";

const W = "w-full max-w-2xl";

export const videoShowcase: ShowcaseSpec = {
  controls: [
    { prop: "src", type: "text", defaultValue: MP4, label: "片源 URL" },
    { prop: "aspectRatio", type: "select", options: ["16/9", "4/3", "1/1", "21/9"], defaultValue: "16/9", label: "宽高比" },
    { prop: "muted", type: "boolean", defaultValue: false, label: "静音" },
    { prop: "loop", type: "boolean", defaultValue: false, label: "循环" },
  ],
  states: [
    { name: "默认(MP4 文件)", render: () => <Video src={MP4} title="演示视频" className={W} /> },
    { name: "带海报", render: () => <Video src={MP4} poster={POSTER} title="带海报" className={W} /> },
    { name: "HLS 流(.m3u8)", render: () => <Video src={HLS} title="HLS 流" className={W} /> },
    { name: "方形 1/1", render: () => <Video src={MP4} aspectRatio="1/1" className="w-72" /> },
    {
      name: "章节标记(进度条 cue points)",
      render: () => (
        <Video
          src={MP4}
          poster={POSTER}
          title="带章节标记"
          className={W}
          chapters={[
            { time: 0, title: "开场介绍" },
            { time: 3, title: "核心概念" },
            { time: 6, title: "实战演示" },
            { time: 9, title: "总结" },
          ]}
        />
      ),
    },
    {
      name: "续播(从第 4 秒开始)",
      render: () => <Video src={MP4} poster={POSTER} title="续播定位" startTime={4} className={W} />,
    },
    {
      name: "播完结束屏(下一节)",
      render: () => (
        <Video
          src={MP4}
          poster={POSTER}
          title="结束屏"
          className={W}
          endScreen={
            <div className="text-center text-white">
              <div className="text-sm text-white/70">即将播放下一节</div>
              <div className="mt-1 text-lg font-semibold">02 · 组件化思维</div>
            </div>
          }
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <Video
      src={(p.src as string) || MP4}
      aspectRatio={p.aspectRatio as string}
      muted={p.muted as boolean}
      loop={p.loop as boolean}
      className={W}
    />
  ),
  toCode: (p) =>
    `<Video\n  src="${(p.src as string) || MP4}"\n  aspectRatio="${p.aspectRatio}"${p.muted ? "\n  muted" : ""}${p.loop ? "\n  loop" : ""}\n/>`,
};
