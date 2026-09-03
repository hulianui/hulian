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
  examples: [
    {
      title: "基础用法",
      description: "Trigger 触发，Portal + focus trap：Esc 关闭、焦点归还触发按钮。",
      code: `<Dialog>
  <DialogTrigger render={<Button variant="outline">打开对话框</Button>} />
  <DialogContent title="瑚琏对话框" description="标题下的辅助说明文案。">
    <div className="flex justify-end gap-2">
      <DialogClose render={<Button variant="ghost">取消</Button>} />
      <DialogClose render={<Button>确定</Button>} />
    </div>
  </DialogContent>
</Dialog>`,
      render: () => <Demo />,
    },
    {
      title: "footer 操作区",
      description: "用 footer 槽放底部操作按钮，自动带顶部分隔线并右对齐。",
      code: `<Dialog>
  <DialogTrigger render={<Button>删除项目</Button>} />
  <DialogContent
    title="确认删除"
    description="此操作不可撤销，确定删除该项目吗？"
    footer={
      <>
        <DialogClose render={<Button variant="ghost">取消</Button>} />
        <DialogClose render={<Button tone="danger">删除</Button>} />
      </>
    }
  />
</Dialog>`,
      render: () => (
        <Dialog>
          <DialogTrigger render={<Button>删除项目</Button>} />
          <DialogContent
            title="确认删除"
            description="此操作不可撤销，确定删除该项目吗？"
            footer={
              <>
                <DialogClose render={<Button variant="ghost">取消</Button>} />
                <DialogClose render={<Button tone="danger">删除</Button>} />
              </>
            }
          />
        </Dialog>
      ),
    },
    {
      title: "默认打开",
      description: "非受控用 defaultOpen 让对话框初始即展开。",
      code: `<Dialog defaultOpen>
  <DialogTrigger render={<Button variant="outline">打开对话框</Button>} />
  <DialogContent title="欢迎" description="对话框初始即处于打开状态。">
    <div className="flex justify-end">
      <DialogClose render={<Button>知道了</Button>} />
    </div>
  </DialogContent>
</Dialog>`,
      render: () => (
        <Dialog defaultOpen>
          <DialogTrigger render={<Button variant="outline">打开对话框</Button>} />
          <DialogContent title="欢迎" description="对话框初始即处于打开状态。">
            <div className="flex justify-end">
              <DialogClose render={<Button>知道了</Button>} />
            </div>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      title: "可拖动",
      description: "draggable 让标题行成为把手：按住标题就能把对话框挪开，看清底下的页面；标题右侧 extra 里的按钮照常点击。",
      code: `<Dialog>
  <DialogTrigger render={<Button variant="outline">打开可拖动对话框</Button>} />
  <DialogContent
    draggable
    title="选择附件"
    description="按住标题可拖动。"
    extra={<Button size="sm" variant="ghost">刷新</Button>}
    footer={<DialogClose render={<Button>完成</Button>} />}
  >
    <p className="text-sm text-muted-foreground">对话框挪开后，底下的页面内容依然可见。</p>
  </DialogContent>
</Dialog>`,
      render: () => (
        <Dialog>
          <DialogTrigger render={<Button variant="outline">打开可拖动对话框</Button>} />
          <DialogContent
            draggable
            title="选择附件"
            description="按住标题可拖动。"
            extra={
              <Button size="sm" variant="ghost">
                刷新
              </Button>
            }
            footer={<DialogClose render={<Button>完成</Button>} />}
          >
            <p className="text-sm text-muted-foreground">对话框挪开后，底下的页面内容依然可见。</p>
          </DialogContent>
        </Dialog>
      ),
    },
  ],
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<Dialog>\n  <DialogTrigger render={<Button>打开</Button>} />\n  <DialogContent title="标题" description="…">\n    {/* 内容 */}\n  </DialogContent>\n</Dialog>`,
};
