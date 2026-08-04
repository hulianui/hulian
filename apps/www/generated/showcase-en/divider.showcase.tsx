import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Divider } from "../../../../packages/ui/src/divider/divider";
export const dividerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Do not pass children, which is a pure horizontal dividing line that separates the upper and lower sections of content.",
            code: `<p>Previous paragraph</p>
<Divider />
<p>Next paragraph</p>`,
            render: () => (<div className="w-full">
          <p className="text-sm text-foreground">Previous paragraph</p>
          <Divider />
          <p className="text-sm text-foreground">Next paragraph</p>
        </div>),
        },
        {
            title: "With text/text position",
            description: "Pass in children to embed text, and orientation to control text on the left/center/right.",
            code: `<Divider>Centered title</Divider>
<Divider orientation="left">Latest Update</Divider>
<Divider orientation="right">More</Divider>`,
            render: () => (<div className="w-full">
          <Divider>Centered title</Divider>
          <Divider orientation="left">Latest updates</Divider>
          <Divider orientation="right">More</Divider>
        </div>),
        },
        {
            title: "Dashed line",
            description: "dashed Switch to dotted line, pure line and with text are both effective.",
            code: `<Divider dashed />
<Divider dashed>Dotted line separation</Divider>`,
            render: () => (<div className="w-full">
          <Divider dashed/>
          <Divider dashed>Dotted line separation</Divider>
        </div>),
        },
        {
            title: "Regular font weight",
            description: "plain Let the embedded text use regular font weight (one step bolder by default).",
            code: `<Divider plain>Regular weight title</Divider>`,
            render: () => (<div className="w-full">
          <Divider plain>Regular weight title</Divider>
        </div>),
        },
        {
            title: "Inline vertical separation",
            description: "type=\"vertical\" Draw vertical lines between elements embedded in a row.",
            code: `<div className="flex items-center text-sm">
  <span>Documentation</span>
  <Divider type="vertical" />
  <span>Component</span>
  <Divider type="vertical" />
  <span>About</span>
</div>`,
            render: () => (<div className="flex items-center text-sm text-foreground">
          <span>Documentation</span>
          <Divider type="vertical"/>
          <span>Components</span>
          <Divider type="vertical"/>
          <span>About</span>
        </div>),
        },
    ],
    controls: [
        { prop: "orientation", type: "select", options: ["left", "center", "right"], defaultValue: "center", label: "Text position" },
        { prop: "children", type: "text", defaultValue: "Separate headers", label: "Text" },
        { prop: "dashed", type: "boolean", defaultValue: false, label: "Dashed line" },
        { prop: "plain", type: "boolean", defaultValue: false, label: "Regular font weight" },
    ],
    states: [
        {
            name: "Divider only",
            render: () => (<div className="w-full">
          <p className="text-sm text-muted">Previous paragraph</p>
          <Divider />
          <p className="text-sm text-muted">Next paragraph</p>
        </div>),
        },
        {
            name: "Text centered",
            render: () => (<div className="w-full">
          <Divider>Hulian</Divider>
        </div>),
        },
        {
            name: "The text is offset to the left",
            render: () => (<div className="w-full">
          <Divider orientation="left">Latest updates</Divider>
        </div>),
        },
        {
            name: "The text is to the right",
            render: () => (<div className="w-full">
          <Divider orientation="right">More</Divider>
        </div>),
        },
        {
            name: "Dashed line",
            render: () => (<div className="w-full">
          <Divider dashed>Dotted line separation</Divider>
        </div>),
        },
        {
            name: "Inline vertical",
            render: () => (<div className="flex items-center text-sm text-foreground">
          <span>Documentation</span>
          <Divider type="vertical"/>
          <span>Components</span>
          <Divider type="vertical"/>
          <span>About</span>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-full">
      <Divider orientation={p.orientation as "left" | "center" | "right"} dashed={Boolean(p.dashed)} plain={Boolean(p.plain)}>
        {(p.children as string) || undefined}
      </Divider>
    </div>),
    toCode: (p) => `<Divider orientation="${p.orientation}"${p.dashed ? " dashed" : ""}${p.plain ? " plain" : ""}>${p.children}</Divider>`,
};
