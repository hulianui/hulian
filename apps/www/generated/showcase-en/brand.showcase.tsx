import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Brand } from "../../../../packages/ui/src/brand/brand";
function Mark() {
    return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"/>
    </svg>);
}
export const brandShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Square corner badge + site name. If mark is not passed, the first letter of the brand name (one Chinese character/English initial letter) will be automatically taken.",
            code: `<Brand name="Hulian Backstage" />
<Brand name="hulian admin" />`,
            render: () => (<div className="flex flex-wrap items-center gap-8">
          <Brand name="Hulian Backstage"/>
          <Brand name="hulian admin"/>
        </div>),
        },
        {
            title: "Custom badge \u00B7 Subtitle \u00B7 Color",
            description: "mark connects to the icon/picture; description hangs a row of version or positioning; color changes the badge background color.",
            code: `<Brand mark={<Logo />} name="Hulian" description="v0.18.0" />
<Brand name="Data Platform" color="chart-3" description="Internal System" />`,
            render: () => (<div className="flex flex-wrap items-center gap-8">
          <Brand mark={<Mark />} name="Hulian" description="v0.18.0"/>
          <Brand name="Data Platform" color="chart-3" description="Internal system"/>
        </div>),
        },
        {
            title: "Three sizes \u00B7 Collapsed state",
            description: "sm Navigation bar / md Side bar / lg Login page brand area; omit name to only display the badge (used when the side bar is collapsed).",
            code: `<Brand size="sm" name="Hulian" />
<Brand size="md" name="Hulian" />
<Brand size="lg" name="Hulian" />
<Brand mark={<Logo />} /> {/* Collapse */}`,
            render: () => (<div className="flex flex-wrap items-center gap-8">
          <Brand size="sm" name="Hulian"/>
          <Brand size="md" name="Hulian"/>
          <Brand size="lg" name="Hulian"/>
          <Brand mark={<Mark />}/>
        </div>),
        },
        {
            title: "Link back to home page",
            description: "href uses ordinary links; render connects to frame routing components (react-router / next/link) to avoid SPA full page refresh.",
            code: `<Brand name="Hulian" href="/" />
<Brand name="Hulian" render={<Link to="/" />} />`,
            render: () => (<div className="flex flex-wrap items-center gap-8">
          <Brand name="Hulian" href="/"/>
          <Brand mark={<Mark />} name="Hulian" description="Click me to return to the home page" href="/"/>
        </div>),
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["md", "sm", "lg"], defaultValue: "md" },
        { prop: "name", type: "text", defaultValue: "Hulian Backstage" },
        { prop: "description", type: "text", defaultValue: "" },
        { prop: "color", type: "select", options: ["primary", "chart-2", "chart-3", "chart-5"], defaultValue: "primary" },
    ],
    states: [
        {
            name: "Default (initial badge)",
            render: () => (<div className="flex flex-wrap items-center gap-8">
          <Brand name="Hulian Backstage"/>
          <Brand name="hulian admin"/>
        </div>),
        },
        {
            name: "Custom badge + subtitle",
            render: () => (<div className="flex flex-wrap items-center gap-8">
          <Brand mark={<Mark />} name="Hulian" description="v0.18.0"/>
          <Brand name="Data Platform" color="chart-3" description="Internal system"/>
        </div>),
        },
        {
            name: "Three sizes + folded",
            render: () => (<div className="flex flex-wrap items-center gap-8">
          <Brand size="sm" name="Hulian"/>
          <Brand size="md" name="Hulian"/>
          <Brand size="lg" name="Hulian"/>
          <Brand mark={<Mark />}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<Brand name={(p.name as string) || undefined} description={(p.description as string) || undefined} size={(p.size as "sm" | "md" | "lg") ?? "md"} color={(p.color as string) ?? "primary"}/>),
    toCode: (p) => `<Brand
  name="${p.name ?? "Hulian Backstage"}"${p.description ? `
  description="${p.description}"` : ""}${p.size && p.size !== "md" ? `
  size="${p.size}"` : ""}${p.color && p.color !== "primary" ? `
  color="${p.color}"` : ""}
/>`,
};
