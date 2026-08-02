"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Text } from "../../../../packages/ui/src/text/text";
import type { TextSize, TextTone, TextWeight } from "../../../../packages/ui/src/text/text.types";
const longLine = "The Text component of Hulian Design System supports single-line ellipsis and multi-line truncation. This text is long enough to trigger the truncation effect and observe the ellipsis position.";
export const textShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Semantic Hue",
            description: "tone adopts semantic token, and automatically adapts the light and dark themes.",
            code: `<Text>Default text</Text>
<Text tone="muted">Auxiliary instructions</Text>
<Text tone="primary">Emphasis text</Text>
<Text tone="success">Successful result</Text>
<Text tone="warning">Pay attention to the warning</Text>
<Text tone="danger">Danger Tip</Text>`,
            render: () => (<div className="flex flex-col gap-1.5">
          <Text>Default text</Text>
          <Text tone="muted">Auxiliary instructions</Text>
          <Text tone="primary">Emphasis text</Text>
          <Text tone="success">Successful result</Text>
          <Text tone="warning">Heed the warning</Text>
          <Text tone="danger">Danger warning</Text>
        </div>),
        },
        {
            title: "Font size ladder",
            description: "size Offers xs/sm/base/lg/xl five speeds.",
            code: `<Text size="xs">xs Minimal Assist</Text>
<Text size="sm">sm Minor</Text>
<Text size="base">base text benchmark</Text>
<Text size="lg">lg Large text</Text>
<Text size="xl">xl Introduction</Text>`,
            render: () => (<div className="flex flex-col gap-1.5">
          <Text size="xs">xs Minimal Assist</Text>
          <Text size="sm">sm Minor</Text>
          <Text size="base">base Text benchmark</Text>
          <Text size="lg">lg Large text</Text>
          <Text size="xl">xl Introduction</Text>
        </div>),
        },
        {
            title: "Font weight",
            description: "weight Offers normal/medium/semibold/bold.",
            code: `<Text weight="normal">General</Text>
<Text weight="medium">Medium</Text>
<Text weight="semibold">Semi-coarse</Text>
<Text weight="bold">Bold</Text>`,
            render: () => (<div className="flex flex-col gap-1.5">
          <Text weight="normal">General</Text>
          <Text weight="medium">Medium</Text>
          <Text weight="semibold">Half thick</Text>
          <Text weight="bold">bold</Text>
        </div>),
        },
        {
            title: "Single line ellipsis",
            description: "truncate Single lines are truncated and ellipses are displayed when the container is narrowed.",
            code: `<div className="max-w-xs">
  <Text truncate>{longLine}</Text>
</div>`,
            render: () => (<div className="max-w-xs">
          <Text truncate>{longLine}</Text>
        </div>),
        },
        {
            title: "Multi-line truncation",
            description: "lineClamp is restricted to n and is omitted after the line, taking precedence over truncate.",
            code: `<div className="max-w-xs">
  <Text tone="muted" lineClamp={2}>{longText}</Text>
</div>`,
            render: () => (<div className="max-w-xs">
          <Text tone="muted" lineClamp={2}>
            {longLine}
            {longLine}
          </Text>
        </div>),
        },
    ],
    controls: [
        {
            prop: "tone",
            type: "select",
            options: ["default", "muted", "primary", "success", "warning", "danger"],
            defaultValue: "default",
            label: "Hue",
        },
        {
            prop: "size",
            type: "select",
            options: ["xs", "sm", "base", "lg", "xl"],
            defaultValue: "base",
            label: "Font size",
        },
        {
            prop: "weight",
            type: "select",
            options: ["normal", "medium", "semibold", "bold"],
            defaultValue: "normal",
            label: "Font weight",
        },
        { prop: "truncate", type: "boolean", defaultValue: false, label: "Single line omitted" },
    ],
    states: [
        {
            name: "Hue (semantic token, light and dark self-adaptation)",
            render: () => (<div className="flex flex-col gap-1.5">
          <Text>Default text default · text-foreground</Text>
          <Text tone="muted">Auxiliary instructions muted · text-muted</Text>
          <Text tone="primary">Emphasis text primary · text-primary</Text>
          <Text tone="success">Successful result success · text-success</Text>
          <Text tone="warning">Pay attention to the warning warning · text-warning</Text>
          <Text tone="danger">Danger warning danger · text-danger</Text>
        </div>),
        },
        {
            name: "Font size ladder",
            render: () => (<div className="flex flex-col gap-1.5">
          <Text size="xs">xs · Minimum auxiliary font size</Text>
          <Text size="sm">sm · Secondary font size</Text>
          <Text size="base">base · Text benchmark</Text>
          <Text size="lg">lg · Large text</Text>
          <Text size="xl">xl · Guide font size</Text>
        </div>),
        },
        {
            name: "Single line ellipsis (container narrowing)",
            render: () => (<div className="max-w-xs">
          <Text truncate>{longLine}</Text>
        </div>),
        },
        {
            name: "Multi-line truncation (lineClamp=2)",
            render: () => (<div className="max-w-xs">
          <Text tone="muted" lineClamp={2}>
            {longLine}
            {longLine}
          </Text>
        </div>),
        },
    ],
    renderWithProps: (p) => (<Text tone={p.tone as TextTone} size={p.size as TextSize} weight={p.weight as TextWeight} truncate={Boolean(p.truncate)} className={p.truncate ? "max-w-xs" : undefined}>
      {p.truncate ? longLine : "Hulian Text Polymorphic text primitive"}
    </Text>),
    toCode: (p) => {
        const attrs = [
            p.tone !== "default" ? ` tone="${p.tone}"` : "",
            p.size !== "base" ? ` size="${p.size}"` : "",
            p.weight !== "normal" ? ` weight="${p.weight}"` : "",
            p.truncate ? " truncate" : "",
        ].join("");
        return `<Text${attrs}>Hulian Text Polymorphic text primitive</Text>`;
    },
};
