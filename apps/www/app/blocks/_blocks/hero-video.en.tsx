import Link from "next/link";
import { Button, HeroVideoDialog, Tag, Heading, Text } from "@hulianui/ui";
import { ArrowRight, PlayCircle } from "lucide-react";
const THUMB = "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#6366f1'/>
          <stop offset='55%' stop-color='#0ea5e9'/>
          <stop offset='100%' stop-color='#0f172a'/>
        </linearGradient>
      </defs>
      <rect width='1280' height='720' fill='url(#g)'/>
      <rect x='0' y='0' width='1280' height='720' fill='black' opacity='0.12'/>
    </svg>`);
const VIDEO_SRC = "data:text/html;charset=utf-8," +
    encodeURIComponent(`<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#e2e8f0;font-family:system-ui">Demo video placeholder</body>`);
export function HeroVideoBlock({ ctaHref = "#" }: {
    ctaHref?: string;
}) {
    return (<section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center md:py-28">
        <Tag variant="soft" tone="brand" size="md" icon={<PlayCircle className="size-3.5"/>}>
          HanCloud in 3 minutes
        </Tag>

        <Heading level={1} weight="bold" balance className="text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
          See how easy deployment can be
        </Heading>

        <Text tone="muted" size="lg" className="max-w-2xl">
          See the complete HanCloud deployment flow, from connecting a repository to a global release, with no infrastructure configuration or ongoing operations.
        </Text>

        <div className="mt-2">
          <Button size="lg" render={<Link href={ctaHref}/>}>
            Start for free
            <ArrowRight className="ml-2 size-4" aria-hidden/>
          </Button>
        </div>

        <HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="HanCloud product demo thumbnail" videoSrc={VIDEO_SRC} className="mt-6 aspect-video w-full max-w-3xl shadow-xl"/>
      </div>
    </section>);
}
