"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Masonry } from "./masonry";

interface Tile {
  id: number;
  height: number;
  tone: string;
}

// 一组不等高占位块，制造瀑布流的参差感。色彩走 chart token，暗色自适应。
const TILES: Tile[] = [
  { id: 1, height: 120, tone: "var(--chart-1)" },
  { id: 2, height: 200, tone: "var(--chart-2)" },
  { id: 3, height: 90, tone: "var(--chart-3)" },
  { id: 4, height: 160, tone: "var(--chart-4)" },
  { id: 5, height: 240, tone: "var(--chart-5)" },
  { id: 6, height: 110, tone: "var(--chart-1)" },
  { id: 7, height: 180, tone: "var(--chart-2)" },
  { id: 8, height: 130, tone: "var(--chart-3)" },
  { id: 9, height: 210, tone: "var(--chart-4)" },
  { id: 10, height: 100, tone: "var(--chart-5)" },
  { id: 11, height: 170, tone: "var(--chart-1)" },
  { id: 12, height: 140, tone: "var(--chart-2)" },
];

function Tile({ tile }: { tile: Tile }) {
  return (
    <div
      className="flex items-end rounded-[var(--radius)] border border-border p-3 text-xs font-medium text-foreground/80"
      style={{ height: tile.height, background: `color-mix(in oklab, ${tile.tone} 22%, var(--surface))` }}
    >
      #{tile.id}
    </div>
  );
}

function MasonryDemo({ columns = 3 }: { columns?: number }) {
  return <Masonry items={TILES} columns={columns} gap={16} renderItem={(t) => <Tile tile={t} />} />;
}

export const masonryShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入数据源与 renderItem，按源顺序 round-robin 分列，3 列瀑布流。",
      code: `<Masonry
  items={photos}
  columns={3}
  gap={16}
  renderItem={(photo) => <img src={photo.url} alt={photo.alt} />}
/>`,
      render: () => <MasonryDemo columns={3} />,
    },
    {
      title: "自定义列数",
      description: "columns 传数字固定列数，gap 控制列间与列内间距（像素）。",
      code: `<Masonry items={photos} columns={2} gap={16} renderItem={(p) => <Card {...p} />} />`,
      render: () => <MasonryDemo columns={2} />,
    },
    {
      title: "响应式列数",
      description: "columns 传 {base,sm,md,lg}：SSR/首帧用 base，挂载后按窗口断点切换。",
      code: `<Masonry
  items={photos}
  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
  gap={16}
  renderItem={(photo) => <img src={photo.url} alt={photo.alt} />}
/>`,
      render: () => <Masonry items={TILES} columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={16} renderItem={(t) => <Tile tile={t} />} />,
    },
  ],
  controls: [{ prop: "columns", type: "number", defaultValue: 3, label: "列数" }],
  states: [
    {
      name: "瀑布流 · 不等高占位块（round-robin 分列 · 3 列）",
      render: () => <MasonryDemo columns={3} />,
    },
  ],
  renderWithProps: (props) => <MasonryDemo columns={Number(props.columns) || 3} />,
  toCode: () =>
    [
      "<Masonry",
      "  items={photos}",
      "  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}",
      "  gap={16}",
      "  renderItem={(photo) => <img src={photo.url} alt={photo.alt} />}",
      "/>",
    ].join("\n"),
};
