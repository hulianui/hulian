"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Dialog, DialogTrigger, DialogClose, DialogContent } from "../../../../packages/ui/src/dialog/dialog";
import { Button } from "../../../../packages/ui/src/button/button";
function Demo() {
    return (<Dialog>
      <DialogTrigger render={<Button variant="outline">Open dialog box</Button>}/>
      <DialogContent title="Hulian Dialog Box" description="Portal + focus trap Verification: Tab does not come out of the frame, Esc closes, and the focus returns to the trigger button.">
        <div className="flex justify-end gap-2">
          <DialogClose render={<Button variant="ghost">Cancel</Button>}/>
          <DialogClose render={<Button>OK</Button>}/>
        </div>
      </DialogContent>
    </Dialog>);
}
export const dialogShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Trigger, Portal + focus trap: Esc close, focus return trigger button.",
            code: `<Dialog>
  <DialogTrigger render={<Button variant="outline">Open dialog box</Button>} />
  <DialogContent title="Hulian Dialog Box" description="Auxiliary explanation copy under the title.">
    <div className="flex justify-end gap-2">
      <DialogClose render={<Button variant="ghost">Cancel</Button>} />
      <DialogClose render={<Button>OK</Button>} />
    </div>
  </DialogContent>
</Dialog>`,
            render: () => <Demo />,
        },
        {
            title: "footer operating area",
            description: "Use footer slot to place the bottom operation button, automatically with top divider and right alignment.",
            code: `<Dialog>
  <DialogTrigger render={<Button>Delete item</Button>} />
  <DialogContent
    title="Confirm deletion"
    description="This operation is irreversible. Are you sure you want to delete this item?"
    footer={
      <>
        <DialogClose render={<Button variant="ghost">Cancel</Button>} />
        <DialogClose render={<Button tone="danger">Delete</Button>} />
      </>
    }
  />
</Dialog>`,
            render: () => (<Dialog>
          <DialogTrigger render={<Button>Delete project</Button>}/>
          <DialogContent title="Confirm deletion" description="This operation is irreversible. Are you sure you want to delete this item?" footer={<>
                <DialogClose render={<Button variant="ghost">Cancel</Button>}/>
                <DialogClose render={<Button tone="danger">Delete</Button>}/>
              </>}/>
        </Dialog>),
        },
        {
            title: "Open by default",
            description: "Uncontrolled use defaultOpen to make the dialog box expand initially.",
            code: `<Dialog defaultOpen>
  <DialogTrigger render={<Button variant="outline">Open dialog box</Button>} />
  <DialogContent title="Welcome" description="The dialog box is initially open.">
    <div className="flex justify-end">
      <DialogClose render={<Button>Got it</Button>} />
    </div>
  </DialogContent>
</Dialog>`,
            render: () => (<Dialog defaultOpen>
          <DialogTrigger render={<Button variant="outline">Open dialog box</Button>}/>
          <DialogContent title="Welcome" description="The dialog box is initially open.">
            <div className="flex justify-end">
              <DialogClose render={<Button>Got it</Button>}/>
            </div>
          </DialogContent>
        </Dialog>),
        },
    ],
    controls: [],
    states: [{ name: "default", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<Dialog>
  <DialogTrigger render={<Button>Open</Button>} />
  <DialogContent title="Title" description="...">
    {/* Content */}
  </DialogContent>
</Dialog>`,
};
