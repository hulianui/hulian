"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { HeroVideoDialog } from "../../../../packages/ui/src/hero-video-dialog/hero-video-dialog";
const THUMB = "/demo/photo-hero.jpg";
const VIDEO = "https://www.youtube.com/embed/dQw4w9WgXcQ";
export const heroVideoDialogShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass the thumbnail + video address embed, click on the thumbnail to pop up the centered video layer (Esc / point mask off).",
            code: `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="Product Preview"
  videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
/>`,
            render: () => (<HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="Product Preview" videoSrc={VIDEO} className="w-80"/>),
        },
        {
            title: "Custom size",
            description: "Use className to control the width of the thumbnail container, and the pop-up video is fixed at 16:9.",
            code: `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="Cover"
  videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
  className="w-full max-w-md"
/>`,
            render: () => (<HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="Cover" videoSrc={VIDEO} className="w-full max-w-md"/>),
        },
    ],
    controls: [],
    states: [
        {
            name: "default",
            render: () => (<HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="Preview" videoSrc={VIDEO} className="w-80"/>),
        },
    ],
    renderWithProps: () => (<HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="Preview" videoSrc={VIDEO} className="w-80"/>),
    toCode: () => `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  videoSrc="https://www.youtube.com/embed/..."
/>`,
};
