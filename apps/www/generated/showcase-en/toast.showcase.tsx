"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button/button";
import { toast } from "../../../../packages/ui/src/toast/toast";
import type { ToastTone } from "../../../../packages/ui/src/toast/toast.types";
export const toastShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Imperative call toast(), adjustable anywhere on the page (need to hang a single <ToastProvider/>).",
            code: `toast({ title: "Copied to clipboard" });`,
            render: () => (<Button variant="outline" onClick={() => toast({ title: "Copied to clipboard" })}>
          Pop-up
        </Button>),
        },
        {
            title: "Five intonations",
            description: "tone provides neutral / info / success / warning / danger, aligned with Alert, driving left bar and title coloring.",
            code: `toast({ title: "Copied to clipboard" }); // neutral
toast({ tone: "info", title: "A new version is available", description: "Click refresh to update." });
toast({ tone: "success", title: "Saved", description: "Changes have been synchronized to the cloud." });
toast({ tone: "warning", title: "Partial failure", description: "1 out of 3 items are not synchronized." });
toast({ tone: "danger", title: "Save failed", description: "Network abnormality, please try again." });`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast({ title: "Copied to clipboard" })}>
            neutral
          </Button>
          <Button variant="outline" onClick={() => toast({ tone: "info", title: "There is a new version", description: "Click Refresh to update." })}>
            info
          </Button>
          <Button variant="outline" onClick={() => toast({ tone: "success", title: "Saved", description: "Changes have been synced to the cloud." })}>
            success
          </Button>
          <Button variant="outline" onClick={() => toast({ tone: "warning", title: "Partial failure", description: "1 out of 3 not synced." })}>
            warning
          </Button>
          <Button variant="outline" onClick={() => toast({ tone: "danger", title: "Failed to save", description: "Network abnormality, please try again." })}>
            danger
          </Button>
        </div>),
        },
        {
            title: "Resident does not disappear automatically",
            description: "It does not close automatically when timeout=0, you need to manually click \u00D7 to close.",
            code: `toast({ title: "Needs to be closed manually", description: "timeout=0, click \u00D7 to disappear.", timeout: 0 });`,
            render: () => (<Button variant="outline" onClick={() => toast({ title: "Need to be closed manually", description: "timeout=0, click \u00D7 to disappear.", timeout: 0 })}>
          Bullet resident
        </Button>),
        },
        {
            title: "Stacking",
            description: "Continuously call stack display (limited to 3 by default for Provider).",
            code: `toast({ tone: "info", title: "Article 1" });
toast({ tone: "neutral", title: "Article 2" });
toast({ tone: "danger", title: "Article 3" });`,
            render: () => (<Button variant="outline" onClick={() => {
                    toast({ tone: "info", title: "Article 1" });
                    toast({ tone: "neutral", title: "Article 2" });
                    toast({ tone: "danger", title: "Article 3" });
                }}>
          3 messages in a row
        </Button>),
        },
    ],
    controls: [
        {
            prop: "tone",
            type: "select",
            options: ["neutral", "info", "success", "warning", "danger"],
            defaultValue: "neutral",
            label: "Tone",
        },
        { prop: "title", type: "text", defaultValue: "Saved", label: "Title" },
        { prop: "description", type: "text", defaultValue: "Changes synchronized successfully.", label: "Description" },
        { prop: "timeout", type: "number", defaultValue: 5000, label: "disappears (ms,0=resident)" },
    ],
    states: [
        {
            name: "info",
            render: () => (<Button variant="outline" onClick={() => toast({ tone: "info", title: "There is a new version", description: "Click Refresh to update." })}>
          Bomb info
        </Button>),
        },
        {
            name: "success",
            render: () => (<Button variant="outline" onClick={() => toast({ tone: "success", title: "Saved", description: "Changes have been synced to the cloud." })}>
          Bomb success
        </Button>),
        },
        {
            name: "warning",
            render: () => (<Button variant="outline" onClick={() => toast({ tone: "warning", title: "Partial failure", description: "1 out of 3 not synced." })}>
          Bomb warning
        </Button>),
        },
        {
            name: "danger",
            render: () => (<Button variant="outline" onClick={() => toast({ tone: "danger", title: "Failed to save", description: "Network abnormality, please try again." })}>
          Bomb danger
        </Button>),
        },
        {
            name: "neutral",
            render: () => (<Button variant="outline" onClick={() => toast({ title: "Copied to clipboard" })}>
          Bomb neutral
        </Button>),
        },
        {
            name: "Resident (timeout:0)",
            render: () => (<Button variant="outline" onClick={() => toast({ title: "Need to be closed manually", description: "timeout=0, click \u00D7 to disappear.", timeout: 0 })}>
          Bullet resident
        </Button>),
        },
        {
            name: "Stacking (limit 3)",
            render: () => (<Button variant="outline" onClick={() => {
                    toast({ tone: "info", title: "Article 1" });
                    toast({ tone: "neutral", title: "Article 2" });
                    toast({ tone: "danger", title: "Article 3" });
                }}>
          3 messages in a row
        </Button>),
        },
    ],
    renderWithProps: (p) => (<Button onClick={() => toast({
            tone: p.tone as ToastTone,
            title: p.title as string,
            description: p.description as string,
            timeout: p.timeout as number,
        })}>
      Pop-up toast
    </Button>),
    toCode: (p) => `toast({
  tone: "${p.tone}",
  title: "${p.title}",
  description: "${p.description}",
  timeout: ${p.timeout},
})`,
};
