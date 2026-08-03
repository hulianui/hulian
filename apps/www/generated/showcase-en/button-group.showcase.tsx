"use client";
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, ChevronDown, Plus, Minus } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ButtonGroup } from "../../../../packages/ui/src/button-group/button-group";
import { Button } from "../../../../packages/ui/src/button/button";
export const buttonGroupShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Continuous row icon group",
            description: "Default attached: The sub-buttons are integrated into one, the inner corners are smoothed, and the borders are merged. Subitem variant recommends the same.",
            code: `<ButtonGroup aria-label="Alignment">
  <Button variant="outline" size="icon" aria-label="Left aligned"><AlignLeft className="size-4" /></Button>
  <Button variant="outline" size="icon" aria-label="center"><AlignCenter className="size-4" /></Button>
  <Button variant="outline" size="icon" aria-label="right aligned"><AlignRight className="size-4" /></Button>
</ButtonGroup>`,
            render: () => (<ButtonGroup aria-label="Alignment">
          <Button variant="outline" size="icon" aria-label="Align left"><AlignLeft className="size-4"/></Button>
          <Button variant="outline" size="icon" aria-label="Centered"><AlignCenter className="size-4"/></Button>
          <Button variant="outline" size="icon" aria-label="Align right"><AlignRight className="size-4"/></Button>
        </ButtonGroup>),
        },
        {
            title: "Icon + text segmentation",
            description: "Toolbar-style segmented operation, with copywriting for each segment icon.",
            code: `<ButtonGroup aria-label="Text Format">
  <Button variant="outline"><Bold className="size-4" />Bold</Button>
  <Button variant="outline"><Italic className="size-4" />italic</Button>
  <Button variant="outline"><Underline className="size-4" />underscore</Button>
</ButtonGroup>`,
            render: () => (<ButtonGroup aria-label="Text format">
          <Button variant="outline"><Bold className="size-4"/>Bold</Button>
          <Button variant="outline"><Italic className="size-4"/>Italic</Button>
          <Button variant="outline"><Underline className="size-4"/>Underline</Button>
        </ButtonGroup>),
        },
        {
            title: "Split button",
            description: "Main operation + a drop-down triggered \"More\", commonly seen in save/submit scenarios.",
            code: `<ButtonGroup aria-label="Save">
  <Button>Save</Button>
  <Button size="icon" aria-label="More saving options"><ChevronDown className="size-4" /></Button>
</ButtonGroup>`,
            render: () => (<ButtonGroup aria-label="Save">
          <Button>Save</Button>
          <Button size="icon" aria-label="More saving options"><ChevronDown className="size-4"/></Button>
        </ButtonGroup>),
        },
        {
            title: "Vertically arranged",
            description: "orientation=\"vertical\" Change to upper and lower rows, smooth the upper and lower inner fillets.",
            code: `<ButtonGroup orientation="vertical" aria-label="Tools">
  <Button variant="outline">Copy</Button>
  <Button variant="outline">Paste</Button>
  <Button variant="outline">Delete</Button>
</ButtonGroup>`,
            render: () => (<ButtonGroup orientation="vertical" aria-label="Tools">
          <Button variant="outline">Copy</Button>
          <Button variant="outline">Paste</Button>
          <Button variant="outline">Delete</Button>
        </ButtonGroup>),
        },
        {
            title: "Separate grouping",
            description: "When attached={false}, gap is left between the sub-buttons, which is only used for semantic/alignment grouping and does not fit.",
            code: `<ButtonGroup attached={false} aria-label="Operation">
  <Button variant="outline">Cancel</Button>
  <Button>OK</Button>
</ButtonGroup>`,
            render: () => (<ButtonGroup attached={false} aria-label="Actions">
          <Button variant="outline">Cancel</Button>
          <Button>OK</Button>
        </ButtonGroup>),
        },
    ],
    controls: [
        { prop: "orientation", type: "select", options: ["horizontal", "vertical"], defaultValue: "horizontal" },
        { prop: "attached", type: "boolean", defaultValue: true },
    ],
    states: [
        {
            name: "Continuous row (outline)",
            render: () => (<ButtonGroup aria-label="Alignment">
          <Button variant="outline" size="icon" aria-label="Align left"><AlignLeft className="size-4"/></Button>
          <Button variant="outline" size="icon" aria-label="Centered"><AlignCenter className="size-4"/></Button>
          <Button variant="outline" size="icon" aria-label="Align right"><AlignRight className="size-4"/></Button>
        </ButtonGroup>),
        },
        {
            name: "Text + icon segmentation",
            render: () => (<ButtonGroup aria-label="Text format">
          <Button variant="outline"><Bold className="size-4"/>Bold</Button>
          <Button variant="outline"><Italic className="size-4"/>Italic</Button>
          <Button variant="outline"><Underline className="size-4"/>Underline</Button>
        </ButtonGroup>),
        },
        {
            name: "Split Button (Main Action + More)",
            render: () => (<ButtonGroup aria-label="Save">
          <Button>Save</Button>
          <Button size="icon" aria-label="More saving options"><ChevronDown className="size-4"/></Button>
        </ButtonGroup>),
        },
        {
            name: "Stepper",
            render: () => (<ButtonGroup aria-label="Quantity">
          <Button variant="outline" size="icon" aria-label="Reduce"><Minus className="size-4"/></Button>
          <Button variant="outline" className="pointer-events-none min-w-12 tabular-nums">3</Button>
          <Button variant="outline" size="icon" aria-label="Added"><Plus className="size-4"/></Button>
        </ButtonGroup>),
        },
        {
            name: "Portrait",
            render: () => (<ButtonGroup orientation="vertical" aria-label="Tools">
          <Button variant="outline">Copy</Button>
          <Button variant="outline">Paste</Button>
          <Button variant="outline">Delete</Button>
        </ButtonGroup>),
        },
        {
            name: "Separation (attached=false)",
            render: () => (<ButtonGroup attached={false} aria-label="Actions">
          <Button variant="outline">Cancel</Button>
          <Button>OK</Button>
        </ButtonGroup>),
        },
    ],
    renderWithProps: (p) => (<ButtonGroup orientation={(p.orientation as "horizontal" | "vertical") ?? "horizontal"} attached={p.attached as boolean} aria-label="Example">
      <Button variant="outline">1</Button>
      <Button variant="outline">2</Button>
      <Button variant="outline">Three</Button>
    </ButtonGroup>),
    toCode: (p) => `<ButtonGroup${p.orientation && p.orientation !== "horizontal" ? ` orientation="${p.orientation}"` : ""}${p.attached === false ? " attached={false}" : ""}>
  <Button variant="outline">one</Button>
  <Button variant="outline">two</Button>
  <Button variant="outline">three</Button>
</ButtonGroup>`,
};
