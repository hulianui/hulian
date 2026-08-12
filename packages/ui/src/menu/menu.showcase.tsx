"use client";
import type { ShowcaseSpec } from "../showcase/types";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuGroup,
  MenuGroupLabel,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from "./menu";
import { Button } from "../button/button";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

// 勾选 / 单选项：菜单展开后第一列即为选中标记（√ 与实心点），未选中的项留空但不塌列。
function SelectionDemo({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Menu defaultOpen={defaultOpen} modal={false}>
      <MenuTrigger render={<Button variant="outline">视图</Button>} />
      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>显示</MenuGroupLabel>
          <MenuCheckboxItem defaultChecked>显示网格</MenuCheckboxItem>
          <MenuCheckboxItem>显示标尺</MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>密度</MenuGroupLabel>
          <MenuRadioGroup defaultValue="comfortable">
            <MenuRadioItem value="compact">紧凑</MenuRadioItem>
            <MenuRadioItem value="comfortable">适中</MenuRadioItem>
            <MenuRadioItem value="loose">宽松</MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
}

// 级联子菜单：选项总数几十个时全部拍平到一级面板不可用，按维度收进二级。
function SubDemo({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Menu defaultOpen={defaultOpen} modal={false}>
      <MenuTrigger render={<Button variant="outline">筛选</Button>} />
      <MenuContent>
        <MenuItem>全部任务</MenuItem>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger>状态</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>待办</MenuItem>
            <MenuItem>进行中</MenuItem>
            <MenuItem>已完成</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>优先级</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>低</MenuItem>
            <MenuItem>中</MenuItem>
            <MenuItem>高</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  );
}

function Demo({ side = "bottom", align = "start", withGroup = false }: { side?: Side; align?: Align; withGroup?: boolean }) {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline">菜单</Button>} />
      <MenuContent side={side} align={align}>
        {withGroup ? (
          <MenuGroup>
            <MenuGroupLabel>操作</MenuGroupLabel>
            <MenuItem>编辑</MenuItem>
            <MenuItem>复制</MenuItem>
          </MenuGroup>
        ) : (
          <>
            <MenuItem>编辑</MenuItem>
            <MenuItem>复制</MenuItem>
            <MenuItem disabled>归档（禁用）</MenuItem>
          </>
        )}
        <MenuSeparator />
        <MenuItem variant="danger">删除</MenuItem>
      </MenuContent>
    </Menu>
  );
}

export const menuShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "Trigger 用 render 接管任意触发元素，Content 内放 MenuItem，Separator 分隔。",
      code: `<Menu>
  <MenuTrigger render={<Button variant="outline">菜单</Button>} />
  <MenuContent>
    <MenuItem>编辑</MenuItem>
    <MenuItem>复制</MenuItem>
    <MenuSeparator />
    <MenuItem variant="danger">删除</MenuItem>
  </MenuContent>
</Menu>`,
      render: () => (
        <Menu>
          <MenuTrigger render={<Button variant="outline">菜单</Button>} />
          <MenuContent>
            <MenuItem>编辑</MenuItem>
            <MenuItem>复制</MenuItem>
            <MenuSeparator />
            <MenuItem variant="danger">删除</MenuItem>
          </MenuContent>
        </Menu>
      ),
    },
    {
      title: "禁用项",
      description: "MenuItem 加 disabled 后不可高亮、不可点击。",
      code: `<Menu>
  <MenuTrigger render={<Button variant="outline">菜单</Button>} />
  <MenuContent>
    <MenuItem>编辑</MenuItem>
    <MenuItem disabled>归档（禁用）</MenuItem>
  </MenuContent>
</Menu>`,
      render: () => (
        <Menu>
          <MenuTrigger render={<Button variant="outline">菜单</Button>} />
          <MenuContent>
            <MenuItem>编辑</MenuItem>
            <MenuItem disabled>归档（禁用）</MenuItem>
          </MenuContent>
        </Menu>
      ),
    },
    {
      title: "分组",
      description: "MenuGroup + MenuGroupLabel 给一组菜单项加小标题。",
      code: `<Menu>
  <MenuTrigger render={<Button variant="outline">菜单</Button>} />
  <MenuContent>
    <MenuGroup>
      <MenuGroupLabel>操作</MenuGroupLabel>
      <MenuItem>编辑</MenuItem>
      <MenuItem>复制</MenuItem>
    </MenuGroup>
    <MenuSeparator />
    <MenuItem variant="danger">删除</MenuItem>
  </MenuContent>
</Menu>`,
      render: () => (
        <Menu>
          <MenuTrigger render={<Button variant="outline">菜单</Button>} />
          <MenuContent>
            <MenuGroup>
              <MenuGroupLabel>操作</MenuGroupLabel>
              <MenuItem>编辑</MenuItem>
              <MenuItem>复制</MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem variant="danger">删除</MenuItem>
          </MenuContent>
        </Menu>
      ),
    },
    {
      title: "勾选项与单选项",
      description:
        "MenuCheckboxItem 是可开关的设置（role=menuitemcheckbox），MenuRadioGroup + MenuRadioItem 是一组互斥选项（role=menuitemradio）；两者都带 aria-checked，读屏能报出当前选中项——用 MenuItem 自画一个勾看起来一样，但这层语义会丢。默认点击不关闭菜单，想选完即收传 closeOnClick。",
      code: `<MenuContent>
  <MenuGroup>
    <MenuGroupLabel>显示</MenuGroupLabel>
    <MenuCheckboxItem defaultChecked>显示网格</MenuCheckboxItem>
    <MenuCheckboxItem>显示标尺</MenuCheckboxItem>
  </MenuGroup>
  <MenuSeparator />
  <MenuGroup>
    <MenuGroupLabel>密度</MenuGroupLabel>
    <MenuRadioGroup defaultValue="comfortable">
      <MenuRadioItem value="compact">紧凑</MenuRadioItem>
      <MenuRadioItem value="comfortable">适中</MenuRadioItem>
      <MenuRadioItem value="loose">宽松</MenuRadioItem>
    </MenuRadioGroup>
  </MenuGroup>
</MenuContent>`,
      render: () => <SelectionDemo />,
    },
    {
      title: "级联子菜单",
      description:
        "MenuSub 裹住 MenuSubTrigger + MenuSubContent，子面板从父项右侧展开，支持多层嵌套。选项按维度分层收纳，适合筛选这类总数几十个、拍平到一级就用不了的场景。",
      code: `<MenuContent>
  <MenuItem>全部任务</MenuItem>
  <MenuSeparator />
  <MenuSub>
    <MenuSubTrigger>状态</MenuSubTrigger>
    <MenuSubContent>
      <MenuItem>待办</MenuItem>
      <MenuItem>进行中</MenuItem>
      <MenuItem>已完成</MenuItem>
    </MenuSubContent>
  </MenuSub>
</MenuContent>`,
      render: () => <SubDemo />,
    },
    {
      title: "弹出方位",
      description: "MenuContent 的 side / align 控制浮层相对触发器的方位。",
      code: `<Menu>
  <MenuTrigger render={<Button variant="outline">菜单</Button>} />
  <MenuContent side="right" align="start">
    <MenuItem>编辑</MenuItem>
    <MenuItem>复制</MenuItem>
  </MenuContent>
</Menu>`,
      render: () => (
        <Menu>
          <MenuTrigger render={<Button variant="outline">菜单</Button>} />
          <MenuContent side="right" align="start">
            <MenuItem>编辑</MenuItem>
            <MenuItem>复制</MenuItem>
          </MenuContent>
        </Menu>
      ),
    },
  ],
  controls: [
    { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "bottom" },
    { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "start" },
    { prop: "withGroup", type: "boolean", defaultValue: false, label: "分组" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "分组", render: () => <Demo withGroup /> },
    // 展开态：选中标记（√ / 实心点）与普通项的图标位共用同一列，文字左缘对齐。
    { name: "勾选项与单选项（展开）", render: () => <SelectionDemo defaultOpen /> },
    // 展开态：子菜单触发项右侧的 chevron 是「还有下一级」在视觉上唯一的线索。
    { name: "级联子菜单（展开）", render: () => <SubDemo defaultOpen /> },
    { name: "right", render: () => <Demo side="right" /> },
    { name: "top", render: () => <Demo side="top" /> },
  ],
  renderWithProps: (p) => (
    <Demo side={p.side as Side} align={p.align as Align} withGroup={p.withGroup as boolean} />
  ),
  toCode: (p) =>
    `<Menu>\n  <MenuTrigger render={<Button>菜单</Button>} />\n  <MenuContent side="${p.side}" align="${p.align}">\n    <MenuItem>编辑</MenuItem>\n    <MenuSeparator />\n    <MenuItem variant="danger">删除</MenuItem>\n  </MenuContent>\n</Menu>`,
};
