"use client";
import { useEffect, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LogViewer } from "../../../../packages/ui/src/log-viewer/log-viewer";
import type { LogLine } from "../../../../packages/ui/src/log-viewer/log-viewer.types";
const STATIC: LogLine[] = [
    { level: "command", timestamp: "12:00:01", message: "\u25B8 npm run build" },
    { level: "debug", timestamp: "12:00:01", source: "[turbo]", message: "scope: 1 package" },
    { level: "info", timestamp: "12:00:02", message: "compiling 248 modules\u2026" },
    { level: "warn", timestamp: "12:00:05", source: "[ts]", message: "unused var 'x' at app.tsx:42" },
    { level: "success", timestamp: "12:00:09", message: "\u2713 compiled in 8.1s" },
    { level: "error", timestamp: "12:00:10", source: "[lint]", message: "2 problems (1 error, 1 warning)" },
];
const STREAM: LogLine[] = [
    { level: "info", timestamp: "12:00:01", message: "Allocating sandbox\u2026" },
    { level: "success", timestamp: "12:00:01", message: "\u2713 microVM ready (180ms)" },
    { level: "info", timestamp: "12:00:02", message: "Restoring snapshot\u2026" },
    { level: "success", timestamp: "12:00:03", message: "\u2713 snapshot restored (820ms)" },
    { level: "info", timestamp: "12:00:03", message: "Mounting ephemeral FS\u2026" },
    { level: "success", timestamp: "12:00:04", message: "\u2713 FS mounted (620ms)" },
    { level: "info", timestamp: "12:00:04", message: "Booting Node 26\u2026" },
    { level: "success", timestamp: "12:00:05", message: "\u2713 runtime up (1082ms)" },
    { level: "info", timestamp: "12:00:05", message: "Executing main.js\u2026" },
    { level: "warn", timestamp: "12:00:06", message: "deprecation: fs.rmdir recursive" },
    { level: "success", timestamp: "12:00:07", message: "\u2713 exit 0 (240ms)" },
];
function StreamDemo() {
    const [n, setN] = useState(2);
    useEffect(() => {
        if (n >= STREAM.length)
            return;
        const id = setTimeout(() => setN((c) => c + 1), 700);
        return () => clearTimeout(id);
    }, [n]);
    return <LogViewer lines={STREAM.slice(0, n)} showTimestamp height={220}/>;
}
export const logViewerShowcase: ShowcaseSpec = {
    controls: [],
    examples: [
        {
            title: "Basic usage",
            description: "lines Data-driven rendering, level fields colored by level (info/warn/error/success/command).",
            code: `<LogViewer
  lines={[
    { level: "command", message: "\u25B8 npm run build" },
    { level: "info", message: "compiling 248 modules\u2026" },
    { level: "success", message: "\u2713 compiled in 8.1s" },
    { level: "error", message: "2 problems (1 error, 1 warning)" },
  ]}
/>`,
            render: () => (<LogViewer height={160} lines={[
                    { level: "command", message: "\u25B8 npm run build" },
                    { level: "info", message: "compiling 248 modules\u2026" },
                    { level: "success", message: "\u2713 compiled in 8.1s" },
                    { level: "error", message: "2 problems (1 error, 1 warning)" },
                ]}/>),
        },
        {
            title: "timestamp + source prefix",
            description: "showTimestamp renders the timestamp at the beginning of the line; line.source weakens the rendering before the main text.",
            code: `<LogViewer
  showTimestamp
  lines={[
    { level: "command", timestamp: "12:00:01", message: "\u25B8 npm run build" },
    { level: "warn", timestamp: "12:00:05", source: "[ts]", message: "unused var 'x' at app.tsx:42" },
    { level: "success", timestamp: "12:00:09", message: "\u2713 compiled in 8.1s" },
  ]}
/>`,
            render: () => <LogViewer lines={STATIC} showTimestamp height={220}/>,
        },
        {
            title: "Streaming append (automatically stick to the bottom)",
            description: "autoScroll is enabled by default, and new lines are appended to the bottom; the running logic is left on the consumer side, and the component is only rendered.",
            code: `<LogViewer lines={lines} showTimestamp height={220} />`,
            render: () => <StreamDemo />,
        },
        {
            title: "Wrap mode",
            description: "wrap After opening, long lines will wrap instead of horizontal scrolling, and the entire text can be read even in narrow containers.",
            code: `<LogViewer
  wrap
  lines={[
    { level: "error", message: "Error: connect ECONNREFUSED 127.0.0.1:5432 ...This is a very long log" },
  ]}
/>`,
            render: () => (<LogViewer wrap height={140} lines={[
                    { level: "error", message: "Error: connect ECONNREFUSED 127.0.0.1:5432 at TCPConnectWrap.afterConnect \u2014 This is a very long log, wrap After opening, it will wrap lines instead of scrolling horizontally, ensuring that it can be read in a narrow container." },
                ]}/>),
        },
    ],
    states: [
        { name: "Build log (multi-level + timestamp)", render: () => <LogViewer lines={STATIC} showTimestamp height={220}/> },
        { name: "Streaming append (automatically stick to the bottom)", render: () => <StreamDemo /> },
        { name: "Wrap mode", render: () => (<LogViewer wrap height={140} lines={[
                    { level: "error", message: "Error: connect ECONNREFUSED 127.0.0.1:5432 at TCPConnectWrap.afterConnect \u2014 This is a very long log, wrap After opening, it will wrap lines instead of scrolling horizontally, ensuring that it can be read in a narrow container." },
                ]}/>) },
    ],
    renderWithProps: () => <LogViewer lines={STATIC} showTimestamp height={220}/>,
    toCode: () => `<LogViewer
  lines={[{ level: "command", timestamp: "12:00:01", message: "\u25B8 npm run build" }, \u2026]}
  showTimestamp
/>`,
};
