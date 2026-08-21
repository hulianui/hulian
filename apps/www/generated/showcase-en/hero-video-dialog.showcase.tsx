"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { HeroVideoDialog } from "../../../../packages/ui/src/hero-video-dialog/hero-video-dialog";
import { demoAsset } from "../../../../packages/ui/src/lib/demo-asset";
const THUMB = demoAsset("/demo/sample-poster.jpg");
const VIDEO = demoAsset("/demo/sample-video.mp4");
export const heroVideoDialogShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass a thumbnail plus a video address; clicking the thumbnail opens a centered video layer (Esc or an overlay click closes it). When videoSrc points at a video file, the native player is used automatically.",
            code: `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="Product Preview"
  videoSrc="/hero.mp4"
/>`,
            render: () => (<HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="Product Preview" videoSrc={VIDEO} className="w-80"/>),
        },
        {
            title: "Custom size",
            description: "Use className to control the width of the thumbnail container, and the pop-up video is fixed at 16:9.",
            code: `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="Cover"
  videoSrc="/hero.mp4"
  className="w-full max-w-md"
/>`,
            render: () => (<HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="Cover" videoSrc={VIDEO} className="w-full max-w-md"/>),
        },
        {
            title: "Choosing the playback form (videoType)",
            description: "Automatic resolution reads the extension and nothing else, so declare videoType when that is not enough: pass \"embed\" for a third-party platform address from YouTube or Bilibili, and \"video\" for a direct video link that carries no extension. The demo below deliberately mounts a local video file in the iframe form. The picture still appears, but the poster is gone and the controls are unstyled, which is what a wrong form looks like on the page.",
            code: `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="Product Preview"
  videoSrc="/hero.mp4"
  videoType="embed"
/>`,
            render: () => (<HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="Product Preview" videoSrc={VIDEO} videoType="embed" className="w-80"/>),
        },
    ],
    controls: [
        { prop: "videoType", type: "select", options: ["auto", "embed", "video"], defaultValue: "auto" },
    ],
    states: [
        {
            name: "default",
            render: () => (<HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="Preview" videoSrc={VIDEO} className="w-80"/>),
        },
    ],
    renderWithProps: (p) => (<HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="Preview" videoSrc={VIDEO} videoType={(p.videoType as "auto" | "embed" | "video") ?? "auto"} className="w-80"/>),
    toCode: () => `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  videoSrc="/hero.mp4"
/>`,
};
