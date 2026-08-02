/** @jsxImportSource ../../../lib/fixture-jsx */
// 中后台页头区块 —— 面包屑 + 大标题 + 副标题 + 右侧操作区（主按钮 + 次按钮 + 状态 Tag）。
// 复制后改：breadcrumbs 路径、title/description 文案、操作按钮 onClick。
// 可选 tag：传 null 则不显示过滤标签；leftActions 槽位可放搜索、筛选等扩展元素。

import { Breadcrumb, Button, Heading, Tag, Text } from "@hulianui/ui";
import { Download, Plus } from "lucide-react";

const breadcrumbs = [
  { label: "工作台", href: "#" },
  { label: "客户管理", href: "#" },
  { label: "客户列表" },
];

export function PageHeaderBlock() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* 左侧：面包屑 + 标题行 */}
        <div className="min-w-0 flex-1">
          <Breadcrumb items={breadcrumbs} className="mb-2" />
          <div className="flex flex-wrap items-center gap-2">
            <Heading level={1} size="2xl" weight="bold" className="text-foreground">
              客户列表
            </Heading>
            <Tag tone="brand" variant="soft" size="sm" dot>
              跟进中 · 24
            </Tag>
          </div>
          <Text tone="muted" size="sm" className="mt-1">
            管理全部客户档案，跟进商机进展与成交记录。
          </Text>
        </div>

        {/* 右侧：操作按钮组 */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            导出
          </Button>
          <Button size="sm">
            <Plus className="size-4" />
            新建客户
          </Button>
        </div>
      </div>
    </div>
  );
}
