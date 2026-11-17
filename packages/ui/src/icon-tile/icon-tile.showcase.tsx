import { Bell, MessageCircle, Plug, Rocket, ShieldCheck, ShoppingBag } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Text } from "../text";
import { IconTile } from "./icon-tile";
import type { IconTileProps, IconTileTone } from "./icon-tile.types";

const TONES: IconTileTone[] = ["brand", "neutral", "info", "success", "warning", "danger"];

function Row({ variant }: { variant: IconTileProps["variant"] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {TONES.map((t) => (
        <IconTile key={t} tone={t} variant={variant}>
          <Bell />
        </IconTile>
      ))}
    </div>
  );
}

export const iconTileShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "功能列表 / 通知流里「图标 + 文字」最左边那一格，默认主色浅底；图标尺寸随档，不必自己写。",
      code: `<IconTile><Plug /></IconTile>
<div>
  <Text weight="semibold">MCP 服务</Text>
  <Text size="sm" tone="muted">一行命令装上，助手查 props 而不是猜 props。</Text>
</div>`,
      render: () => (
        <div className="flex max-w-sm gap-4">
          <IconTile size="lg">
            <Plug />
          </IconTile>
          <div>
            <Text weight="semibold">MCP 服务</Text>
            <Text size="sm" tone="muted">
              一行命令装上，助手查 props 而不是猜 props。
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "变体 × 语义色",
      description: "soft 浅底、solid 实底、outline 中性描边只染图标；六档语义色与 Tag / Button 同一口径。",
      code: `<IconTile tone="success" variant="soft"><Bell /></IconTile>
<IconTile tone="success" variant="solid"><Bell /></IconTile>
<IconTile tone="success" variant="outline"><Bell /></IconTile>`,
      render: () => (
        <div className="space-y-3">
          <Row variant="soft" />
          <Row variant="solid" />
          <Row variant="outline" />
        </div>
      ),
    },
    {
      title: "尺寸",
      description: "sm 32px / md 36px / lg 40px，圆角与图标尺寸跟着走。",
      code: `<IconTile size="sm"><ShieldCheck /></IconTile>
<IconTile size="md"><ShieldCheck /></IconTile>
<IconTile size="lg"><ShieldCheck /></IconTile>`,
      render: () => (
        <div className="flex items-center gap-3">
          <IconTile size="sm">
            <ShieldCheck />
          </IconTile>
          <IconTile size="md">
            <ShieldCheck />
          </IconTile>
          <IconTile size="lg">
            <ShieldCheck />
          </IconTile>
        </div>
      ),
    },
    {
      title: "分类色",
      description: "color 接语义色名或任意 CSS 色，覆盖 tone —— 通知流里按事件类别区分颜色。",
      code: `<IconTile variant="solid" color="chart-1"><ShoppingBag /></IconTile>
<IconTile variant="solid" color="chart-4"><MessageCircle /></IconTile>
<IconTile variant="solid" color="chart-5"><Rocket /></IconTile>`,
      render: () => (
        <div className="flex items-center gap-3">
          <IconTile variant="solid" color="chart-1">
            <ShoppingBag />
          </IconTile>
          <IconTile variant="solid" color="chart-4">
            <MessageCircle />
          </IconTile>
          <IconTile variant="solid" color="chart-5">
            <Rocket />
          </IconTile>
        </div>
      ),
    },
  ],
  controls: [
    { prop: "variant", type: "select", options: ["soft", "solid", "outline"], defaultValue: "soft" },
    { prop: "tone", type: "select", options: TONES, defaultValue: "brand" },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
  ],
  states: [
    { name: "soft", render: () => <Row variant="soft" /> },
    { name: "solid", render: () => <Row variant="solid" /> },
    { name: "outline", render: () => <Row variant="outline" /> },
  ],
  renderWithProps: (p) => (
    <IconTile
      variant={p.variant as IconTileProps["variant"]}
      tone={p.tone as IconTileTone}
      size={p.size as IconTileProps["size"]}
    >
      <Bell />
    </IconTile>
  ),
  toCode: (p) => `<IconTile variant="${p.variant}" tone="${p.tone}" size="${p.size}">
  <Bell />
</IconTile>`,
};
