"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ChromaGrid } from "../../../../packages/ui/src/chroma-grid/chroma-grid";
import type { ChromaGridItem } from "../../../../packages/ui/src/chroma-grid/chroma-grid.types";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative w-full overflow-hidden rounded-xl border border-border p-2" style={{ background: "oklch(0.16 0.02 255)" }}>
      {children}
    </div>);
}
const TEAM: ChromaGridItem[] = [
    {
        title: "Lin Yu",
        subtitle: "Full stack engineer",
        handle: "@linyu",
        borderColor: "var(--color-chart-1)",
        gradient: "linear-gradient(145deg, var(--color-chart-1), transparent)",
    },
    {
        title: "Chen Mo",
        subtitle: "DevOps Engineer",
        handle: "@chenmo",
        borderColor: "var(--color-chart-2)",
        gradient: "linear-gradient(210deg, var(--color-chart-2), transparent)",
    },
    {
        title: "Zurich",
        subtitle: "UI/UX Designer",
        handle: "@suli",
        borderColor: "var(--color-chart-3)",
        gradient: "linear-gradient(165deg, var(--color-chart-3), transparent)",
    },
    {
        title: "Zhou Ye",
        subtitle: "Data Scientist",
        handle: "@zhouye",
        borderColor: "var(--color-chart-4)",
        gradient: "linear-gradient(195deg, var(--color-chart-4), transparent)",
    },
];
export const chromaGridShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Revert to the built-in placeholder wall when items is not passed; move the mouse in to reveal a full-color window around the cursor.",
            code: `<ChromaGrid columns={3} />`,
            render: () => (<Stage>
          <ChromaGrid columns={3}/>
        </Stage>),
        },
        {
            title: "Custom team card",
            description: "Pass items array, each item contains title/subtitle/handle and chart token stroke gradient.",
            code: `const team = [
  {
    title: "Linyu",
    subtitle: "Full Stack Engineer",
    handle: "@linyu",
    borderColor: "var(--color-chart-1)",
    gradient: "linear-gradient(145deg, var(--color-chart-1), transparent)",
  },
  // \u2026
];

<ChromaGrid items={team} columns={2} radius={260} />`,
            render: () => (<Stage>
          <ChromaGrid items={TEAM} columns={2} radius={260}/>
        </Stage>),
        },
        {
            title: "Small radius focus",
            description: "Turn down radius to tighten the display window and focus the light more.",
            code: `<ChromaGrid items={team} columns={2} radius={180} />`,
            render: () => (<Stage>
          <ChromaGrid items={TEAM} columns={2} radius={180}/>
        </Stage>),
        },
        {
            title: "High damping slow follow",
            description: "Increase damping to make the reveal window follow the cursor more stickily, and fadeOut to control the fade-out duration after moving out.",
            code: `<ChromaGrid items={team} columns={2} damping={0.8} fadeOut={1.2} />`,
            render: () => (<Stage>
          <ChromaGrid items={TEAM} columns={2} damping={0.8} fadeOut={1.2}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "radius", type: "number", defaultValue: 300, label: "Reveal Radius px" },
        { prop: "columns", type: "number", defaultValue: 3, label: "Number of columns" },
        { prop: "damping", type: "number", defaultValue: 0.45, label: "Following damping 0~1" },
        { prop: "fadeOut", type: "number", defaultValue: 0.6, label: "Fade out seconds" },
    ],
    states: [
        {
            name: "default (Default placeholder\u00B7Move the mouse to reveal full color)",
            render: () => (<Stage>
          <ChromaGrid columns={3}/>
        </Stage>),
        },
        {
            name: "Custom team card (chart token stroke)",
            render: () => (<Stage>
          <ChromaGrid items={TEAM} columns={2} radius={260}/>
        </Stage>),
        },
        {
            name: "Small radius focus (radius=180)",
            render: () => (<Stage>
          <ChromaGrid items={TEAM} columns={2} radius={180}/>
        </Stage>),
        },
        {
            name: "High damping slow following (damping=0.8)",
            render: () => (<Stage>
          <ChromaGrid items={TEAM} columns={2} damping={0.8} fadeOut={1.2}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ChromaGrid items={TEAM} radius={p.radius as number} columns={p.columns as number} damping={p.damping as number} fadeOut={p.fadeOut as number}/>
    </Stage>),
    toCode: (p) => [
        `<ChromaGrid`,
        `  items={team}`,
        `  radius={${p.radius}}`,
        `  columns={${p.columns}}`,
        `  damping={${p.damping}}`,
        `  fadeOut={${p.fadeOut}}`,
        `/>`,
    ].join("\n"),
};
