"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { WorldMap } from "../../../../packages/ui/src/world-map/world-map";
import type { WorldMapDot, WorldMapNode } from "../../../../packages/ui/src/world-map/world-map.types";
const BEIJING = { lat: 39.9, lng: 116.4, label: "Beijing" };
const NEW_YORK = { lat: 40.7, lng: -74, label: "New York" };
const single: WorldMapDot[] = [{ start: BEIJING, end: NEW_YORK }];
const SHANGHAI = { lat: 31.2, lng: 121.5, label: "Shanghai" };
const radial: WorldMapDot[] = [
    { start: SHANGHAI, end: { lat: 51.5, lng: -0.1, label: "London" } },
    { start: SHANGHAI, end: { lat: 1.35, lng: 103.8, label: "Singapore" } },
    { start: SHANGHAI, end: { lat: -33.9, lng: 151.2, label: "Sydney" } },
    { start: SHANGHAI, end: { lat: 37.8, lng: -122.4, label: "San Francisco" } },
];
const multiColor: WorldMapDot[] = [
    { start: SHANGHAI, end: { lat: 51.5, lng: -0.1, label: "London" }, color: "var(--color-chart-1)" },
    { start: SHANGHAI, end: { lat: 1.35, lng: 103.8, label: "Singapore" }, color: "var(--color-chart-2)" },
    { start: SHANGHAI, end: { lat: -33.9, lng: 151.2, label: "Sydney" }, color: "var(--color-chart-3)" },
    { start: SHANGHAI, end: { lat: 37.8, lng: -122.4, label: "San Francisco" }, color: "var(--color-chart-4)" },
];
const NODES: WorldMapNode[] = [
    { id: "sh", lat: 31.2, lng: 121.5, label: "Shanghai", value: 92, color: "var(--color-chart-1)" },
    { id: "sg", lat: 1.35, lng: 103.8, label: "Singapore", value: 64, color: "var(--color-chart-2)" },
    { id: "fra", lat: 50.1, lng: 8.7, label: "Frankfurt", value: 48, color: "var(--color-chart-3)" },
    { id: "sfo", lat: 37.8, lng: -122.4, label: "San Francisco", value: 73, color: "var(--color-chart-4)" },
    { id: "syd", lat: -33.9, lng: 151.2, label: "Sydney", value: 30, color: "var(--color-chart-2)" },
];
function Frame({ children }: {
    children: React.ReactNode;
}) {
    return <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-surface p-4">{children}</div>;
}
export const worldMapShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Single connection",
            description: "Input the starting point/end point longitude and latitude, and the arc will be automatically drawn and looped.",
            code: `<WorldMap
  dots={[{ start: { lat: 39.9, lng: 116.4 }, end: { lat: 40.7, lng: -74 } }]}
/>`,
            render: () => (<Frame>
          <WorldMap dots={single}/>
        </Frame>),
        },
        {
            title: "Multi-point radiation",
            description: "The same starting point connects to multiple cities, forming a radiation network.",
            code: `<WorldMap
  dots={[
    { start: shanghai, end: london },
    { start: shanghai, end: singapore },
    { start: shanghai, end: sydney },
    { start: shanghai, end: sanFrancisco },
  ]}
/>`,
            render: () => (<Frame>
          <WorldMap dots={radial}/>
        </Frame>),
        },
        {
            title: "Color matching one by one",
            description: "Each connection uses dot.color to cover the global color, and multiple colors coexist in the same picture.",
            code: `<WorldMap
  dots={[
    { start: shanghai, end: london, color: "var(--color-chart-1)" },
    { start: shanghai, end: singapore, color: "var(--color-chart-2)" },
  ]}
/>`,
            render: () => (<Frame>
          <WorldMap dots={multiColor}/>
        </Frame>),
        },
        {
            title: "Node distribution",
            description: "points is independent of fly lines, value drives node size, and showLabels displays labels.",
            code: `<WorldMap
  points={[
    { id: "sh", lat: 31.2, lng: 121.5, label: "Shanghai", value: 92 },
    { id: "sg", lat: 1.35, lng: 103.8, label: "Singapore", value: 64 },
  ]}
  showLabels
/>`,
            render: () => (<Frame>
          <WorldMap points={NODES} showLabels/>
        </Frame>),
        },
        {
            title: "Flying line mark",
            description: "flyingMarker Let the mark move circularly along the arc and fit the direction (plane / comet / arrow).",
            code: `<WorldMap dots={radial} flyingMarker="plane" />`,
            render: () => (<Frame>
          <WorldMap dots={radial} flyingMarker="plane"/>
        </Frame>),
        },
    ],
    controls: [],
    states: [
        { name: "Single connection", render: () => <Frame><WorldMap dots={single}/></Frame> },
        { name: "Multi-point radiation", render: () => <Frame><WorldMap dots={radial}/></Frame> },
        { name: "Emerald Green", render: () => <Frame><WorldMap dots={radial} lineColor="var(--color-chart-2)"/></Frame> },
        { name: "Amber", render: () => <Frame><WorldMap dots={radial} lineColor="var(--color-chart-3)"/></Frame> },
        { name: "Violet", render: () => <Frame><WorldMap dots={radial} lineColor="var(--color-chart-4)"/></Frame> },
        { name: "Main color emphasis", render: () => <Frame><WorldMap dots={radial} lineColor="var(--color-primary)" dotColor="var(--color-muted)"/></Frame> },
        { name: "Mixed color connection", render: () => <Frame><WorldMap dots={multiColor}/></Frame> },
        { name: "Node distribution", render: () => <Frame><WorldMap points={NODES}/></Frame> },
        { name: "Node label", render: () => <Frame><WorldMap points={NODES} showLabels/></Frame> },
        { name: "Node stacking flying line", render: () => <Frame><WorldMap points={NODES} dots={radial}/></Frame> },
        { name: "Click to drill down", render: () => <Frame><WorldMap points={NODES} showLabels onPointClick={(n) => alert(`Drill down:${n.label}`)}/></Frame> },
        { name: "Airplane\u2708\uFE0F", render: () => <Frame><WorldMap dots={radial} flyingMarker="plane"/></Frame> },
        { name: "Light point comet tail", render: () => <Frame><WorldMap dots={multiColor} flyingMarker="comet"/></Frame> },
        { name: "Arrow", render: () => <Frame><WorldMap dots={radial} flyingMarker="arrow"/></Frame> },
        { name: "Node + Aircraft", render: () => <Frame><WorldMap points={NODES} dots={radial} flyingMarker="plane"/></Frame> },
        { name: "Pure base map", render: () => <Frame><WorldMap /></Frame> },
    ],
    renderWithProps: () => (<Frame>
      <WorldMap dots={radial}/>
    </Frame>),
    toCode: () => `<WorldMap
  dots={[{ start: { lat: 39.9, lng: 116.4 }, end: { lat: 40.7, lng: -74 } }]}
/>`,
};
