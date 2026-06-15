"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Video } from "./video";

// 本地测试素材（放在 apps/www/public/demo 下，离线可用、不依赖外网 CDN）。
const MP4 = "/demo/sample-video.mp4";
const HLS = "/demo/hls/stream.m3u8";
const POSTER = "/demo/sample-poster.jpg";

const W = "w-full max-w-2xl";

export const videoShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入 MP4 文件 URL，自带瑚琏皮肤的播放/进度/音量/倍速/全屏控件。",
      code: `<Video src="/demo/sample-video.mp4" title="演示视频" className="w-full max-w-2xl" />`,
      render: () => <Video src={MP4} title="演示视频" className={W} />,
    },
    {
      title: "带海报",
      description: "poster 在首帧加载前展示封面图。",
      code: `<Video src="/demo/sample-video.mp4" poster="/demo/sample-poster.jpg" title="带海报" className="w-full max-w-2xl" />`,
      render: () => <Video src={MP4} poster={POSTER} title="带海报" className={W} />,
    },
    {
      title: "HLS 流",
      description: "src 传 .m3u8 即播放 HLS 直播/点播流。",
      code: `<Video src="/demo/hls/stream.m3u8" title="HLS 流" className="w-full max-w-2xl" />`,
      render: () => <Video src={HLS} title="HLS 流" className={W} />,
    },
    {
      title: "章节标记",
      description: "chapters 在进度条上渲染分段 tick，hover 显示章节标题。",
      code: `<Video
  src="/demo/sample-video.mp4"
  poster="/demo/sample-poster.jpg"
  title="带章节标记"
  className="w-full max-w-2xl"
  chapters={[
    { time: 0, title: "开场介绍" },
    { time: 3, title: "核心概念" },
    { time: 6, title: "实战演示" },
    { time: 9, title: "总结" },
  ]}
/>`,
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
  ],
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
