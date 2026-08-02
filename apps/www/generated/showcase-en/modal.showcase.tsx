"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button/button";
import { modal } from "../../../../packages/ui/src/modal/modal";
import type { ModalType } from "../../../../packages/ui/src/modal/modal.types";
export const modalShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Confirmation dialog box",
            description: "modal.confirm Command-style pop-up window with cancel/confirm double keys (requires a <ModalProvider /> on the page).",
            code: `modal.confirm({
  title: "Confirm to delete this record?",
  content: "Cannot be restored after deletion.",
  onOk: () => {
    // Execute deletion
  },
})`,
            render: () => (<Button variant="outline" onClick={() => modal.confirm({
                    title: "Confirm to delete this record?",
                    content: "Cannot be restored after deletion.",
                    onOk: () => { },
                })}>
          confirm
        </Button>),
        },
        {
            title: "Information prompt type",
            description: "info / success / error / warning Derive different icons and main colors, and only render a single OK key.",
            code: `<>
  <Button onClick={() => modal.info({ title: "System prompt", content: "New version has been released." })}>info</Button>
  <Button onClick={() => modal.success({ title: "The operation was successful", content: "The data has been saved." })}>success</Button>
  <Button onClick={() => modal.error({ title: "Operation failed", content: "Network abnormality, please try again later." })}>error</Button>
  <Button onClick={() => modal.warning({ title: "Attention", content: "The current space is about to be exhausted." })}>warning</Button>
</>`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => modal.info({ title: "System prompt", content: "A new version has been released." })}>
            info
          </Button>
          <Button variant="outline" onClick={() => modal.success({ title: "Action completed", content: "Data saved." })}>
            success
          </Button>
          <Button variant="outline" onClick={() => modal.error({ title: "Operation failed", content: "Network abnormality, please try again later." })}>
            error
          </Button>
          <Button variant="outline" onClick={() => modal.warning({ title: "NOTE", content: "The current space is running out." })}>
            warning
          </Button>
        </div>),
        },
        {
            title: "Asynchronous determination (loading)",
            description: "onOk Confirm key to enter loading when returning to Promise; resolve will automatically close and reject will remain open.",
            code: `modal.confirm({
  title: "Submit order?",
  content: "Click OK to initiate a request.",
  onOk: () => new Promise((resolve) => setTimeout(resolve, 1200)),
})`,
            render: () => (<Button variant="outline" onClick={() => modal.confirm({
                    title: "Submit order?",
                    content: "Click OK to initiate a simulation request (approximately 1.2s).",
                    onOk: () => new Promise((resolve) => setTimeout(resolve, 1200)),
                })}>
          confirm + asynchronous
        </Button>),
        },
        {
            title: "Custom button copy",
            description: "okText / cancelText overrides the default \"OK/Cancel\".",
            code: `modal.confirm({
  title: "Log out?",
  content: "You need to log in again after logging out.",
  okText: "Exit",
  cancelText: "Think again",
  onOk: () => {},
})`,
            render: () => (<Button variant="outline" onClick={() => modal.confirm({
                    title: "Log out?",
                    content: "You need to log in again after logging out.",
                    okText: "Exit",
                    cancelText: "Think again",
                    onOk: () => { },
                })}>
          Custom copywriting
        </Button>),
        },
    ],
    controls: [
        {
            prop: "type",
            type: "select",
            options: ["confirm", "info", "success", "error", "warning"],
            defaultValue: "confirm",
            label: "Type",
        },
        { prop: "title", type: "text", defaultValue: "Confirm deletion?", label: "Title" },
        { prop: "content", type: "text", defaultValue: "This operation is irreversible, please operate with caution.", label: "Contents" },
        { prop: "okText", type: "text", defaultValue: "OK", label: "Confirm copywriting" },
    ],
    states: [
        {
            name: "confirm",
            render: () => (<Button variant="outline" onClick={() => modal.confirm({
                    title: "Confirm to delete this record?",
                    content: "Cannot be restored after deletion.",
                    onOk: () => { },
                })}>
          confirm
        </Button>),
        },
        {
            name: "info",
            render: () => (<Button variant="outline" onClick={() => modal.info({ title: "System prompt", content: "A new version has been released." })}>
          info Information
        </Button>),
        },
        {
            name: "success",
            render: () => (<Button variant="outline" onClick={() => modal.success({ title: "Action completed", content: "Data saved." })}>
          success
        </Button>),
        },
        {
            name: "error",
            render: () => (<Button variant="outline" onClick={() => modal.error({ title: "Operation failed", content: "Network abnormality, please try again later." })}>
          error
        </Button>),
        },
        {
            name: "warning",
            render: () => (<Button variant="outline" onClick={() => modal.warning({ title: "NOTE", content: "The current space is running out." })}>
          warning
        </Button>),
        },
        {
            name: "Asynchronous determination (loading)",
            render: () => (<Button variant="outline" onClick={() => modal.confirm({
                    title: "Submit order?",
                    content: "Click OK to initiate a simulation request (approximately 1.2s).",
                    onOk: () => new Promise((resolve) => setTimeout(resolve, 1200)),
                })}>
          confirm + asynchronous
        </Button>),
        },
    ],
    renderWithProps: (p) => (<Button onClick={() => modal[p.type as ModalType]({
            title: p.title as string,
            content: p.content as string,
            okText: p.okText as string,
        })}>
      Open {p.type as string}
    </Button>),
    toCode: (p) => `modal.${p.type}({
  title: "${p.title}",
  content: "${p.content}",
  okText: "${p.okText}",
  onOk: () => {},
})`,
};
