"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Book3D } from "../../../../packages/ui/src/book-3d/book-3d";
export const book3dShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass title / subtitle Ready-to-use brand gradient cover; thickness is revealed when still, and can be corrected when hovering.",
            code: `<Book3D title="Hulian" subtitle="hulianui" />`,
            render: () => <Book3D title="Hulian" subtitle="hulianui"/>,
        },
        {
            title: "Customized cover gradient",
            description: "coverColor Give the cover gradient starting and ending colors.",
            code: `<Book3D
  title="CSS"
  subtitle="Convert"
  coverColor={{ from: "#f7b733", to: "#e0992b" }}
/>`,
            render: () => (<Book3D title="CSS" subtitle="Conversion" coverColor={{ from: "#f7b733", to: "#e0992b" }}/>),
        },
        {
            title: "Corner mark ribbon",
            description: "ribbon + ribbonTone Attach a ribbon (danger / brand / success) to the upper right corner of the cover.",
            code: `<Book3D
  title="HTML"
  subtitle="5"
  ribbon="N\u00B01"
  ribbonTone="danger"
  coverColor={{ from: "#e0654a", to: "#c14a32" }}
/>`,
            render: () => (<Book3D title="HTML" subtitle="5" ribbon="N°1" ribbonTone="danger" coverColor={{ from: "#e0654a", to: "#c14a32" }}/>),
        },
        {
            title: "Bookshelf Arrangement",
            description: "Multiple books side by side, hover to correct each one.",
            code: `<div className="flex flex-wrap gap-8">
  <Book3D title="CSS" subtitle="Convert" ribbon="NEW" coverColor={{ from: "#f7b733", to: "#e0992b" }} />
  <Book3D title="JS" subtitle="FUNCTION" coverColor={{ from: "#5aa6e0", to: "#3f7fc0" }} />
  <Book3D title="TS" subtitle="TYPES" ribbonTone="brand" />
</div>`,
            render: () => (<div className="flex flex-wrap gap-8 py-2">
          <Book3D title="CSS" subtitle="Conversion" ribbon="NEW" coverColor={{ from: "#f7b733", to: "#e0992b" }}/>
          <Book3D title="JS" subtitle="FUNCTION" coverColor={{ from: "#5aa6e0", to: "#3f7fc0" }}/>
          <Book3D title="TS" subtitle="TYPES" ribbonTone="brand"/>
        </div>),
        },
    ],
    controls: [
        { prop: "title", type: "text", defaultValue: "CSS" },
        { prop: "subtitle", type: "text", defaultValue: "Conversion" },
        { prop: "ribbon", type: "text", defaultValue: "NEW" },
        { prop: "ribbonTone", type: "select", options: ["danger", "brand", "success"], defaultValue: "danger" },
    ],
    states: [
        {
            name: "Bookshelf (hover to correct)",
            render: () => (<div className="flex flex-wrap gap-8 py-2">
          <Book3D title="CSS" subtitle="Conversion" ribbon="NEW" coverColor={{ from: "#f7b733", to: "#e0992b" }}/>
          <Book3D title="JS" subtitle="FUNCTION" coverColor={{ from: "#5aa6e0", to: "#3f7fc0" }}/>
          <Book3D title="HTML" subtitle="5" ribbon="N°1" ribbonTone="danger" coverColor={{ from: "#e0654a", to: "#c14a32" }}/>
          <Book3D title="TS" subtitle="TYPES" ribbonTone="brand"/>
        </div>),
        },
        {
            name: "Brand gradient (default)",
            render: () => <Book3D title="Hulian" subtitle="hulianui"/>,
        },
    ],
    renderWithProps: (p) => (<Book3D title={(p.title as string) || "CSS"} subtitle={p.subtitle as string} ribbon={p.ribbon as string} ribbonTone={p.ribbonTone as "danger" | "brand" | "success"} coverColor={{ from: "#f7b733", to: "#e0992b" }}/>),
    toCode: (p) => `<Book3D title="${p.title}" subtitle="${p.subtitle}"${p.ribbon ? ` ribbon="${p.ribbon}" ribbonTone="${p.ribbonTone}"` : ""} coverColor={{ from: "#f7b733", to: "#e0992b" }} />`,
};
