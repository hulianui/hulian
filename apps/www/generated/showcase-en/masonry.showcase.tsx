"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Masonry } from "../../../../packages/ui/src/masonry/masonry";
interface Tile {
    id: number;
    height: number;
    tone: string;
}
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
function Tile({ tile }: {
    tile: Tile;
}) {
    return (<div className="flex items-end rounded-[var(--radius)] border border-border p-3 text-xs font-medium text-foreground/80" style={{ height: tile.height, background: `color-mix(in oklab, ${tile.tone} 22%, var(--surface))` }}>
      #{tile.id}
    </div>);
}
function MasonryDemo({ columns = 3 }: {
    columns?: number;
}) {
    return <Masonry items={TILES} columns={columns} gap={16} renderItem={(t) => <Tile tile={t}/>}/>;
}
export const masonryShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Input data source and renderItem, sort by source order round-robin, 3 columns of waterfall flow.",
            code: `<Masonry
  items={photos}
  columns={3}
  gap={16}
  renderItem={(photo) => <img src={photo.url} alt={photo.alt} />}
/>`,
            render: () => <MasonryDemo columns={3}/>,
        },
        {
            title: "Customize the number of columns",
            description: "columns passes the number to fix the number of columns, and gap controls the inter-column and intra-column spacing (pixels).",
            code: `<Masonry items={photos} columns={2} gap={16} renderItem={(p) => <Card {...p} />} />`,
            render: () => <MasonryDemo columns={2}/>,
        },
        {
            title: "Responsive columns",
            description: "columns passes {base, sm, md, lg}: SSR/the first frame uses base, and switches according to the window breakpoint after mounting.",
            code: `<Masonry
  items={photos}
  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
  gap={16}
  renderItem={(photo) => <img src={photo.url} alt={photo.alt} />}
/>`,
            render: () => <Masonry items={TILES} columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={16} renderItem={(t) => <Tile tile={t}/>}/>,
        },
    ],
    controls: [{ prop: "columns", type: "number", defaultValue: 3, label: "Number of columns" }],
    states: [
        {
            name: "Waterfall flow \u00B7 Unequal height occupancy blocks (round-robin split \u00B7 3 columns)",
            render: () => <MasonryDemo columns={3}/>,
        },
    ],
    renderWithProps: (props) => <MasonryDemo columns={Number(props.columns) || 3}/>,
    toCode: () => [
        "<Masonry",
        "  items={photos}",
        "  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}",
        "  gap={16}",
        "  renderItem={(photo) => <img src={photo.url} alt={photo.alt} />}",
        "/>",
    ].join("\n"),
};
