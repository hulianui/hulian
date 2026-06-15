"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { notification } from "./notification";
import type { NotificationPlacement, NotificationType } from "./notification.types";

// imperative 承载：Provider 由 /components 段 layout 单挂（同 Toast/Modal 范式），
// showcase 只放触发按钮，绝不在此挂 Provider。

export const notificationShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "五类型",
      description: "notification.success / error / info / warning / open，派生左侧色条与默认图标。",
      code: `notification.success({ title: "保存成功", description: "更改已同步。" });
notification.error({ title: "上传失败", description: "文件过大，请压缩后重试。" });
notification.info({ title: "系统通知", description: "维护窗口将于今晚开始。" });
notification.warning({ title: "空间不足", description: "剩余容量低于 10%。" });`,
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => notification.success({ title: "保存成功", description: "更改已同步。" })}
          >
            success
          </Button>
          <Button
            variant="outline"
            onClick={() => notification.error({ title: "上传失败", description: "文件过大，请压缩后重试。" })}
          >
            error
          </Button>
          <Button
            variant="outline"
            onClick={() => notification.info({ title: "系统通知", description: "维护窗口将于今晚开始。" })}
          >
            info
          </Button>
          <Button
            variant="outline"
            onClick={() => notification.warning({ title: "空间不足", description: "剩余容量低于 10%。" })}
          >
            warning
          </Button>
        </div>
      ),
    },
    {
      title: "带操作按钮 + 常驻",
      description: "btn 槽放操作按钮，duration=0 时不自动关闭。",
      code: `notification.open({
  title: "收到一条好友请求",
  description: "来自 设计部·小琏",
  duration: 0,
  btn: <Button size="sm">查看</Button>,
});`,
      render: () => (
        <Button
          variant="outline"
          onClick={() =>
            notification.open({
              title: "收到一条好友请求",
              description: "来自 设计部·小琏",
              duration: 0,
              btn: (
                <Button size="sm" onClick={() => {}}>
                  查看
                </Button>
              ),
            })
          }
        >
          带操作(常驻)
        </Button>
      ),
    },
    {
      title: "四角位置",
      description: "placement 指定弹出位置：topRight / topLeft / bottomRight / bottomLeft。",
      code: `notification.info({ title: "提示", description: "弹在指定角落", placement: "bottomLeft" });`,
      render: () => (
        <div className="flex flex-wrap gap-2">
          {(["topRight", "topLeft", "bottomRight", "bottomLeft"] as NotificationPlacement[]).map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              onClick={() => notification.info({ title: p, description: `弹在 ${p}`, placement: p })}
            >
              {p}
            </Button>
          ))}
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "type",
      type: "select",
      options: ["open", "success", "error", "info", "warning"],
      defaultValue: "success",
      label: "类型",
    },
    {
      prop: "placement",
      type: "select",
      options: ["topRight", "topLeft", "bottomRight", "bottomLeft"],
      defaultValue: "topRight",
      label: "位置",
    },
    { prop: "title", type: "text", defaultValue: "操作成功", label: "标题" },
    { prop: "description", type: "text", defaultValue: "数据已成功同步到云端。", label: "描述" },
    { prop: "duration", type: "number", defaultValue: 4500, label: "时长(ms,0=常驻)" },
  ],
  states: [
    {
      name: "success",
      render: () => (
        <Button
          variant="outline"
          onClick={() => notification.success({ title: "保存成功", description: "更改已同步。" })}
        >
          success
        </Button>
      ),
    },
    {
      name: "error",
      render: () => (
        <Button
          variant="outline"
          onClick={() => notification.error({ title: "上传失败", description: "文件过大，请压缩后重试。" })}
        >
          error
        </Button>
      ),
    },
    {
      name: "info / warning",
      render: () => (
        <Button
          variant="outline"
          onClick={() => {
            notification.info({ title: "系统通知", description: "维护窗口将于今晚开始。" });
            notification.warning({ title: "空间不足", description: "剩余容量低于 10%。" });
          }}
        >
          info + warning
        </Button>
      ),
    },
    {
      name: "带操作按钮 + 常驻",
      render: () => (
        <Button
          variant="outline"
          onClick={() =>
            notification.open({
              title: "收到一条好友请求",
              description: "来自 设计部·小琏",
              duration: 0,
              btn: (
                <Button size="sm" onClick={() => {}}>
                  查看
                </Button>
              ),
            })
          }
        >
          带操作(常驻)
        </Button>
      ),
    },
    {
      name: "四角位置",
      render: () => (
        <div className="flex flex-wrap gap-2">
          {(["topRight", "topLeft", "bottomRight", "bottomLeft"] as NotificationPlacement[]).map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              onClick={() => notification.info({ title: p, description: `弹在 ${p}`, placement: p })}
            >
              {p}
            </Button>
          ))}
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Button
      onClick={() =>
        notification[p.type as NotificationType]({
          title: p.title as string,
          description: p.description as string,
          placement: p.placement as NotificationPlacement,
          duration: p.duration as number,
        })
      }
    >
      弹通知
    </Button>
  ),
  toCode: (p) =>
    `notification.${p.type}({\n  title: "${p.title}",\n  description: "${p.description}",\n  placement: "${p.placement}",\n  duration: ${p.duration},\n})`,
};
