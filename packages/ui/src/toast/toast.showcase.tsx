"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { toast } from "./toast";
import type { ToastTone } from "./toast.types";

// imperative 承载：Provider 由 /components 段 layout 单挂（见 spec §3.2），
// showcase 只放「点我弹 toast」触发按钮，绝不在此挂 Provider（ComponentDoc 双渲染 states[0] 会重复）。

export const toastShowcase: ShowcaseSpec = {
  controls: [
    { prop: "tone", type: "select", options: ["info", "danger", "neutral"], defaultValue: "neutral", label: "语调" },
    { prop: "title", type: "text", defaultValue: "已保存", label: "标题" },
    { prop: "description", type: "text", defaultValue: "更改已成功同步。", label: "描述" },
    { prop: "timeout", type: "number", defaultValue: 5000, label: "消失(ms,0=常驻)" },
  ],
  states: [
    {
      name: "info",
      render: () => (
        <Button variant="outline" onClick={() => toast({ tone: "info", title: "有新版本", description: "点击刷新以更新。" })}>
          弹 info
        </Button>
      ),
    },
    {
      name: "danger",
      render: () => (
        <Button variant="outline" onClick={() => toast({ tone: "danger", title: "保存失败", description: "网络异常，请重试。" })}>
          弹 danger
        </Button>
      ),
    },
    {
      name: "neutral",
      render: () => (
        <Button variant="outline" onClick={() => toast({ title: "已复制到剪贴板" })}>
          弹 neutral
        </Button>
      ),
    },
    {
      name: "常驻(timeout:0)",
      render: () => (
        <Button variant="outline" onClick={() => toast({ title: "需手动关闭", description: "timeout=0，点 × 才消失。", timeout: 0 })}>
          弹常驻
        </Button>
      ),
    },
    {
      name: "堆叠(limit 3)",
      render: () => (
        <Button
          variant="outline"
          onClick={() => {
            toast({ tone: "info", title: "第 1 条" });
            toast({ tone: "neutral", title: "第 2 条" });
            toast({ tone: "danger", title: "第 3 条" });
          }}
        >
          连发 3 条
        </Button>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Button
      onClick={() =>
        toast({
          tone: p.tone as ToastTone,
          title: p.title as string,
          description: p.description as string,
          timeout: p.timeout as number,
        })
      }
    >
      弹出 toast
    </Button>
  ),
  toCode: (p) =>
    `toast({\n  tone: "${p.tone}",\n  title: "${p.title}",\n  description: "${p.description}",\n  timeout: ${p.timeout},\n})`,
};
