"use client";
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
} from "@hulian/ui";

// 客户端岛：Base UI 的 `render={<Button>}` 把一个 client 组件元素当 prop 传入，
// 这种"client 元素作 prop"在 RSC 下必须诞生于 client 边界内 —— 否则从 server 父级
// 跨界传递会解析成 undefined 元素类型。故首页保持 server component，仅此演示下沉为 client。
export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">打开对话框</Button>} />
      <DialogContent
        title="瑚琏对话框"
        description="Portal + focus trap：Tab 不出框，Esc 关闭，焦点归还触发按钮。"
      >
        <div className="flex justify-end gap-2">
          <DialogClose render={<Button variant="ghost">取消</Button>} />
          <DialogClose render={<Button>确定</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
