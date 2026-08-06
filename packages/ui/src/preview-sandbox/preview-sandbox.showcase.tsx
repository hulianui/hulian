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

// 同样只在点击后才抛：一次正常的页面加载不该甩出未捕获错误，英文 showcase 的浏览器门禁
// 会把 iframe 内的 pageerror 一并算到宿主页头上（Playwright 聚合所有 frame）。
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

// 这个示例要演示「同文档模式下子树抛错被错误边界接住」，所以它得真的抛 —— 但只能**点了才抛**。
// 自动抛有两处代价，都实测踩过：
//   ① 服务端渲染时抛 → 静态导出没有错误边界兜底，整页 /components/preview-sandbox 预渲染失败；
//   ② 挂载后自动抛 → 边界虽然接住了，React 仍会把它上报给 window，英文 showcase 的浏览器门禁
//      按 pageerror 判失败（一次正常的页面加载不该甩出未捕获错误）。
// 交互触发同时解决两条，演示效果也更清楚：先看到正常子树，点一下才看到错误态。
const Boom = ({ armed }: { armed: boolean }) => {
  if (armed) throw new Error("Cannot read properties of undefined (reading 'map')");
  return (
    <div className="grid h-full place-items-center p-6 text-sm text-muted">
      正常渲染的子树
    </div>
  );
};

const ReactModeDemo = () => {
  const [armed, setArmed] = useState(false);
  return (
    <div className="w-full space-y-3">
      <Button size="sm" variant="outline" onClick={() => setArmed(true)} disabled={armed}>
        触发子树错误
      </Button>
      <Frame>
        <PreviewSandbox device={{ width: 480, height: 320 }}>
          <Boom armed={armed} />
        </PreviewSandbox>
      </Frame>
    </div>
  );
};

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
        "点预览里的按钮让脚本抛错 → 注入的引导脚本把错误回传给宿主 → 错误态盖在预览上，点重试重新载入文档。",
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
        "传 children 而不是 code：子树直接渲染在当前文档里，走真正的 React 错误边界，错误对象形状与 iframe 模式一致。点按钮让子树抛错即可看到错误态。",
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
      name: "运行时错误（点按钮触发）",
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
