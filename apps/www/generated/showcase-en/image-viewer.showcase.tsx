"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ImageViewer } from "../../../../packages/ui/src/image-viewer/image-viewer";
const IMAGES = [1, 2, 3, 4, 5, 6].map((i) => ({
    src: `https://picsum.photos/seed/hulian-${i}/1200/800`,
    alt: `Sample image ${i}`,
    caption: `Hulian ImageViewer \u00B7 Sample picture ${i}(Scroll wheel to zoom / double click / \u2190 \u2192 page turning)`,
}));
function Demo() {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);
    return (<>
      <button type="button" onClick={() => {
            setIndex(0);
            setOpen(true);
        }} className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-foreground/5">
        Open viewer
      </button>
      <ImageViewer open={open} onOpenChange={setOpen} images={IMAGES} index={index} onIndexChange={setIndex}/>
    </>);
}
export const imageViewerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Controlled usage",
            description: "open / index are all controlled; click the trigger button to set open=true to open full screen Lightbox, support wheel zoom, double-click 1x/2x, \u2190 \u2192 Turn page, Esc close.",
            code: `const [open, setOpen] = useState(false);
const [index, setIndex] = useState(0);

<>
  <button onClick={() => { setIndex(0); setOpen(true); }}>
    Open viewer
  </button>
  <ImageViewer
    open={open}
    onOpenChange={setOpen}
    images={[
      { src: "/a.jpg", alt: "A", caption: "Description A" },
      { src: "/b.jpg", alt: "B", caption: "Description B" },
    ]}
    index={index}
    onIndexChange={setIndex}
  />
</>`,
            render: () => (<>
          <span className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-sm text-foreground">
            Open viewer
          </span>
          <ImageViewer open={false} onOpenChange={() => { }} images={IMAGES} index={0} onIndexChange={() => { }}/>
        </>),
        },
        {
            title: "Single picture (no page turning)",
            description: "images When there is only one image, the left and right page buttons and bottom thumbnail bar are not rendered, only zoom/close is retained.",
            code: `<ImageViewer
  open={open}
  onOpenChange={setOpen}
  images={[{ src: "/poster.jpg", alt: "Poster", caption: "Activity Main Visual" }]}
  index={0}
  onIndexChange={() => {}}
/>`,
            render: () => (<>
          <span className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-sm text-foreground">
            View large image
          </span>
          <ImageViewer open={false} onOpenChange={() => { }} images={[IMAGES[0]]} index={0} onIndexChange={() => { }}/>
        </>),
        },
    ],
    controls: [],
    states: [{ name: "default", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => [
        "const [open, setOpen] = useState(false);",
        "const [index, setIndex] = useState(0);",
        "",
        "<ImageViewer",
        "  open={open}",
        "  onOpenChange={setOpen}",
        "  images={[{ src: '/a.jpg', alt: 'A', caption: 'Description' }, /* ... */]}",
        "  index={index}",
        "  onIndexChange={setIndex}",
        "/>",
    ].join("\n"),
};
