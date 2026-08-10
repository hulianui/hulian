/** @jsxImportSource ../../../lib/fixture-jsx */
// 空状态区块 —— 两种范式并排展示：Empty（暂无数据）和 Result（操作结果/无结果）。
// Empty：图标 + 标题 + 描述 + CTA，适用于列表/表格无数据占位。
// Result：status 驱动图标色（success/error/info/warning/404/403/500），适用于页面级结果反馈。
// 复制后改：Empty 的 title/description/按钮文案；Result 的 status/title/subTitle/children CTA。

import { Button, Empty, Result } from "@hulianui/ui";
import { Plus, RefreshCw } from "lucide-react";

export function EmptyStateBlock() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 范式一：Empty —— 列表/表格空态占位 */}
        <div className="rounded-[var(--radius)] border border-border bg-surface p-6">
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            范式一 · Empty（暂无数据）
          </div>
          <Empty
            title="暂无客户数据"
            description="还没有添加任何客户，从新建第一个客户开始，管理你的商机与成交记录。"
          >
            <Button size="sm">
              <Plus className="size-4" />
              新建客户
            </Button>
            <Button variant="outline" size="sm">
              导入数据
            </Button>
          </Empty>
        </div>

        {/* 范式二：Result —— 页面级结果反馈（success / 404 / error 等） */}
        <div className="flex flex-col gap-4">
          {/* 2a：操作成功 */}
          <div className="rounded-[var(--radius)] border border-border bg-surface p-6">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              范式二 a · Result success
            </div>
            <Result
              status="success"
              title="提交成功"
              subTitle="你的报价单已发送至客户邮箱，等待对方确认。预计 1-2 个工作日内回复。"
            >
              <Button size="sm">查看详情</Button>
              <Button variant="outline" size="sm">
                返回列表
              </Button>
            </Result>
          </div>

          {/* 2b：无搜索结果 */}
          <div className="rounded-[var(--radius)] border border-border bg-surface p-6">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              范式二 b · Result 404（无结果）
            </div>
            <Result
              status="404"
              title="没有找到相关结果"
              subTitle="尝试修改关键词或调整筛选条件，也可以清空全部筛选重新搜索。"
            >
              <Button
                variant="outline"
                size="sm"
              >
                <RefreshCw className="size-4" />
                清空筛选
              </Button>
            </Result>
          </div>
        </div>
      </div>
    </div>
  );
}
