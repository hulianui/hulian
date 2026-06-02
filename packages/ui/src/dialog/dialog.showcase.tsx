"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Dialog, DialogTrigger, DialogClose, DialogContent } from "./dialog";
import { Button } from "../button/button";

function Demo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">打开对话框</Button>} />
      <DialogContent
        title="瑚琏对话框"
        description="Portal + focus trap 验证：Tab 不出框，Esc 关闭，焦点归还触发按钮。"
      >
        <div className="flex justify-end gap-2">
          <DialogClose render={<Button variant="ghost">取消</Button>} />
          <DialogClose render={<Button>确定</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const dialogShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<Dialog>\n  <DialogTrigger render={<Button>打开</Button>} />\n  <DialogContent title="标题" description="…">\n    {/* 内容 */}\n  </DialogContent>\n</Dialog>`,
};
