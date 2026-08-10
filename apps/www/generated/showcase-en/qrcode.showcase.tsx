"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { QRCode } from "../../../../packages/ui/src/qrcode/qrcode";
import { qrCodeSvgString } from "../../../../packages/ui/src/qrcode/qrcode-core";
import { qrCodeToPngDataUrl } from "../../../../packages/ui/src/qrcode/qrcode-png";
const EXPORT_VALUE = "https://hulian.dev/components/qrcode";
function ExportDemo() {
    const [png, setPng] = useState<string | null>(null);
    const svg = qrCodeSvgString({ value: EXPORT_VALUE, size: 120 });
    return (<div className="flex flex-wrap items-center gap-6">
      <QRCode value={EXPORT_VALUE} size={120}/>
      <div className="flex flex-col gap-2">
        <button type="button" className="w-fit cursor-pointer rounded-[var(--radius)] border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-hover" onClick={() => qrCodeToPngDataUrl({ value: EXPORT_VALUE, pixelSize: 240 }).then(setPng)}>
          Convert to PNG
        </button>
        <p className="max-w-xs break-all font-mono text-[10px] text-muted-foreground">
          {png ? `${png.slice(0, 48)}...(${Math.round(png.length / 1024)} KB)` : `SVG string ${svg.length} Characters`}
        </p>
        {png && <img src={png} alt="Exported PNG" className="size-24 rounded-[var(--radius)] border border-border"/>}
      </div>
    </div>);
}
export const qrcodeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Just pass in value, and the dark block inherits the currentColor eating theme by default.",
            code: `<QRCode value="https://hulian.dev" size={160} />`,
            render: () => <QRCode value="https://hulian.dev" size={160}/>,
        },
        {
            title: "Correction level",
            description: "level L/M/Q/H Increasing redundancy (with logo recommendation H).",
            code: `<>
  <QRCode value="https://hulian.dev" size={120} level="L" />
  <QRCode value="https://hulian.dev" size={120} level="H" />
</>`,
            render: () => (<div className="flex items-center gap-6">
          <QRCode value="https://hulian.dev" size={120} level="L"/>
          <QRCode value="https://hulian.dev" size={120} level="H"/>
        </div>),
        },
        {
            title: "Chinese content",
            description: "The kernel has been overwritten to UTF-8 encoding, which can directly encode Chinese.",
            code: `<QRCode value="Hulian component library \u00B7 Mobile QR code" size={140} level="H" />`,
            render: () => <QRCode value="Hulian component library · Mobile QR code" size={140} level="H"/>,
        },
        {
            title: "Custom color matching",
            description: "color/background Specify explicitly, or use the text-* utility class to change the dark block color.",
            code: `<QRCode
  value="https://hulian.dev"
  size={140}
  color="#0f172a"
  background="#f1f5f9"
/>`,
            render: () => (<QRCode value="https://hulian.dev" size={140} color="#0f172a" background="#f1f5f9"/>),
        },
        {
            title: "Center Logo",
            description: "Pass logo and embed it in the center of the QR code. Be sure to add level=\"H\" to leave enough redundancy.",
            code: `<QRCode
  value="https://hulian.dev"
  size={160}
  level="H"
  logo={{ src: "/logo.png", size: 36 }}
/>`,
            render: () => (<QRCode value="https://hulian.dev" size={160} level="H" logo={{ src: "/demo/avatar-12.jpg", size: 36 }}/>),
        },
        {
            title: "Watermark type Logo",
            description: "excavate={false} does not cut out the blank, and is equipped with opacity as watermark; the opaque logo does not cut out the blank, the module will be covered and cannot be scanned out.",
            code: `<QRCode
  value="https://hulian.dev"
  level="H"
  logo={{ src: "/logo.png", size: 60, excavate: false, opacity: 0.25 }}
/>`,
            render: () => (<QRCode value="https://hulian.dev" size={160} level="H" logo={{ src: "/demo/avatar-12.jpg", size: 60, excavate: false, opacity: 0.25 }}/>),
        },
        {
            title: "Stable density \u00B7 Automatic upgrade",
            description: "minVersion pins the lower limit of the version to make a group of code density consistent (the content will not jump when the content becomes longer); boostLevel is enabled by default, and you can get higher error correction for free without upgrading the version.",
            code: `<>
  <QRCode value="A" minVersion={4} />
  <QRCode value="https://hulian.dev/components/qrcode" minVersion={4} />
</>`,
            render: () => (<div className="flex items-end gap-4">
          <QRCode value="A" size={120} minVersion={4}/>
          <QRCode value="https://hulian.dev/components/qrcode" size={120} minVersion={4}/>
        </div>),
        },
        {
            title: "Export SVG / PNG",
            description: "qrCodeSvgString produces an independent SVG string (can also be used on the server), qrCodeToPngDataUrl produces PNG data URL (automatically press DPR to enlarge, default white background).",
            code: `import { qrCodeSvgString, qrCodeToPngDataUrl } from "@hulianui/ui"

// Download SVG
const svg = qrCodeSvgString({ value: url, size: 512 })
download(new Blob([svg], { type: "image/svg+xml" }), "qr.svg")

// Download PNG
const png = await qrCodeToPngDataUrl({ value: url, pixelSize: 512 })
Object.assign(document.createElement("a"), { href: png, download: "qr.png" }).click()`,
            render: () => <ExportDemo />,
        },
    ],
    controls: [],
    states: [
        {
            name: "Basic (eat token color)",
            render: () => <QRCode value="https://hulian.dev" size={140}/>,
        },
        {
            name: "High error correction + Chinese",
            render: () => <QRCode value="Hulian component library · Mobile QR code" size={140} level="H"/>,
        },
        {
            name: "Main color dark block",
            render: () => (<QRCode value="https://hulian.dev" size={140} className="text-primary"/>),
        },
    ],
    renderWithProps: () => <QRCode value="https://hulian.dev" size={140}/>,
    toCode: () => `<QRCode value="https://hulian.dev" size={160} level="M" />`,
};
