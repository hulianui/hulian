"use client";
import { useState, type ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { PreviewSandbox } from "./preview-sandbox";
import type { PreviewSandboxDevice } from "./preview-sandbox.types";

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
<head><style>body { margin: 0; font-family: system-ui; padding: 24px; }</style></head>
<body>
  <p>Rendered, then the script throws.</p>
  <script>setTimeout(function () { throw new Error("undefined is not a function"); }, 0);</script>
</body>
</html>`;

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="h-[420px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
    {children}
  </div>
);

const DEVICES: PreviewSandboxDevice[] = ["desktop", "iphone", "android", "tablet"];

const DeviceDemo = () => {
  const [device, setDevice] = useState<PreviewSandboxDevice>("iphone");
  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap gap-2">
        {DEVICES.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={item === device ? "solid" : "outline"}
            onClick={() => setDevice(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <Frame>
        <PreviewSandbox code={PAGE} device={device} showDeviceFrame />
      </Frame>
    </div>
  );
};

const Boom = () => {
  throw new Error("Cannot read properties of undefined (reading 'map')");
};

const ReactModeDemo = () => (
  <Frame>
    <PreviewSandbox device={{ width: 480, height: 320 }}>
      <Boom />
    </PreviewSandbox>
  </Frame>
);

const Basic = () => (
  <Frame>
    <PreviewSandbox code={PAGE} />
  </Frame>
);

export const previewSandboxShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "code 传一份完整 HTML 文档串，写进 iframe 的 srcDoc；默认按 desktop 视口渲染并等比缩到容器装得下。",
      code: `<div className="h-[420px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
  <PreviewSandbox code={html} />
</div>`,
      render: () => <Basic />,
    },
    {
      title: "设备切换 + 外框",
      description:
        "切设备只改容器盒子，iframe 节点与文档都不重建，预览内的状态不会丢；机型档位可再套设备外框。",
      code: `const [device, setDevice] = useState("iphone");

<PreviewSandbox code={html} device={device} showDeviceFrame />`,
      render: () => <DeviceDemo />,
    },
    {
      title: "运行时错误与重试",
      description:
        "预览内的脚本抛错 → 注入的引导脚本回传给宿主 → 错误态盖在预览上，点重试重新载入文档。",
      code: `<PreviewSandbox
  code={crashingHtml}
  onError={(e) => console.warn(e.source, e.message)}
/>`,
      render: () => (
        <Frame>
          <PreviewSandbox code={CRASHING} />
        </Frame>
      ),
    },
    {
      title: "同文档模式",
      description:
        "传 children 而不是 code：子树直接渲染在当前文档里，走真正的 React 错误边界，错误对象形状与 iframe 模式一致。",
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
    { name: "桌面视口", render: () => <Basic /> },
    { name: "设备切换", render: () => <DeviceDemo /> },
    {
      name: "错误态",
      render: () => (
        <Frame>
          <PreviewSandbox code={CRASHING} />
        </Frame>
      ),
    },
  ],
  renderWithProps: (props) => (
    <Frame>
      <PreviewSandbox
        code={PAGE}
        device={(props.device as PreviewSandboxDevice) ?? "iphone"}
        showDeviceFrame={props.showDeviceFrame !== false}
      />
    </Frame>
  ),
  toCode: (props) =>
    `<PreviewSandbox code={html} device="${props.device ?? "iphone"}"${
      props.showDeviceFrame === false ? "" : " showDeviceFrame"
    } />`,
};
