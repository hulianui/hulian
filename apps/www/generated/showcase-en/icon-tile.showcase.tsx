import { Bell, MessageCircle, Plug, Rocket, ShieldCheck, ShoppingBag } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Text } from "../../../../packages/ui/src/text";
import { IconTile } from "../../../../packages/ui/src/icon-tile/icon-tile";
import type { IconTileProps, IconTileTone } from "../../../../packages/ui/src/icon-tile/icon-tile.types";
const TONES: IconTileTone[] = ["brand", "neutral", "info", "success", "warning", "danger"];
function Row({ variant }: {
    variant: IconTileProps["variant"];
}) {
    return (<div className="flex flex-wrap items-center gap-3">
      {TONES.map((t) => (<IconTile key={t} tone={t} variant={variant}>
          <Bell />
        </IconTile>))}
    </div>);
}
export const iconTileShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The leftmost cell of \"icon + text\" rows in feature lists and feeds, with a subtle accent background by default; the icon is sized for you.",
            code: `<IconTile><Plug /></IconTile>
<div>
  <Text weight="semibold">MCP server</Text>
  <Text size="sm" tone="muted">One command and your assistant looks up props instead of guessing props.</Text>
</div>`,
            render: () => (<div className="flex max-w-sm gap-4">
          <IconTile size="lg">
            <Plug />
          </IconTile>
          <div>
            <Text weight="semibold">MCP server</Text>
            <Text size="sm" tone="muted">
              One command and your assistant looks up props instead of guessing props.
            </Text>
          </div>
        </div>),
        },
        {
            title: "Variants \u00D7 tones",
            description: "soft has a subtle background, solid is filled, and outline is a neutral border that tints only the icon; the six tones match Tag and Button.",
            code: `<IconTile tone="success" variant="soft"><Bell /></IconTile>
<IconTile tone="success" variant="solid"><Bell /></IconTile>
<IconTile tone="success" variant="outline"><Bell /></IconTile>`,
            render: () => (<div className="space-y-3">
          <Row variant="soft"/>
          <Row variant="solid"/>
          <Row variant="outline"/>
        </div>),
        },
        {
            title: "Size",
            description: "sm 32px / md 36px / lg 40px; the corner radius and icon size follow.",
            code: `<IconTile size="sm"><ShieldCheck /></IconTile>
<IconTile size="md"><ShieldCheck /></IconTile>
<IconTile size="lg"><ShieldCheck /></IconTile>`,
            render: () => (<div className="flex items-center gap-3">
          <IconTile size="sm">
            <ShieldCheck />
          </IconTile>
          <IconTile size="md">
            <ShieldCheck />
          </IconTile>
          <IconTile size="lg">
            <ShieldCheck />
          </IconTile>
        </div>),
        },
        {
            title: "Category colours",
            description: "color takes a semantic name or any CSS color and overrides tone, for coloring a feed by event type.",
            code: `<IconTile variant="solid" color="chart-1"><ShoppingBag /></IconTile>
<IconTile variant="solid" color="chart-4"><MessageCircle /></IconTile>
<IconTile variant="solid" color="chart-5"><Rocket /></IconTile>`,
            render: () => (<div className="flex items-center gap-3">
          <IconTile variant="solid" color="chart-1">
            <ShoppingBag />
          </IconTile>
          <IconTile variant="solid" color="chart-4">
            <MessageCircle />
          </IconTile>
          <IconTile variant="solid" color="chart-5">
            <Rocket />
          </IconTile>
        </div>),
        },
    ],
    controls: [
        { prop: "variant", type: "select", options: ["soft", "solid", "outline"], defaultValue: "soft" },
        { prop: "tone", type: "select", options: TONES, defaultValue: "brand" },
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    ],
    states: [
        { name: "soft", render: () => <Row variant="soft"/> },
        { name: "solid", render: () => <Row variant="solid"/> },
        { name: "outline", render: () => <Row variant="outline"/> },
    ],
    renderWithProps: (p) => (<IconTile variant={p.variant as IconTileProps["variant"]} tone={p.tone as IconTileTone} size={p.size as IconTileProps["size"]}>
      <Bell />
    </IconTile>),
    toCode: (p) => `<IconTile variant="${p.variant}" tone="${p.tone}" size="${p.size}">
  <Bell />
</IconTile>`,
};
