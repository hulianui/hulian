"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ImageCropper } from "../../../../packages/ui/src/image-cropper/image-cropper";
const SAMPLE = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cdd9ff"/><stop offset="1" stop-color="#8fa8e8"/>
    </linearGradient></defs>
    <rect width="600" height="800" fill="url(#g)"/>
    <circle cx="300" cy="300" r="120" fill="#5b6b8c"/>
    <ellipse cx="300" cy="620" rx="210" ry="170" fill="#5b6b8c"/>
  </svg>`)}`;
function IdPhotoDemo({ aspect = 5 / 7, maxZoom = 3 }: {
    aspect?: number;
    maxZoom?: number;
}) {
    const [result, setResult] = useState<string | null>(null);
    return (<div className="flex w-96 max-w-full flex-col gap-3">
      <ImageCropper image={SAMPLE} aspect={aspect} maxZoom={maxZoom} maxBytes={200 * 1024} onCropped={(blob) => setResult(`Pictured ${blob.type} \u00B7 ${(blob.size / 1024).toFixed(1)} KB`)} onCancel={() => setResult("Canceled")}/>
      {result && <div className="text-sm text-muted-foreground">{result}</div>}
    </div>);
}
export const imageCropperShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "ID photo 5:7",
            description: "The default aspect ratio is 5:7 (the same ratio as the 1/2-inch ID photo). Drag and drop for alignment and slider scaling. After confirmation, the target size Blob is output. The storage/uploading is taken over by the consumer.",
            code: `<ImageCropper
  image={objectUrl}
  aspect={5 / 7}
  maxBytes={200 * 1024}
  onCropped={(blob) => /* Storage / Upload */}
  onCancel={() => /* Close */}
/>`,
            render: () => (<div className="w-96 max-w-full">
          <ImageCropper image={SAMPLE} aspect={5 / 7} maxBytes={200 * 1024} onCropped={() => { }} onCancel={() => { }}/>
        </div>),
        },
        {
            title: "Square 1:1",
            description: "aspect=1 is suitable for avatars; outputWidth controls the side length of the image.",
            code: `<ImageCropper
  image={objectUrl}
  aspect={1}
  outputWidth={320}
  onCropped={(blob) => upload(blob)}
/>`,
            render: () => (<div className="w-96 max-w-full">
          <ImageCropper image={SAMPLE} aspect={1} outputWidth={320} onCropped={() => { }} onCancel={() => { }}/>
        </div>),
        },
        {
            title: "Increase scaling limit",
            description: "maxZoom Zoom in to crop a closer part; the slider range changes accordingly.",
            code: `<ImageCropper image={objectUrl} aspect={1} maxZoom={5} onCropped={save} />`,
            render: () => (<div className="w-96 max-w-full">
          <ImageCropper image={SAMPLE} aspect={1} maxZoom={5} onCropped={() => { }}/>
        </div>),
        },
    ],
    controls: [
        { prop: "aspect", type: "select", options: ["5/7", "1", "4/3"], defaultValue: "5/7" },
        { prop: "maxZoom", type: "number", defaultValue: 3 },
    ],
    states: [
        { name: "ID photo 5:7", render: () => <IdPhotoDemo /> },
        { name: "Square 1:1", render: () => <IdPhotoDemo aspect={1}/> },
    ],
    renderWithProps: (p) => {
        const aspect = (p.aspect as string) === "1" ? 1 : (p.aspect as string) === "4/3" ? 4 / 3 : 5 / 7;
        return <IdPhotoDemo aspect={aspect} maxZoom={(p.maxZoom as number) || 3}/>;
    },
    toCode: (p) => `<ImageCropper
  image={objectUrl}
  aspect={${(p.aspect as string) ?? "5/7"}}
  maxZoom={${(p.maxZoom as number) || 3}}
  maxBytes={200 * 1024}
  onCropped={(blob) => /* Storage/Upload */}
  onCancel={() => /* Close */}
/>`,
};
