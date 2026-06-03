"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { modal } from "./modal";
import type { ModalType } from "./modal.types";

// imperative 承载：Provider 由 /components 段 layout 单挂（同 Toast 范式），
// showcase 只放触发按钮，绝不在此挂 Provider（ComponentDoc 双渲染 states[0] 会重复弹）。

export const modalShowcase: ShowcaseSpec = {
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
