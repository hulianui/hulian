"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ChevronDown, ChevronUp } from "../../../../packages/ui/src/_icons";
import { Button } from "../../../../packages/ui/src/button/button";
export const buttonShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default is a solid button; soft, outline, ghost, and link make five variants in all.",
            code: `<Button>Default</Button>
<Button variant="soft">Soft</Button>
<Button variant="outline">Stroke</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Text link</Button>`,
            render: () => (<>
          <Button>Default</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Stroke</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Text link</Button>
        </>),
        },
        {
            title: "Size",
            description: "xs / sm / md / lg \u2014 four heights: 24 / 32 / 40 / 48px.",
            code: `<Button size="xs">Extra small</Button>
<Button size="sm">small</Button>
<Button size="md">medium</Button>
<Button size="lg">Large</Button>`,
            render: () => (<>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </>),
        },
        {
            title: "Dense toolbar (the 24px xs size)",
            description: "Toolbars and table rows in an admin console are mostly 24px tall with a 12px font, so sm (32px) is one step too large for them. xs also tightens the radius and the icon gap, so no override classes are needed. Icon-only micro actions on the same row use iconXs (20px); the two are deliberately not the same height.",
            code: `<Button size="xs" variant="outline">Record</Button>
<Button size="xs" variant="outline">Replay</Button>
<Button size="xs" variant="soft">Filtered</Button>
<Button size="iconXs" variant="ghost" tone="neutral" aria-label="More">
  <ChevronDown className="size-4" />
</Button>`,
            render: () => (<div className="flex items-center gap-1 rounded-md border border-hairline bg-surface p-1">
          <Button size="xs" variant="outline">
            Record
          </Button>
          <Button size="xs" variant="outline">
            Replay
          </Button>
          <Button size="xs" variant="soft">
            Filtered
          </Button>
          <Button size="iconXs" variant="ghost" tone="neutral" aria-label="More">
            <ChevronDown className="size-4"/>
          </Button>
        </div>),
        },
        {
            title: "Icon sizes match text sizes",
            description: "The side length of iconSm/icon/iconLg matches the height of sm/md/lg respectively (32/40/48). Pair an icon size with the text size of the same name so the seam stays flush.",
            code: `<Button size="sm">small</Button>
<Button size="iconSm" aria-label="More"><ChevronDown className="size-4" /></Button>
<Button size="md">medium</Button>
<Button size="icon" aria-label="More"><ChevronDown className="size-4" /></Button>
<Button size="lg">Large</Button>
<Button size="iconLg" aria-label="More"><ChevronDown className="size-5" /></Button>`,
            render: () => (<>
          <Button size="sm">Small</Button>
          <Button size="iconSm" aria-label="More">
            <ChevronDown className="size-4"/>
          </Button>
          <Button size="md">Medium</Button>
          <Button size="icon" aria-label="More">
            <ChevronDown className="size-4"/>
          </Button>
          <Button size="lg">Large</Button>
          <Button size="iconLg" aria-label="More">
            <ChevronDown className="size-5"/>
          </Button>
        </>),
        },
        {
            title: "A 20px micro size for dense tables",
            description: "iconXs is a 20px square meant for expanders and small row actions inside a table: the smallest iconSm (32px) would push compact rows taller. It deliberately matches no text size, so do not pair it with sm.",
            code: `<Button variant="ghost" tone="neutral" size="iconXs" aria-label="Expand">
  <ChevronDown className="size-4" />
</Button>`,
            render: () => (<>
          <Button variant="ghost" tone="neutral" size="iconXs" aria-label="Expand">
            <ChevronDown className="size-4"/>
          </Button>
          <Button variant="outline" size="iconXs" aria-label="Expand">
            <ChevronDown className="size-4"/>
          </Button>
          <Button size="iconSm" aria-label="For comparison: iconSm at 32px">
            <ChevronDown className="size-4"/>
          </Button>
        </>),
        },
        {
            title: "Semantic tones",
            description: "tone says what kind of action this is, and it is orthogonal to variant. A solid neutral button is inverted, not grey.",
            code: `<Button>Submit</Button>
<Button tone="success">Approve</Button>
<Button tone="warning">Reject</Button>
<Button tone="danger">Delete</Button>
<Button tone="neutral">Skip</Button>`,
            render: () => (<>
          <Button>Submit</Button>
          <Button tone="success">Passed</Button>
          <Button tone="warning">Reject</Button>
          <Button tone="danger">Delete</Button>
          <Button tone="neutral">Skip</Button>
        </>),
        },
        {
            title: "Tone by variant",
            description: "The same tone in a different variant gives you the tinted, outlined, or ghost form, so none of them needs its own enum value.",
            code: `<Button tone="success" variant="outline">Approve</Button>
<Button tone="warning" variant="outline">Reject</Button>
<Button tone="danger" variant="outline">Delete</Button>
<Button tone="success" variant="ghost">Approve</Button>
<Button tone="danger" variant="link">Delete</Button>`,
            render: () => (<>
          <Button tone="success" variant="outline">
            Passed
          </Button>
          <Button tone="warning" variant="outline">
            Reject
          </Button>
          <Button tone="danger" variant="outline">
            Delete
          </Button>
          <Button tone="success" variant="ghost">
            Passed
          </Button>
          <Button tone="danger" variant="link">
            Delete
          </Button>
        </>),
        },
        {
            title: "Tinted semantic fill (soft)",
            description: "A tinted semantic background with matching text, weighted between outline and solid: a secondary primary action, the cancel half of a pair, or a stateful trigger that shows a filter is on. The fill derives from the semantic colour itself through opacity, so it follows whenever the brand colour changes.",
            code: `<Button variant="soft">Secondary action</Button>
<Button variant="soft" tone="success">Approve</Button>
<Button variant="soft" tone="warning">Reject</Button>
<Button variant="soft" tone="danger">Cancel</Button>
<Button variant="soft" tone="neutral">Skip</Button>`,
            render: () => (<>
          <Button variant="soft">Secondary action</Button>
          <Button variant="soft" tone="success">
            Passed
          </Button>
          <Button variant="soft" tone="warning">
            Reject
          </Button>
          <Button variant="soft" tone="danger">
            Cancel
          </Button>
          <Button variant="soft" tone="neutral">
            Skip
          </Button>
        </>),
        },
        {
            title: "The muted emphasis step",
            description: "The resting color drops one step to the secondary gray and returns to the tone's own color on hover. Secondary text links and icon buttons in dense rows want exactly this step - a ghost without muted is still body black, so existing call sites are unaffected. Only effective on ghost and link.",
            code: `<Button variant="ghost" size="xs" muted>Show log</Button>
<Button variant="link" muted>Clear</Button>
<Button variant="link" tone="danger" muted>Delete</Button>
<Button variant="ghost" size="xs">For contrast: normal emphasis</Button>`,
            render: () => (<>
          <Button variant="ghost" size="xs" muted>
            Show log
          </Button>
          <Button variant="link" muted>
            Clear
          </Button>
          <Button variant="link" tone="danger" muted>
            Delete
          </Button>
          <Button variant="ghost" size="xs">
            For contrast: normal emphasis
          </Button>
        </>),
        },
        {
            title: "tone=current inherits the container color",
            description: "Icon buttons inside a colored card should take the color of that container instead of being pulled back to body black. current means \"set no color, leave it to inheritance\", unlike the five semantic steps that all hand out an absolute color. Only effective on ghost and outline, and opt-in.",
            code: `<div className="text-green-700">
  <Button variant="ghost" size="iconXs" tone="current" aria-label="Move up">
    <ChevronUp className="size-3" />
  </Button>
</div>`,
            render: () => (<>
          <div className="inline-flex items-center gap-1 rounded-md border border-green-400 bg-green-100 p-2 text-green-700">
            <span className="text-xs font-medium">Inherits container</span>
            <Button variant="ghost" size="iconXs" tone="current" aria-label="Move up, inheriting the container color">
              <ChevronUp className="size-3"/>
            </Button>
          </div>
          <div className="inline-flex items-center gap-1 rounded-md border border-green-400 bg-green-100 p-2 text-green-700">
            <span className="text-xs font-medium">Control: default</span>
            <Button variant="ghost" size="iconXs" aria-label="Move up with the default color">
              <ChevronUp className="size-3"/>
            </Button>
          </div>
        </>),
        },
        {
            title: "Full width",
            description: "block stretches the button to the container width, for mobile primary actions and form footers.",
            code: `<Button block>Sign in</Button>
<Button block variant="outline">Use another method</Button>`,
            render: () => (<div className="w-full max-w-xs space-y-2">
          <Button block>Login</Button>
          <Button block variant="outline">
            Use another method
          </Button>
        </div>),
        },
        {
            title: "Loading and disabling",
            description: "loading disables the button and shows a spinner.",
            code: `<Button loading>Loading</Button>
<Button disabled>Disabled</Button>`,
            render: () => (<>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </>),
        },
    ],
    controls: [
        {
            prop: "variant",
            type: "select",
            options: ["solid", "soft", "outline", "ghost", "link"],
            defaultValue: "solid",
        },
        {
            prop: "tone",
            type: "select",
            options: ["brand", "success", "warning", "danger", "neutral"],
            defaultValue: "brand",
        },
        {
            prop: "size",
            type: "select",
            options: ["xs", "sm", "md", "lg", "icon", "iconSm", "iconLg", "iconXs"],
            defaultValue: "md",
        },
        { prop: "block", type: "boolean", defaultValue: false, label: "Full width" },
        { prop: "loading", type: "boolean", defaultValue: false },
        { prop: "children", type: "text", defaultValue: "Hulian Button", label: "Copywriting" },
    ],
    states: [
        { name: "default", render: () => <Button>Default</Button> },
        { name: "xs", render: () => <Button size="xs">Dense size</Button> },
        { name: "soft", render: () => <Button variant="soft">Soft</Button> },
        {
            name: "soft-danger",
            render: () => (<Button variant="soft" tone="danger">
          Cancel
        </Button>),
        },
        { name: "outline", render: () => <Button variant="outline">Stroke</Button> },
        { name: "ghost", render: () => <Button variant="ghost">Ghost</Button> },
        { name: "link", render: () => <Button variant="link">Text link</Button> },
        { name: "success", render: () => <Button tone="success">Passed</Button> },
        { name: "warning", render: () => <Button tone="warning">Reject</Button> },
        { name: "danger", render: () => <Button tone="danger">Danger</Button> },
        { name: "neutral", render: () => <Button tone="neutral">Skip</Button> },
        { name: "disabled", render: () => <Button disabled>Disabled</Button> },
        { name: "loading", render: () => <Button loading>Loading</Button> },
    ],
    renderWithProps: (p) => (<Button variant={p.variant as "solid" | "soft" | "outline" | "ghost" | "link"} tone={p.tone as "brand" | "success" | "warning" | "danger" | "neutral"} size={p.size as "xs" | "sm" | "md" | "lg" | "icon" | "iconSm" | "iconLg" | "iconXs"} block={p.block as boolean} loading={p.loading as boolean}>
      {p.children as string}
    </Button>),
    toCode: (p) => `<Button variant="${p.variant}" tone="${p.tone}" size="${p.size}"${p.block ? " block" : ""}${p.loading ? " loading" : ""}>${p.children}</Button>`,
};
