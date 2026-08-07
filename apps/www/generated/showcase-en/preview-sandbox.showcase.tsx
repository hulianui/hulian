"use client";
import { useState, type ReactNode } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { useComponentLocale } from "../../../../packages/ui/src/config/locale-context";
import { Button } from "../../../../packages/ui/src/button";
import { PreviewSandbox } from "../../../../packages/ui/src/preview-sandbox/preview-sandbox";
import type { PreviewSandboxDevice } from "../../../../packages/ui/src/preview-sandbox/preview-sandbox.types";
const PAGE = `<!doctype html>
<html>
<head><style>
  body { margin: 0; font-family: system-ui, sans-serif; background: #0b1220; color: #e2e8f0; }
  .hero { padding: 56px 40px; }
  h1 { margin: 0 0 12px; font-size: 34px; line-height: 1.2; }
  p { margin: 0; color: #94a3b8; font-size: 15px; }
  .cta { margin-top: 28px; display: inline-block; padding: 10px 18px; border-radius: 8px;
         background: #6366f1; color: #fff; font-size: 14px; }
  @media (max-width: 520px) { .hero { padding: 32px 20px; } h1 { font-size: 24px; } }
</style></head>
<body>
  <div class="hero">
    <h1>Generated landing page</h1>
    <p>This document runs inside a sandboxed iframe.</p>
    <div class="cta">Get started</div>
  </div>
</body>
</html>`;
const CRASHING = `<!doctype html>
<html>
<head><style>
  body { margin: 0; font-family: system-ui; padding: 24px; }
  button { padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; }
</style></head>
<body>
  <p>Rendered fine. Click to make the script throw.</p>
  <button onclick="setTimeout(function () { throw new Error('undefined is not a function'); }, 0)">
    Trigger a runtime error
  </button>
</body>
</html>`;
const Frame = ({ children }: {
    children: ReactNode;
}) => (<div className="h-[420px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
    {children}
  </div>);
const DEVICES: PreviewSandboxDevice[] = ["desktop", "iphone", "android", "tablet", "watch"];
const DeviceDemo = () => {
    const [device, setDevice] = useState<PreviewSandboxDevice>("iphone");
    const deviceNames = useComponentLocale().previewSandbox?.devices;
    return (<div className="w-full space-y-3">
      <div className="flex flex-wrap gap-2">
        {DEVICES.map((item) => (<Button key={item} size="sm" variant={item === device ? "solid" : "outline"} onClick={() => setDevice(item)}>
            {deviceNames?.[item] ?? item}
          </Button>))}
      </div>
      <Frame>
        <PreviewSandbox code={PAGE} device={device} showDeviceFrame/>
      </Frame>
    </div>);
};
const Boom = ({ armed }: {
    armed: boolean;
}) => {
    if (armed)
        throw new Error("Cannot read properties of undefined (reading 'map')");
    return (<div className="grid h-full place-items-center p-6 text-sm text-muted">
      Subtree rendering normally
    </div>);
};
const ReactModeDemo = () => {
    const [armed, setArmed] = useState(false);
    return (<div className="w-full space-y-3">
      <Button size="sm" variant="outline" onClick={() => setArmed(true)} disabled={armed}>
        Throw inside the subtree
      </Button>
      <Frame>
        <PreviewSandbox device={{ width: 480, height: 320 }}>
          <Boom armed={armed}/>
        </PreviewSandbox>
      </Frame>
    </div>);
};
const Basic = () => (<Frame>
    <PreviewSandbox code={PAGE}/>
  </Frame>);
export const previewSandboxShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass a complete HTML document string as code and it goes straight into the iframe srcDoc. It renders at the desktop viewport by default and scales down until it fits the container.",
            code: `<div className="h-[420px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
  <PreviewSandbox code={html} />
</div>`,
            render: () => <Basic />,
        },
        {
            title: "Device switch and frame",
            description: "Switching devices only resizes the box: the iframe node and its document are never rebuilt, so state inside the preview survives. Phone and tablet presets can also wear a device frame.",
            code: `const [device, setDevice] = useState("iphone");

<PreviewSandbox code={html} device={device} showDeviceFrame />`,
            render: () => <DeviceDemo />,
        },
        {
            title: "Runtime errors and retry",
            description: "Click the button in the preview to make the script throw: the injected bootstrap posts the error back to the host, the error state covers the preview, and Retry reloads the document.",
            code: `<PreviewSandbox
  code={crashingHtml}
  onError={(e) => console.warn(e.source, e.message)}
/>`,
            render: () => (<Frame>
          <PreviewSandbox code={CRASHING}/>
        </Frame>),
        },
        {
            title: "Same-document mode",
            description: "Pass children instead of code: the subtree renders in the current document behind a real React error boundary, and the error object has the same shape as in iframe mode. Click the button to make the subtree throw and see the error state.",
            code: `<PreviewSandbox device={{ width: 480, height: 320 }}>
  <YourComponent />
</PreviewSandbox>`,
            render: () => <ReactModeDemo />,
        },
    ],
    controls: [
        {
            prop: "device",
            type: "select",
            options: ["desktop", "iphone", "android", "tablet"],
            defaultValue: "iphone",
        },
        { prop: "showDeviceFrame", type: "boolean", defaultValue: true },
    ],
    states: [
        { name: "Desktop viewport", render: () => <Basic /> },
        { name: "Device switch", render: () => <DeviceDemo /> },
        {
            name: "Runtime error (click to trigger)",
            render: () => (<Frame>
          <PreviewSandbox code={CRASHING}/>
        </Frame>),
        },
    ],
    renderWithProps: (props) => (<Frame>
      <PreviewSandbox code={PAGE} device={(props.device as PreviewSandboxDevice) ?? "iphone"} showDeviceFrame={props.showDeviceFrame !== false}/>
    </Frame>),
    toCode: (props) => `<PreviewSandbox code={html} device="${props.device ?? "iphone"}"${props.showDeviceFrame === false ? "" : " showDeviceFrame"} />`,
};
