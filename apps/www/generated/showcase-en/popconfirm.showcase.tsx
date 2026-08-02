"use client";
import { Trash2 } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button/button";
import { Popconfirm } from "../../../../packages/ui/src/popconfirm/popconfirm";
type Side = "top" | "right" | "bottom" | "left";
export const popconfirmShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Wrap any trigger element and click the pop-up bubble to confirm. onConfirm triggers and automatically closes after point confirmation.",
            code: `<Popconfirm title="Confirm submission?" onConfirm={() => {}}>
  <Button size="sm">Submit</Button>
</Popconfirm>`,
            render: () => (<Popconfirm title="Confirm submission?" onConfirm={() => { }}>
          <Button size="sm">Submit</Button>
        </Popconfirm>),
        },
        {
            title: "Dangerous operation",
            description: "danger Make the confirmation button turn danger color and the default icon turn red, suitable for irreversible actions such as deletion.",
            code: `<Popconfirm title="Are you sure you want to delete this record?" description="It cannot be recovered after deletion." danger onConfirm={() => {}}>
  <Button variant="outline" tone="danger" size="sm">Delete</Button>
</Popconfirm>`,
            render: () => (<Popconfirm title="Are you sure you want to delete this record?" description="It cannot be recovered after deletion." danger onConfirm={() => { }}>
          <Button variant="outline" tone="danger" size="sm">
            Delete
          </Button>
        </Popconfirm>),
        },
        {
            title: "Asynchronous confirmation",
            description: "onConfirm Confirm button enters loading when returning to Promise, and automatically closes after resolve.",
            code: `<Popconfirm
  title="Confirm archiving?"
  description="Save asynchronously to server."
  okText="Archive"
  onConfirm={() => new Promise((r) => setTimeout(r, 1200))}
>
  <Button variant="outline" size="sm">Archive</Button>
</Popconfirm>`,
            render: () => (<Popconfirm title="Confirm archiving?" description="Save asynchronously to server." okText="Archive" onConfirm={() => new Promise<void>((r) => setTimeout(r, 1200))}>
          <Button variant="outline" size="sm">
            Archive
          </Button>
        </Popconfirm>),
        },
        {
            title: "Pop-up direction + custom icon",
            description: "side controls the floating layer orientation, and icon replaces the default warning triangle.",
            code: `<Popconfirm
  title="Move to trash?"
  side="right"
  icon={<Trash2 className="size-5 shrink-0 text-danger" aria-hidden />}
  danger
  onConfirm={() => {}}
>
  <Button variant="ghost" size="sm" tone="danger">Recycling</Button>
</Popconfirm>`,
            render: () => (<Popconfirm title="Move to Recycle Bin?" side="right" icon={<Trash2 className="size-5 shrink-0 text-danger" aria-hidden/>} danger onConfirm={() => { }}>
          <Button variant="ghost" size="sm" tone="danger">
            Recycling
          </Button>
        </Popconfirm>),
        },
        {
            title: "Custom button copy",
            description: "okText / cancelText Override the default text of the confirm and cancel buttons.",
            code: `<Popconfirm title="Log out?" okText="Log out" cancelText="Think again" onConfirm={() => {}}>
  <Button variant="outline" size="sm">Log out</Button>
</Popconfirm>`,
            render: () => (<Popconfirm title="Log out?" okText="Exit" cancelText="Think again" onConfirm={() => { }}>
          <Button variant="outline" size="sm">
            Log out
          </Button>
        </Popconfirm>),
        },
    ],
    controls: [
        { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "top" },
        { prop: "danger", type: "boolean", defaultValue: true, label: "Dangerous operation" },
        { prop: "title", type: "text", defaultValue: "Are you sure you want to delete this record?", label: "Title" },
    ],
    states: [
        {
            name: "Default (dangerous deletion confirmation)",
            render: () => (<Popconfirm title="Are you sure you want to delete this record?" description="It cannot be recovered after deletion." danger onConfirm={() => { }}>
          <Button variant="outline" tone="danger" size="sm">
            Delete
          </Button>
        </Popconfirm>),
        },
        {
            name: "Normal confirmation (no description)",
            render: () => (<Popconfirm title="Confirm submission?" onConfirm={() => { }}>
          <Button size="sm">Submit</Button>
        </Popconfirm>),
        },
        {
            name: "Asynchronous confirmation (closed after loading)",
            render: () => (<Popconfirm title="Confirm archiving?" description="Save asynchronously to server." okText="Archive" onConfirm={() => new Promise<void>((r) => setTimeout(r, 1200))}>
          <Button variant="outline" size="sm">
            Archive
          </Button>
        </Popconfirm>),
        },
        {
            name: "Custom icon + popup on the right",
            render: () => (<Popconfirm title="Move to Recycle Bin?" side="right" icon={<Trash2 className="size-5 shrink-0 text-danger" aria-hidden/>} danger onConfirm={() => { }}>
          <Button variant="ghost" size="sm" tone="danger">
            Recycling
          </Button>
        </Popconfirm>),
        },
    ],
    renderWithProps: (p) => (<Popconfirm title={(p.title as string) || "Are you sure you want to delete this record?"} description="It cannot be recovered after deletion." danger={p.danger as boolean} side={p.side as Side} onConfirm={() => { }}>
      <Button variant="outline" tone={(p.danger as boolean) ? "danger" : "brand"} size="sm">
        Delete
      </Button>
    </Popconfirm>),
    toCode: (p) => `<Popconfirm
  title="${p.title}"
  description="Cannot be recovered after deletion."${p.danger ? "\n  danger" : ""}
  side="${p.side}"
  onConfirm={async () => { await api.remove(id); }}
>
  <Button variant="outline" tone="danger" size="sm">Delete</Button>
</Popconfirm>`,
};
