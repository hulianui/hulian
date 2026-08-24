"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Text } from "../../../../packages/ui/src/text/text";
import type { TextFamily, TextSize, TextTone, TextWeight } from "../../../../packages/ui/src/text/text.types";
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
<Text size="xl">xl Instructions</Text>`,
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
            title: "Font family and numerals",
            description: "family switches between sans and mono; numeric aligns changing-width numerals. Omit family to inherit the surrounding font.",
            code: `<Text family="sans">Sans body label</Text>
<Text family="mono">Mono code label</Text>
<Text>Changing widths: 11,111.11 \u2192 88,888.88</Text>
<Text numeric>Changing widths: 11,111.11 \u2192 88,888.88</Text>`,
            render: () => (<div className="flex flex-col gap-1.5">
          <Text family="sans">Sans body label</Text>
          <Text family="mono">Mono code label</Text>
          <Text>Changing widths: 11,111.11 → 88,888.88</Text>
          <Text numeric>Changing widths: 11,111.11 → 88,888.88</Text>
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
        {
            prop: "family",
            type: "select",
            options: ["inherit", "sans", "mono"],
            defaultValue: "inherit",
            label: "Font family",
        },
        { prop: "numeric", type: "boolean", defaultValue: false, label: "Tabular numerals" },
        { prop: "truncate", type: "boolean", defaultValue: false, label: "Single line omitted" },
    ],
    states: [
        {
            name: "Hue (semantic token, light and dark self-adaptation)",
            render: () => (<div className="flex flex-col gap-1.5">
          <Text>Default text default · text-foreground</Text>
          <Text tone="muted">Auxiliary instructions muted · text-muted-foreground</Text>
          <Text tone="primary">Emphasis text primary · text-primary</Text>
          <Text tone="success">Successful result success · text-success</Text>
          <Text tone="warning">Pay attention to the warning · text-warning</Text>
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
            name: "Font family and tabular numerals",
            render: () => (<div className="flex flex-col gap-1.5">
          <Text family="sans">sans · body label</Text>
          <Text family="mono">mono · code label</Text>
          <Text>11,111.11 → 88,888.88 (proportional numerals)</Text>
          <Text numeric>11,111.11 → 88,888.88 (tabular numerals)</Text>
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
    renderWithProps: (p) => (<Text tone={p.tone as TextTone} size={p.size as TextSize} weight={p.weight as TextWeight} family={p.family === "inherit" ? undefined : (p.family as TextFamily)} numeric={Boolean(p.numeric)} truncate={Boolean(p.truncate)} className={p.truncate ? "max-w-xs" : undefined}>
      {p.truncate ? longLine : "Hulian Text Polymorphic text primitive"}
    </Text>),
    toCode: (p) => {
        const attrs = [
            p.tone !== "default" ? ` tone="${p.tone}"` : "",
            p.size !== "base" ? ` size="${p.size}"` : "",
            p.weight !== "normal" ? ` weight="${p.weight}"` : "",
            p.family && p.family !== "inherit" ? ` family="${p.family}"` : "",
            p.numeric ? " numeric" : "",
            p.truncate ? " truncate" : "",
        ].join("");
        return `<Text${attrs}>Hulian Text Polymorphic text primitive</Text>`;
    },
};
