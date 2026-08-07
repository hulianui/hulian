"use client";
import { useState } from "react";
import { ExternalLink, Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";
import { Segmented, Tabs, TabsList, TabsPanel, TabsTab } from "@hulianui/ui";
import { useIntlayer } from "next-intlayer";
import { withDocsBasePath } from "../lib/docs-locale";
import { DocsCodeBlock } from "./docs-code-block";

// 区块/页面详情的预览器 —— 预览 / 代码双 Tab + 视口切换 + 新窗口 + 刷新 + 文件树。
//
// 预览走**独立 iframe**（src 指向 /preview/*，那条路由没有文档站 chrome）。
// 直接把区块挂进文档 DOM 会互相污染：区块自带的全局样式、Portal、快捷键监听、
// sticky 顶栏会和文档站的抢同一个 document —— 而且视口切换也只有 iframe 才是真的
// （改容器宽度骗不过组件里的媒体查询，iframe 里的 100vw 才真是 390px）。
//
// 刷新靠给 iframe 换 key 重建：区块里的动效、计数、表单态一次性重来，比 contentWindow.location.reload()
// 更可控（后者在跨文档时还要考虑同源与历史栈）。

type Device = "desktop" | "tablet" | "mobile";

// 平板/手机取常见竖屏逻辑宽度；桌面不设限，跟随容器。
const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

// label 是纯图标 → 必须给 ariaLabel，否则无障碍名会降级成 "desktop" 这类英文键。
function ToolbarButton({
  label,
  onClick,
  href,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}) {
  // 用 aria-label + 原生 title：图标钮的短提示不值得为此把一个 overlay Provider
  // 拖进每个详情页（Tooltip 是复合件，需要 Provider + Trigger render prop 一整套）。
  const cls =
    "inline-flex size-8 items-center justify-center rounded-[var(--radius)] text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={cls}
    >
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cls}>
      {children}
    </button>
  );
}

export function PreviewViewer({
  src,
  code,
  files,
  title,
  height = 640,
}: {
  /** 隔离预览路由，如 /preview/blocks/data-table。 */
  src: string;
  /** 可复制的源码。 */
  code: string;
  /** 安装后会写入的文件（本体在前，递归依赖在后）。 */
  files?: Array<{ path: string; note?: string }>;
  title: string;
  /** 预览区高度（整页给大些）。 */
  height?: number;
}) {
  const content = useIntlayer("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [nonce, setNonce] = useState(0);
  const deviceItems = [
    {
      value: "desktop",
      label: <Monitor className="size-4" aria-hidden />,
      ariaLabel: content.desktop,
    },
    {
      value: "tablet",
      label: <Tablet className="size-4" aria-hidden />,
      ariaLabel: content.tablet,
    },
    {
      value: "mobile",
      label: <Smartphone className="size-4" aria-hidden />,
      ariaLabel: content.mobile,
    },
  ];

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border">
      <Tabs defaultValue="preview">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-2 py-1.5">
          <TabsList variant="solid">
            <TabsTab value="preview">{content.preview}</TabsTab>
            <TabsTab value="code">{content.code}</TabsTab>
            {files && files.length > 0 && <TabsTab value="files">{content.files}</TabsTab>}
          </TabsList>

          <div className="ml-auto flex items-center gap-1">
            {/* 视口切换只在桌面露出：手机上浏览器本身就是那个尺寸，再给一排设备钮没有意义。 */}
            <div className="hidden md:block">
              <Segmented
                aria-label={content.viewport}
                size="sm"
                items={deviceItems}
                value={device}
                onValueChange={(v) => setDevice(v as Device)}
              />
            </div>
            <ToolbarButton label={content.refresh} onClick={() => setNonce((n) => n + 1)}>
              <RotateCw className="size-4" aria-hidden />
            </ToolbarButton>
            <ToolbarButton label={content.openWindow} href={withDocsBasePath(src)}>
              <ExternalLink className="size-4" aria-hidden />
            </ToolbarButton>
          </div>
        </div>

        <TabsPanel value="preview" className="mt-0 rounded-none">
          <div className="flex justify-center bg-subtle/60 p-0 md:p-4">
            <div
              className="overflow-hidden bg-bg transition-[width] md:rounded-[var(--radius)] md:border md:border-border"
              style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}
            >
              <iframe
                key={nonce}
                src={withDocsBasePath(src)}
                title={content.frameTitle.replace("{title}", title)}
                loading="lazy"
                className="block w-full border-0"
                style={{ height }}
              />
            </div>
          </div>
        </TabsPanel>

        <TabsPanel value="code" className="mt-0 rounded-none">
          <DocsCodeBlock
            code={code}
            lang="tsx"
            className="max-h-[78vh] overflow-auto rounded-none border-0"
          />
        </TabsPanel>

        {files && files.length > 0 && (
          <TabsPanel value="files" className="mt-0 rounded-none">
            <ul className="divide-y divide-border">
              {files.map((f) => (
                <li
                  key={f.path}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5"
                >
                  <code className="font-mono text-xs">{f.path}</code>
                  {f.note && <span className="text-xs text-muted">{f.note}</span>}
                </li>
              ))}
            </ul>
          </TabsPanel>
        )}
      </Tabs>
    </div>
  );
}
