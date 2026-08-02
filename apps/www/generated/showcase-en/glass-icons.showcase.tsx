"use client";
import { Heart, Star, Bell, Settings, Cloud, Zap } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GlassIcons } from "../../../../packages/ui/src/glass-icons/glass-icons";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex min-h-64 w-full max-w-xl items-center justify-center overflow-visible rounded-xl border border-border p-10" style={{ background: "oklch(0.16 0.02 255)" }}>
      {children}
    </div>);
}
const demoItems = [
    { icon: <Heart />, label: "Favorite", color: "red" },
    { icon: <Star />, label: "Star", color: "orange" },
    { icon: <Bell />, label: "Notice", color: "blue" },
    { icon: <Cloud />, label: "Cloud", color: "indigo" },
    { icon: <Zap />, label: "Lightning", color: "purple" },
    { icon: <Settings />, label: "Settings", color: "green" },
];
export const glassIconsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Incoming items (Icon + Label + Color), hover/focus See glass 3D Lift up with label slide out.",
            code: `import { Heart, Star, Bell, Cloud, Zap, Settings } from "lucide-react";

<GlassIcons
  columns={3}
  items={[
    { icon: <Heart />, label: "Collection", color: "red" },
    { icon: <Star />, label: "Star", color: "orange" },
    { icon: <Bell />, label: "Notification", color: "blue" },
    { icon: <Cloud />, label: "Cloud", color: "indigo" },
    { icon: <Zap />, label: "Lightning", color: "purple" },
    { icon: <Settings />, label: "Settings", color: "green" },
  ]}
/>`,
            render: () => (<Stage>
          <GlassIcons items={demoItems} columns={3}/>
        </Stage>),
        },
        {
            title: "Number of grid columns",
            description: "columns controls the number of grid columns, and narrow screens automatically fall back to 2 columns.",
            code: `<GlassIcons
  columns={2}
  items={[
    { icon: <Heart />, label: "Collection", color: "red" },
    { icon: <Star />, label: "Star", color: "orange" },
    { icon: <Bell />, label: "Notification", color: "blue" },
    { icon: <Cloud />, label: "Cloud", color: "indigo" },
  ]}
/>`,
            render: () => (<Stage>
          <GlassIcons columns={2} items={[
                    { icon: <Heart />, label: "Favorite", color: "red" },
                    { icon: <Star />, label: "Star", color: "orange" },
                    { icon: <Bell />, label: "Notice", color: "blue" },
                    { icon: <Cloud />, label: "Cloud", color: "indigo" },
                ]}/>
        </Stage>),
        },
        {
            title: "Monochrome theme color",
            description: "color passes 'primary' to let the luminous panel take the main color of the theme and automatically adapt to light and shade.",
            code: `<GlassIcons
  columns={2}
  items={[
    { icon: <Heart />, label: "Like", color: "primary" },
    { icon: <Star />, label: "Collection", color: "primary" },
  ]}
/>`,
            render: () => (<Stage>
          <GlassIcons columns={2} items={[
                    { icon: <Heart />, label: "Like", color: "primary" },
                    { icon: <Star />, label: "Favorite", color: "primary" },
                ]}/>
        </Stage>),
        },
        {
            title: "Custom gradient color",
            description: "color In addition to the default name, you can also pass any CSS gradient string.",
            code: `<GlassIcons
  columns={2}
  items={[
    {
      icon: <Cloud />,
      label: "Aurora",
      color: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-4))",
    },
    {
      icon: <Zap />,
      label: "Warm Orange",
      color: "linear-gradient(135deg, var(--color-chart-3), oklch(0.72 0.2 30))",
    },
  ]}
/>`,
            render: () => (<Stage>
          <GlassIcons columns={2} items={[
                    {
                        icon: <Cloud />,
                        label: "Aurora",
                        color: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-4))",
                    },
                    {
                        icon: <Zap />,
                        label: "Warm orange",
                        color: "linear-gradient(135deg, var(--color-chart-3), oklch(0.72 0.2 30))",
                    },
                ]}/>
        </Stage>),
        },
    ],
    controls: [{ prop: "columns", type: "number", defaultValue: 3, label: "Number of grid columns" }],
    states: [
        {
            name: "default (Six-color glass icon\u00B7hover to see the effect)",
            render: () => (<Stage>
          <GlassIcons items={demoItems} columns={3}/>
        </Stage>),
        },
        {
            name: "Monochrome primary (eat theme color)",
            render: () => (<Stage>
          <GlassIcons columns={2} items={[
                    { icon: <Heart />, label: "Like", color: "primary" },
                    { icon: <Star />, label: "Favorite", color: "primary" },
                ]}/>
        </Stage>),
        },
        {
            name: "Custom gradient color",
            render: () => (<Stage>
          <GlassIcons columns={2} items={[
                    {
                        icon: <Cloud />,
                        label: "Aurora",
                        color: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-4))",
                    },
                    {
                        icon: <Zap />,
                        label: "Warm orange",
                        color: "linear-gradient(135deg, var(--color-chart-3), oklch(0.72 0.2 30))",
                    },
                ]}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <GlassIcons items={demoItems} columns={p.columns as number}/>
    </Stage>),
    toCode: (p) => [
        `import { Heart, Star, Bell } from "lucide-react";`,
        ``,
        `<GlassIcons`,
        `  columns={${p.columns}}`,
        `  items={[`,
        `    { icon: <Heart />, label: "Collection", color: "red" },`,
        `    { icon: <Star />, label: "Star", color: "orange" },`,
        `    { icon: <Bell />, label: "Notification", color: "blue" },`,
        `  ]}`,
        `/>`,
    ].join("\n"),
};
