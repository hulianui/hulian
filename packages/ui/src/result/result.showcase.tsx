"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Result } from "./result";
import type { ResultStatus } from "./result.types";

const STATUSES: ResultStatus[] = ["success", "error", "info", "warning", "403", "404", "500"];

export const resultShowcase: ShowcaseSpec = {
  controls: [
    { prop: "status", type: "select", options: STATUSES, defaultValue: "success" },
    { prop: "title", type: "text", defaultValue: "操作成功" },
    { prop: "subTitle", type: "text", defaultValue: "你的提交已保存，可继续后续操作。" },
  ],
  states: [
    {
      name: "成功",
      render: () => (
        <Result status="success" title="支付成功" subTitle="订单 #2024-0612 已完成，预计 3 天内发货。">
          <Button size="sm">查看订单</Button>
          <Button size="sm" variant="outline">
            返回首页
          </Button>
        </Result>
      ),
    },
    {
      name: "失败",
      render: () => (
        <Result
          status="error"
          title="提交失败"
          subTitle="请检查并修改以下信息后重试。"
          content="账户名包含非法字符；手机号格式不正确。"
        >
          <Button size="sm">返回修改</Button>
        </Result>
      ),
    },
    {
      name: "403",
      render: () => (
        <Result status="403" title="403" subTitle="抱歉，你无权访问此页面。">
          <Button size="sm" variant="outline">
            返回首页
          </Button>
        </Result>
      ),
    },
    {
      name: "404",
      render: () => (
        <Result status="404" title="404" subTitle="抱歉，你访问的页面不存在。">
          <Button size="sm" variant="outline">
            返回首页
          </Button>
        </Result>
      ),
    },
    {
      name: "500",
      render: () => (
        <Result status="500" title="500" subTitle="抱歉，服务器出错了，请稍后再试。">
          <Button size="sm">重试</Button>
        </Result>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Result
      status={(p.status as ResultStatus) ?? "success"}
      title={(p.title as string) || undefined}
      subTitle={(p.subTitle as string) || undefined}
    />
  ),
  toCode: (p) =>
    `<Result\n  status="${(p.status as string) ?? "success"}"\n  title="${
      (p.title as string) ?? ""
    }"\n  subTitle="${(p.subTitle as string) ?? ""}"\n>\n  <Button size="sm">返回首页</Button>\n</Result>`,
};
