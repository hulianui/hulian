"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ProfileCard } from "../../../../packages/ui/src/profile-card/profile-card";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="grid min-h-[520px] w-full place-items-center overflow-hidden rounded-xl border border-border p-6" style={{ background: "oklch(0.16 0.02 265)" }}>
      {children}
    </div>);
}
export const profileCardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "When there is no avatar, the \"initial\" placeholder is dropped, and the pointer tilt + holographic gloss is turned on by default.",
            code: `<ProfileCard name="Lin Yu" title="Independent developer" handle="linyu" />`,
            render: () => (<Stage>
          <ProfileCard name="Lin Yu" title="Independent Developer" handle="linyu"/>
        </Stage>),
        },
        {
            title: "Halo color",
            description: "glowColor Feed chart token with --color- prefix, driving radial halo and edge brilliance.",
            code: `<ProfileCard
  name="Su Wan"
  title="Product Designer"
  handle="suwan"
  status="Busy"
  glowColor="var(--color-chart-3)"
/>`,
            render: () => (<Stage>
          <ProfileCard name="Su Wan" title="Product Designer" handle="suwan" status="Busy" glowColor="var(--color-chart-3)"/>
        </Stage>),
        },
        {
            title: "Static card",
            description: "enableTilt={false} Turn off tilt and pointer interaction, retaining the gradient and bottom information bar.",
            code: `<ProfileCard
  name="Hulian"
  title="Front-end Engineer"
  handle="hulianui"
  enableTilt={false}
/>`,
            render: () => (<Stage>
          <ProfileCard name="Hulian" title="Front-end Engineer" handle="hulianui" enableTilt={false}/>
        </Stage>),
        },
        {
            title: "Hide message bar",
            description: "showUserInfo={false} Remove the frosted glass information bar at the bottom, leaving only the main title and avatar.",
            code: `<ProfileCard
  name="Javi Torres"
  title="Software Engineer"
  showUserInfo={false}
  glowColor="var(--color-chart-2)"
/>`,
            render: () => (<Stage>
          <ProfileCard name="Javi Torres" title="Software Engineer" showUserInfo={false} glowColor="var(--color-chart-2)"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "name", type: "text", defaultValue: "Lin Yu", label: "Name" },
        { prop: "title", type: "text", defaultValue: "Independent Developer", label: "Position" },
        { prop: "handle", type: "text", defaultValue: "linyu", label: "Handle" },
        { prop: "status", type: "text", defaultValue: "Online", label: "Status" },
        { prop: "enableTilt", type: "boolean", defaultValue: true, label: "Tilt interaction" },
        {
            prop: "glowColor",
            type: "select",
            options: [
                "var(--color-chart-1)",
                "var(--color-chart-2)",
                "var(--color-chart-3)",
                "var(--color-chart-4)",
            ],
            defaultValue: "var(--color-chart-1)",
            label: "Halo color",
        },
    ],
    states: [
        {
            name: "default (initial letter placeholder\u00B7inclined to open)",
            render: () => (<Stage>
          <ProfileCard name="Lin Yu" title="Independent Developer" handle="linyu"/>
        </Stage>),
        },
        {
            name: "Warm halo",
            render: () => (<Stage>
          <ProfileCard name="Su Wan" title="Product Designer" handle="suwan" status="Busy" glowColor="var(--color-chart-3)"/>
        </Stage>),
        },
        {
            name: "Static (tilt off)",
            render: () => (<Stage>
          <ProfileCard name="Hulian" title="Front-end Engineer" handle="hulianui" enableTilt={false}/>
        </Stage>),
        },
        {
            name: "No message bar",
            render: () => (<Stage>
          <ProfileCard name="Javi Torres" title="Software Engineer" showUserInfo={false} glowColor="var(--color-chart-2)"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ProfileCard name={p.name as string} title={p.title as string} handle={p.handle as string} status={p.status as string} enableTilt={p.enableTilt as boolean} glowColor={p.glowColor as string}/>
    </Stage>),
    toCode: (p) => [
        `<div className="grid min-h-[520px] place-items-center rounded-xl"`,
        `     style={{ background: "oklch(0.16 0.02 265)" }}>`,
        `  <ProfileCard`,
        `    name="${p.name}"`,
        `    title="${p.title}"`,
        `    handle="${p.handle}"`,
        `    status="${p.status}"`,
        `    enableTilt={${p.enableTilt}}`,
        `    glowColor="${p.glowColor}"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
