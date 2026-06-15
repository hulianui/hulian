"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { modal } from "./modal";
import type { ModalType } from "./modal.types";

// imperative 承载：Provider 由 /components 段 layout 单挂（同 Toast 范式），
// showcase 只放触发按钮，绝不在此挂 Provider（ComponentDoc 双渲染 states[0] 会重复弹）。

export const modalShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "确认对话框",
      description: "modal.confirm 命令式弹窗，带取消 / 确定双键（需页面挂一个 <ModalProvider />）。",
      code: `modal.confirm({
  title: "确认删除该记录？",
  content: "删除后无法恢复。",
  onOk: () => {
    // 执行删除
  },
})`,
      render: () => (
        <Button
          variant="outline"
          onClick={() =>
            modal.confirm({
              title: "确认删除该记录？",
              content: "删除后无法恢复。",
              onOk: () => {},
            })
          }
        >
          confirm 确认
        </Button>
      ),
    },
    {
      title: "信息提示类型",
      description: "info / success / error / warning 派生不同图标与主色，仅渲染单个确定键。",
      code: `<>
  <Button onClick={() => modal.info({ title: "系统提示", content: "新版本已发布。" })}>info</Button>
  <Button onClick={() => modal.success({ title: "操作成功", content: "数据已保存。" })}>success</Button>
  <Button onClick={() => modal.error({ title: "操作失败", content: "网络异常，请稍后重试。" })}>error</Button>
  <Button onClick={() => modal.warning({ title: "注意", content: "当前空间即将用尽。" })}>warning</Button>
</>`,
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => modal.info({ title: "系统提示", content: "新版本已发布。" })}>
            info
          </Button>
          <Button variant="outline" onClick={() => modal.success({ title: "操作成功", content: "数据已保存。" })}>
            success
          </Button>
          <Button variant="outline" onClick={() => modal.error({ title: "操作失败", content: "网络异常，请稍后重试。" })}>
            error
          </Button>
          <Button variant="outline" onClick={() => modal.warning({ title: "注意", content: "当前空间即将用尽。" })}>
            warning
          </Button>
        </div>
      ),
    },
    {
      title: "异步确定（loading）",
      description: "onOk 返回 Promise 时确定键进 loading；resolve 自动关闭，reject 保持打开。",
      code: `modal.confirm({
  title: "提交订单？",
  content: "点确定将发起一次请求。",
  onOk: () => new Promise((resolve) => setTimeout(resolve, 1200)),
})`,
      render: () => (
        <Button
          variant="outline"
          onClick={() =>
            modal.confirm({
              title: "提交订单？",
              content: "点确定将发起一次模拟请求（约 1.2s）。",
              onOk: () => new Promise((resolve) => setTimeout(resolve, 1200)),
            })
          }
        >
          confirm + 异步
        </Button>
      ),
    },
    {
      title: "自定义按钮文案",
      description: "okText / cancelText 覆盖默认「确定 / 取消」。",
      code: `modal.confirm({
  title: "退出登录？",
  content: "退出后需重新登录。",
  okText: "退出",
  cancelText: "再想想",
  onOk: () => {},
})`,
      render: () => (
        <Button
          variant="outline"
          onClick={() =>
            modal.confirm({
              title: "退出登录？",
              content: "退出后需重新登录。",
              okText: "退出",
              cancelText: "再想想",
              onOk: () => {},
            })
          }
        >
          自定义文案
        </Button>
      ),
    },
  ],
  controls: [
    {
      prop: "type",
      type: "select",
      options: ["confirm", "info", "success", "error", "warning"],
      defaultValue: "confirm",
      label: "类型",
    },
    { prop: "title", type: "text", defaultValue: "确认删除？", label: "标题" },
    { prop: "content", type: "text", defaultValue: "此操作不可撤销，请谨慎操作。", label: "内容" },
    { prop: "okText", type: "text", defaultValue: "确定", label: "确定文案" },
  ],
  states: [
    {
      name: "confirm",
      render: () => (
        <Button
          variant="outline"
          onClick={() =>
            modal.confirm({
              title: "确认删除该记录？",
              content: "删除后无法恢复。",
              onOk: () => {},
            })
          }
        >
          confirm 确认
        </Button>
      ),
    },
    {
      name: "info",
      render: () => (
        <Button variant="outline" onClick={() => modal.info({ title: "系统提示", content: "新版本已发布。" })}>
          info 信息
        </Button>
      ),
    },
    {
      name: "success",
      render: () => (
        <Button variant="outline" onClick={() => modal.success({ title: "操作成功", content: "数据已保存。" })}>
          success 成功
        </Button>
      ),
    },
    {
      name: "error",
      render: () => (
        <Button variant="outline" onClick={() => modal.error({ title: "操作失败", content: "网络异常，请稍后重试。" })}>
          error 错误
        </Button>
      ),
    },
    {
      name: "warning",
      render: () => (
        <Button variant="outline" onClick={() => modal.warning({ title: "注意", content: "当前空间即将用尽。" })}>
          warning 警告
        </Button>
      ),
    },
    {
      name: "异步确定(loading)",
      render: () => (
        <Button
          variant="outline"
          onClick={() =>
            modal.confirm({
              title: "提交订单？",
              content: "点确定将发起一次模拟请求（约 1.2s）。",
              onOk: () => new Promise((resolve) => setTimeout(resolve, 1200)),
            })
          }
        >
          confirm + 异步
        </Button>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Button
      onClick={() =>
        modal[p.type as ModalType]({
          title: p.title as string,
          content: p.content as string,
          okText: p.okText as string,
        })
      }
    >
      打开 {p.type as string}
    </Button>
  ),
  toCode: (p) =>
    `modal.${p.type}({\n  title: "${p.title}",\n  content: "${p.content}",\n  okText: "${p.okText}",\n  onOk: () => {},\n})`,
};
