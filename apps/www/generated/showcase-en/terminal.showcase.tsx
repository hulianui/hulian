"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Terminal } from "../../../../packages/ui/src/terminal/terminal";
import type { TerminalLine } from "../../../../packages/ui/src/terminal/terminal.types";
const lines: TerminalLine[] = [
    { prompt: "$", text: "pnpm add @hulianui/ui", tone: "command" },
    { text: "Packages: +1", tone: "muted" },
    { text: "Progress: resolved 1, reused 1, done", tone: "muted" },
    { text: "\u2713 Installation completed", tone: "success" },
    { prompt: "$", text: "pnpm dev", tone: "command" },
    { text: "\u25B2 Next.js ready on http://localhost:5512", tone: "muted" },
];
const plainLines: TerminalLine[] = [
    { prompt: "$", text: "echo hello world", tone: "command" },
    { text: "hello world", tone: "muted" },
];
export const terminalShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "lines is rendered line by line, and when mounted, it fades in the order of lineDelay.",
            code: `<Terminal
  lines={[
    { prompt: "$", text: "pnpm add @hulianui/ui", tone: "command" },
    { text: "\u2713 Installation completed", tone: "success" },
  ]}
/>`,
            render: () => (<Terminal lines={[
                    { prompt: "$", text: "pnpm add @hulianui/ui", tone: "command" },
                    { text: "\u2713 Installation completed", tone: "success" },
                ]}/>),
        },
        {
            title: "Customize title and reveal cadence",
            description: "title changes the window title bar text, lineDelay adjusts the display interval of adjacent rows.",
            code: `<Terminal
  title="zsh"
  lineDelay={0.6}
  lines={[
    { prompt: "$", text: "pnpm dev", tone: "command" },
    { text: "\u25B2 Next.js ready on http://localhost:5512", tone: "muted" },
  ]}
/>`,
            render: () => (<Terminal title="zsh" lineDelay={0.6} lines={[
                    { prompt: "$", text: "pnpm dev", tone: "command" },
                    { text: "\u25B2 Next.js ready on http://localhost:5512", tone: "muted" },
                ]}/>),
        },
        {
            title: "Turn off syntax coloring",
            description: "highlight={false} does not split the word coloring, and the whole line is tone color.",
            code: `<Terminal
  highlight={false}
  lines={[
    { prompt: "$", text: "echo hello world", tone: "command" },
    { text: "hello world", tone: "muted" },
  ]}
/>`,
            render: () => <Terminal highlight={false} lines={plainLines}/>,
        },
    ],
    controls: [],
    states: [{ name: "default", render: () => <Terminal lines={lines}/> }],
    renderWithProps: () => <Terminal lines={lines}/>,
    toCode: () => `<Terminal
  lines={[
    { prompt: "$", text: "pnpm dev" },
    { text: "ready", tone: "muted" },
  ]}
/>`,
};
