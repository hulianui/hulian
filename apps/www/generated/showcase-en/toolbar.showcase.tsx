"use client";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Share2 } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Toolbar, ToolbarButton, ToolbarToggle, ToolbarGroup, ToolbarSeparator } from "../../../../packages/ui/src/toolbar/toolbar";
function Demo() {
    return (<Toolbar aria-label="Text format">
      <ToolbarGroup>
        <ToolbarToggle aria-label="Bold" defaultPressed><Bold className="size-4"/></ToolbarToggle>
        <ToolbarToggle aria-label="Italic"><Italic className="size-4"/></ToolbarToggle>
        <ToolbarToggle aria-label="Underline"><Underline className="size-4"/></ToolbarToggle>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ToolbarToggle aria-label="Align left" defaultPressed><AlignLeft className="size-4"/></ToolbarToggle>
        <ToolbarToggle aria-label="Centered"><AlignCenter className="size-4"/></ToolbarToggle>
        <ToolbarToggle aria-label="Align right"><AlignRight className="size-4"/></ToolbarToggle>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarButton aria-label="Share"><Share2 className="size-4"/>Share</ToolbarButton>
    </Toolbar>);
}
export const toolbarShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "role=toolbar Container built-in keyboard roaming (arrow keys move focus). ToolbarButton is an ordinary button.",
            code: `<Toolbar aria-label="Text Format">
  <ToolbarButton aria-label="Share"><Share2 className="size-4" />Share</ToolbarButton>
</Toolbar>`,
            render: () => (<Toolbar aria-label="Text format">
          <ToolbarButton aria-label="Share">
            <Share2 className="size-4"/>
            Share
          </ToolbarButton>
        </Toolbar>),
        },
        {
            title: "Switchable button",
            description: "ToolbarToggle is an uncontrolled switch, and defaultPressed is set to be initially selected. The selected state is filled with the main color, which is different from hover.",
            code: `<Toolbar aria-label="Text Format">
  <ToolbarToggle aria-label="Bold" defaultPressed><Bold className="size-4" /></ToolbarToggle>
  <ToolbarToggle aria-label="italic"><Italic className="size-4" /></ToolbarToggle>
  <ToolbarToggle aria-label="underline"><Underline className="size-4" /></ToolbarToggle>
</Toolbar>`,
            render: () => (<Toolbar aria-label="Text format">
          <ToolbarToggle aria-label="Bold" defaultPressed>
            <Bold className="size-4"/>
          </ToolbarToggle>
          <ToolbarToggle aria-label="Italic">
            <Italic className="size-4"/>
          </ToolbarToggle>
          <ToolbarToggle aria-label="Underline">
            <Underline className="size-4"/>
          </ToolbarToggle>
        </Toolbar>),
        },
        {
            title: "Group + Delimiter",
            description: "ToolbarGroup aggregates related buttons, ToolbarSeparator inserts vertical lines between groups.",
            code: `<Toolbar aria-label="Text Format">
  <ToolbarGroup>
    <ToolbarToggle aria-label="Bold" defaultPressed><Bold className="size-4" /></ToolbarToggle>
    <ToolbarToggle aria-label="italic"><Italic className="size-4" /></ToolbarToggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup>
    <ToolbarToggle aria-label="Left justified" defaultPressed><AlignLeft className="size-4" /></ToolbarToggle>
    <ToolbarToggle aria-label="center"><AlignCenter className="size-4" /></ToolbarToggle>
    <ToolbarToggle aria-label="right-justified"><AlignRight className="size-4" /></ToolbarToggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarButton aria-label="Share"><Share2 className="size-4" />Share</ToolbarButton>
</Toolbar>`,
            render: () => <Demo />,
        },
    ],
    controls: [],
    states: [{ name: "default", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<Toolbar aria-label="Text Format">
  <ToolbarGroup>
    <ToolbarToggle aria-label="Bold" defaultPressed><Bold /></ToolbarToggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarButton aria-label="Share"><Share2 />Share</ToolbarButton>
</Toolbar>`,
};
