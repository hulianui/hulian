"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent } from "./drawer";
import type { DrawerSide } from "./drawer.types";
import { Button } from "../button/button";

function Demo({ side }: { side: DrawerSide }) {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">{`打开 ${side} 抽屉`}</Button>} />
      <DrawerContent
        side={side}
        title="设置面板"
        description="Esc / 点遮罩 / 关闭按钮均可收起；焦点锁在抽屉内。"
        footer={
          <>
            <DrawerClose render={<Button variant="outline">取消</Button>} />
            <DrawerClose render={<Button>保存</Button>} />
          </>
        }
      >
        {/* 长内容演示：正文区独立滚动，footer 始终钉底可见 */}
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>配置项 {i + 1}：这里是一段较长的说明文案，用于演示正文超出时的滚动行为。</p>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// 标题行操作（#272）：按钮放 extra 而不是塞进 title —— title 渲染成 <h2>，只收 phrasing content，
// 且 aria-labelledby 指向整个 <h2>，塞进去读屏会把按钮文案一起念成对话框的名字。
function ExtraDemo() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">打开通知面板</Button>} />
      <DrawerContent
        side="right"
        title="通知"
        extra={
          <Button variant="ghost" size="sm">
            全部已读
          </Button>
        }
      >
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          {Array.from({ length: 5 }, (_, i) => (
            <p key={i}>配置项 {i + 1}：这里是一段较长的说明文案，用于演示正文超出时的滚动行为。</p>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const drawerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认从右侧滑入；Esc / 点遮罩 / 关闭按钮均可收起，焦点锁在抽屉内。",
      code: `<Drawer>
  <DrawerTrigger render={<Button variant="outline">打开抽屉</Button>} />
  <DrawerContent
    title="设置面板"
    description="在这里调整你的偏好设置。"
    footer={
      <>
        <DrawerClose render={<Button variant="outline">取消</Button>} />
        <DrawerClose render={<Button>保存</Button>} />
      </>
    }
  >
    {/* 正文内容 */}
  </DrawerContent>
</Drawer>`,
      render: () => <Demo side="right" />,
    },
    {
      title: "贴边方向",
      description:
        "side 控制贴边方位与滑入方向：left / right 为侧边竖抽屉，top / bottom 为横向抽屉。",
      code: `<>
  <Drawer>
    <DrawerTrigger render={<Button variant="outline">左侧</Button>} />
    <DrawerContent side="left" title="左侧抽屉" />
  </Drawer>
  <Drawer>
    <DrawerTrigger render={<Button variant="outline">底部</Button>} />
    <DrawerContent side="bottom" title="底部抽屉" />
  </Drawer>
</>`,
      render: () => (
        <div className="flex flex-wrap gap-3">
          <Demo side="left" />
          <Demo side="bottom" />
        </div>
      ),
    },
    {
      title: "长内容滚动 + 钉底操作区",
      description: "正文超长时独立滚动，footer 始终钉底可见，不被内容挤走。",
      code: `<Drawer>
  <DrawerTrigger render={<Button variant="outline">打开</Button>} />
  <DrawerContent
    side="right"
    title="设置面板"
    footer={
      <>
        <DrawerClose render={<Button variant="outline">取消</Button>} />
        <DrawerClose render={<Button>保存</Button>} />
      </>
    }
  >
    {/* 大量配置项，正文区自动滚动 */}
  </DrawerContent>
</Drawer>`,
      render: () => <Demo side="right" />,
    },
    {
      title: "标题行操作",
      description:
        "extra 把按钮排到标题右侧，且不参与无障碍名。别把按钮塞进 title：它渲染成 h2，读屏会把按钮文案一起念成抽屉的名字。",
      code: `<DrawerContent
  side="right"
  title="通知"
  extra={<Button variant="ghost" size="sm">全部已读</Button>}
>
  {/* 通知列表 */}
</DrawerContent>`,
      render: () => <ExtraDemo />,
    },
  ],
  controls: [
    {
      prop: "side",
      type: "select",
      options: ["left", "right", "top", "bottom"],
      defaultValue: "right",
      label: "side",
    },
  ],
  states: [
    { name: "right（默认）", render: () => <Demo side="right" /> },
    { name: "left", render: () => <Demo side="left" /> },
    { name: "top", render: () => <Demo side="top" /> },
    { name: "bottom", render: () => <Demo side="bottom" /> },
    { name: "标题行操作（extra）", render: () => <ExtraDemo /> },
  ],
  renderWithProps: (p) => <Demo side={(p.side as DrawerSide) ?? "right"} />,
  toCode: (p) =>
    `<Drawer>\n  <DrawerTrigger render={<Button>打开</Button>} />\n  <DrawerContent\n    side="${p.side}"\n    title="设置面板"\n    footer={<>\n      <DrawerClose render={<Button variant="outline">取消</Button>} />\n      <DrawerClose render={<Button>保存</Button>} />\n    </>}\n  >\n    {/* 正文（超长自动滚动，footer 钉底） */}\n  </DrawerContent>\n</Drawer>`,
};
