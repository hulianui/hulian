"use client";
import { useState } from "react";
import { Megaphone, Sparkles, TriangleAlert, Info, Rocket } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Banner } from "../../../../packages/ui/src/banner/banner";
import type { BannerTone } from "../../../../packages/ui/src/banner/banner.types";
import { Button } from "../../../../packages/ui/src/button/button";
import { Link } from "../../../../packages/ui/src/link/link";
function Closable() {
    const [open, setOpen] = useState(true);
    if (!open)
        return (<Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Redisplay
      </Button>);
    return (<Banner tone="brand" icon={<Sparkles />} onClose={() => setOpen(false)} action={<Link href="#" className="text-current underline">View now</Link>}>
      The Double Eleven promotion is on, with 50% off all components
    </Banner>);
}
export const bannerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Banner announcement bar, the leading icon is automatically colored with tone, and is centered in a single line by default.",
            code: `<Banner icon={<Info />}>New version 2.0 has been released, including 8 new components</Banner>`,
            render: () => <Banner icon={<Info />}>New version 2.0 has been released, including 8 new components</Banner>,
        },
        {
            title: "Six tone",
            description: "tone offers neutral / info / brand / success / warning / danger.",
            code: `<>
  <Banner tone="success" icon={<Rocket />}>The deployment was successful and the service has been switched to the new version</Banner>
  <Banner tone="warning" icon={<TriangleAlert />}>Your membership will expire in 3 days</Banner>
  <Banner tone="danger" icon={<TriangleAlert />}>The system will be shut down for maintenance at 23:00</Banner>
</>`,
            render: () => (<div className="flex flex-col gap-2">
          <Banner tone="success" icon={<Rocket />}>
            Deployment successful, service has been switched to the new version
          </Banner>
          <Banner tone="warning" icon={<TriangleAlert />}>
            Your membership will expire in 3 days
          </Banner>
          <Banner tone="danger" icon={<TriangleAlert />}>
            The system will be shut down for maintenance at 23:00
          </Banner>
        </div>),
        },
        {
            title: "Solid color fill",
            description: "variant=\"solid\" uses a solid color base, which is more eye-catching and suitable for promotions/major announcements.",
            code: `<Banner variant="solid" tone="brand" icon={<Sparkles />} align="center">
  Limited time offer: Upgrade to Pro and enjoy 20% off
</Banner>`,
            render: () => (<Banner variant="solid" tone="brand" icon={<Sparkles />} align="center">
          Limited time offer: Upgrade to Pro and enjoy 20% off
        </Banner>),
        },
        {
            title: "Operation + Can be closed",
            description: "Put the action slot on the right side and pass the onClose render close button.",
            code: `<Banner
  tone="neutral"
  icon={<Megaphone />}
  align="start"
  action={<Button size="sm" variant="outline">Learn more</Button>}
  onClose={() => setOpen(false)}
>
  We have updated our privacy policy
</Banner>`,
            render: () => (<Banner tone="neutral" icon={<Megaphone />} align="start" action={<Button size="sm" variant="outline">
              Learn more
            </Button>} onClose={() => { }}>
          We have updated our privacy policy
        </Banner>),
        },
        {
            title: "Rolling marquee",
            description: "scrollable allows long copy to scroll seamlessly in a single line (hover pauses).",
            code: `<Banner variant="solid" tone="info" icon={<Megaphone />} scrollable>
  Welcome to use Hulian UI \u00B7 Fully domestically produced design token \u00B7 Dark mode available out of the box \u00B7 Continuously updated
</Banner>`,
            render: () => (<Banner variant="solid" tone="info" icon={<Megaphone />} scrollable>
          Welcome to use Hulian UI · Fully domestically produced design token · Dark mode available out of the box · Continuously updated
        </Banner>),
        },
    ],
    controls: [
        { prop: "tone", type: "select", options: ["neutral", "info", "brand", "success", "warning", "danger"], defaultValue: "info" },
        { prop: "variant", type: "select", options: ["soft", "solid"], defaultValue: "soft" },
    ],
    states: [
        {
            name: "soft (default)",
            render: () => (<div className="flex flex-col gap-2">
          <Banner icon={<Info />}>New version 2.0 has been released, including 8 new components</Banner>
          <Banner tone="success" icon={<Rocket />}>Deployment successful, service has been switched to the new version</Banner>
          <Banner tone="warning" icon={<TriangleAlert />}>Your membership will expire in 3 days</Banner>
        </div>),
        },
        {
            name: "solid Fill",
            render: () => (<div className="flex flex-col gap-2">
          <Banner variant="solid" tone="brand" icon={<Sparkles />} align="center">
            Limited time offer: Upgrade to Pro and enjoy 20% off
          </Banner>
          <Banner variant="solid" tone="danger" icon={<TriangleAlert />}>
            The system will be down for maintenance from 23:00 - 24:00
          </Banner>
        </div>),
        },
        {
            name: "With operation + can be closed",
            render: () => <Closable />,
        },
        {
            name: "Left alignment + action button",
            render: () => (<Banner tone="neutral" icon={<Megaphone />} align="start" action={<Button size="sm" variant="outline">Learn more</Button>} onClose={() => { }}>
          We have updated our privacy policy
        </Banner>),
        },
        {
            name: "Scrolling marquee (long copy)",
            render: () => (<Banner variant="solid" tone="info" icon={<Megaphone />} scrollable>
          Welcome to use Hulian UI · Fully localized design token · Dark mode out of the box · Enterprise middle and backend + AI intelligent body + full mobile coverage · Continuously updated
        </Banner>),
        },
    ],
    renderWithProps: (p) => (<Banner tone={(p.tone as BannerTone) ?? "info"} variant={(p.variant as "soft" | "solid") ?? "soft"} icon={<Info />} onClose={() => { }}>
      This is a full-width announcement strip
    </Banner>),
    toCode: (p) => `<Banner${p.tone && p.tone !== "info" ? ` tone="${p.tone}"` : ""}${p.variant && p.variant !== "soft" ? ` variant="${p.variant}"` : ""} onClose={() => {}}>Announcement Content</Banner>`,
};
