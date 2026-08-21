"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LivePlayer } from "../../../../packages/ui/src/live-player/live-player";
import { demoAsset } from "../../../../packages/ui/src/lib/demo-asset";
const SRC = demoAsset("/demo/sample-video.mp4");
function LivePlayerDemo({ orientation = "landscape" }: {
    orientation?: "portrait" | "landscape";
}) {
    const [followed, setFollowed] = useState(false);
    const [quality, setQuality] = useState("Ultra HD");
    return (<div className={orientation === "portrait" ? "w-56" : "w-full max-w-xl"}>
      <LivePlayer src={SRC} orientation={orientation} viewers={12840} qualities={["Blu-ray", "Ultra HD", "HD", "SD"]} quality={quality} onQualityChange={setQuality} host={{
            name: "Hanxuan Premium\u00B7Anchor A Nan",
            meta: "Followers 28.6w",
            followed,
            onFollow: () => setFollowed(true),
        }} footer={<div className="bg-gradient-to-t from-black/50 to-transparent p-3 text-xs text-white/80">
            Say something...
          </div>}/>
    </div>);
}
export const livePlayerShowcase: ShowcaseSpec = {
    controls: [],
    examples: [
        {
            title: "Basic usage",
            description: "Pass src and play (internally fixed muted/loop/autoPlay); LIVE breathing logo is turned on by default.",
            code: `<div className="w-full max-w-xl">
  <LivePlayer src="/stream.mp4" viewers={12840} />
</div>`,
            render: () => (<div className="w-full max-w-xl">
          <LivePlayer src={SRC} viewers={12840}/>
        </div>),
        },
        {
            title: "Anchor strip + follow",
            description: "host incoming anchor information; when onFollow is used, the follow button is rendered, and followed is switched to \"Followed\".",
            code: `<LivePlayer
  src="/stream.mp4"
  viewers={12840}
  host={{
    name: "Excellent products\u00B7Anchor Anan",
    meta: "Fan 28.6w",
    onFollow: () => follow(),
  }}
/>`,
            render: () => (<div className="w-full max-w-xl">
          <LivePlayer src={SRC} viewers={12840} host={{ name: "Hanxuan Premium\u00B7Anchor A Nan", meta: "Followers 28.6w", onFollow: () => { } }}/>
        </div>),
        },
        {
            title: "Clarity menu + bottom interactive bar",
            description: "qualities rendering resolution switching menu; footer slot for interactive bar. A full controlled example can be found below.",
            code: `<LivePlayer
  src="/stream.mp4"
  viewers={12840}
  qualities={["Blu-ray", "UHD", "HD", "SD"]}
  quality={quality}
  onQualityChange={setQuality}
  host={{ name: "Anchor Anan", meta: "Fans 28.6w", followed, onFollow }}
  footer={<div className="bg-gradient-to-t from-black/50 to-transparent p-3 text-xs text-white/80">Say something...</div>}
/>`,
            render: () => <LivePlayerDemo />,
        },
        {
            title: "Vertical screen immersion",
            description: "orientation=\"portrait\" Lock 9/16 vertical screen ratio, for mobile live broadcast room.",
            code: `<div className="w-56">
  <LivePlayer src="/stream.mp4" orientation="portrait" viewers={12840} />
</div>`,
            render: () => <LivePlayerDemo orientation="portrait"/>,
        },
    ],
    states: [
        { name: "Horizontal live broadcast (LIVE breathing logo \u00B7 Online hop count \u00B7 Clarity menu \u00B7 Anchor attention)", render: () => <LivePlayerDemo /> },
        { name: "Vertical screen (9/16 Immersive)", render: () => <LivePlayerDemo orientation="portrait"/> },
    ],
    renderWithProps: () => <LivePlayerDemo />,
    toCode: () => `<LivePlayer
  src="/stream.mp4"
  viewers={12840}
  qualities={["Blu-ray", "UHD", "HD"]}
  host={{ name: "Anchor", onFollow }}
  overlay={<Danmaku items={items} />}
  footer={<InteractionBar />}
/>`,
};
