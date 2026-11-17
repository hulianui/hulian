"use client";
import { copy } from "./figure-export.content";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button, Drawer, DrawerContent, Text, toast, usePaperExport } from "@hulianui/ui";
import { GIT_FIGURES } from "./git-figures";

/**
 * Per-step SVG export for the Git paper. Must live inside the <Paper> that renders the figures:
 * `usePaperExport` draws each requested state off screen through the figure's own render function.
 */
export function FigureExportDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { exportFigureSvg } = usePaperExport();
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ name: string; url: string; size: number } | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );

  const run = async (figure: string, key: string) => {
    const name = `${figure}-${key}.svg`;
    setBusy(name);
    try {
      const svg = await exportFigureSvg(figure, key, { background: "white" });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      setPreview({ name, url, size: blob.size });
      toast({ tone: "success", title: copy("exportDone", name) });
    } catch (e) {
      toast({ tone: "danger", title: copy("exportFailed"), description: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="lg" title={copy("exportTitle")} description={copy("exportDescription")}>
        <div className="flex flex-col gap-5">
          {GIT_FIGURES.map((figure, i) => (
            <section key={figure.id} className="flex flex-col gap-2">
              <Text size="sm" weight="medium">
                {copy("figureLabel", i + 1)} · <span className="text-muted-foreground">{figure.caption}</span>
              </Text>
              <div className="flex flex-wrap gap-1.5">
                {[...figure.keys, ...(figure.id === "fig-pack" ? [] : [{ key: "all", label: copy("exportOverview") }])].map((k, j) => {
                  const name = `${figure.id}-${k.key}.svg`;
                  return (
                    <Button
                      key={k.key}
                      size="xs"
                      variant="outline"
                      loading={busy === name}
                      disabled={busy !== null && busy !== name}
                      onClick={() => run(figure.id, k.key)}
                      title={k.label}
                    >
                      {k.key === "all" || figure.id === "fig-pack" ? k.label : `(${String.fromCharCode(97 + j)}) ${k.label}`}
                    </Button>
                  );
                })}
              </div>
            </section>
          ))}
          {preview ? (
            <figure className="m-0 flex flex-col gap-2 rounded-[var(--radius)] border border-border p-3">
              <Text size="sm" weight="medium">
                {copy("exportPreview")} · <span className="font-mono">{preview.name}</span>
              </Text>
              {/* An exported SVG blob, deliberately loaded as <img> to prove it no longer needs the page CSS. */}
              <img src={preview.url} alt={preview.name} className="mx-auto block h-auto w-full max-w-md bg-white" />
              <Text size="xs" tone="muted">
                {copy("exportSize", (preview.size / 1024).toFixed(1))}
              </Text>
            </figure>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** Trigger + drawer. Place it inside the Paper that owns the figures. */
export function FigureExportButton({
  size = "sm",
  variant = "outline",
  className,
}: {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost" | "soft" | "link";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size={size} variant={variant} className={className} onClick={() => setOpen(true)}>
        <Download className="size-4" />
        {copy("exportFigures")}
      </Button>
      <FigureExportDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
