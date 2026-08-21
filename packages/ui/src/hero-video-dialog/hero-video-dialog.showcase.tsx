"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { HeroVideoDialog } from "./hero-video-dialog";
import { demoAsset } from "../lib/demo-asset";

// 演示素材一律走文档站本地文件（见 lib/demo-asset.ts 与 lib/demo-image.ts 的「零外链」铁律）：
// 这里原先写死 youtube embed，墙内/断网/内网打开文档站时弹层是空白——组件的核心交互当场演示不出来。
const THUMB = demoAsset("/demo/sample-poster.jpg");
const VIDEO = demoAsset("/demo/sample-video.mp4");

export const heroVideoDialogShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "传缩略图 + 视频地址，点击缩略图弹出居中视频层（Esc / 点遮罩关闭）。videoSrc 指向视频文件时自动用原生播放器。",
      code: `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="产品预览"
  videoSrc="/hero.mp4"
/>`,
      render: () => (
        <HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="产品预览" videoSrc={VIDEO} className="w-80" />
      ),
    },
    {
      title: "自定义尺寸",
      description: "用 className 控制缩略图容器宽度，弹层视频固定为 16:9。",
      code: `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="封面"
  videoSrc="/hero.mp4"
  className="w-full max-w-md"
/>`,
      render: () => (
        <HeroVideoDialog
          thumbnailSrc={THUMB}
          thumbnailAlt="封面"
          videoSrc={VIDEO}
          className="w-full max-w-md"
        />
      ),
    },
    {
      title: "指定播放形态（videoType）",
      description:
        "自动判别只看扩展名，不够准时用 videoType 明确指定：第三方平台（YouTube / Bilibili 等）的 embed 地址传 \"embed\"，没有扩展名的视频直链传 \"video\"。下面刻意把本地视频文件按 \"embed\" 挂进 iframe——画面照样出来，但没有 poster、控件样式不受控，这就是形态选错时页面上的样子。",
      code: `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="产品预览"
  videoSrc="/hero.mp4"
  videoType="embed"
/>`,
      render: () => (
        <HeroVideoDialog
          thumbnailSrc={THUMB}
          thumbnailAlt="产品预览"
          videoSrc={VIDEO}
          videoType="embed"
          className="w-80"
        />
      ),
    },
  ],
  controls: [
    { prop: "videoType", type: "select", options: ["auto", "embed", "video"], defaultValue: "auto" },
  ],
  states: [
    {
      name: "default",
      render: () => (
        <HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="预览" videoSrc={VIDEO} className="w-80" />
      ),
    },
  ],
  renderWithProps: (p) => (
    <HeroVideoDialog
      thumbnailSrc={THUMB}
      thumbnailAlt="预览"
      videoSrc={VIDEO}
      videoType={(p.videoType as "auto" | "embed" | "video") ?? "auto"}
      className="w-80"
    />
  ),
  toCode: () => `<HeroVideoDialog\n  thumbnailSrc="/cover.jpg"\n  videoSrc="/hero.mp4"\n/>`,
};
