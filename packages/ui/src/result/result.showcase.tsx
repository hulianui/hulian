"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Result } from "./result";
import type { ResultStatus } from "./result.types";

const STATUSES: ResultStatus[] = ["success", "error", "info", "warning", "403", "404", "500"];

export const resultShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "成功结果",
      description: "操作完成后的成功反馈，content 槽承载补充信息，children 槽放后续操作。",
      code: `<Result status="success" title="支付成功" subTitle="订单 #2024-0612 已完成，预计 3 天内发货。">
  <Button size="sm">查看订单</Button>
  <Button size="sm" variant="outline">返回首页</Button>
</Result>`,
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
      title: "失败结果（含详情）",
      description: "content 区渲染在副标题下方、操作区上方，适合堆错误明细。",
      code: `<Result
  status="error"
  title="提交失败"
  subTitle="请检查并修改以下信息后重试。"
  content="账户名包含非法字符；手机号格式不正确。"
>
  <Button size="sm">返回修改</Button>
</Result>`,
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
      title: "信息与警告",
      description: "info / warning 两种语义状态，搭配各自的内置图标与语义色。",
      code: `<>
  <Result status="info" title="审核中" subTitle="资料已提交，预计 1 个工作日内完成审核。" />
  <Result status="warning" title="即将到期" subTitle="你的会员将于 3 天后到期，请及时续费。" />
</>`,
      render: () => (
        <>
          <Result status="info" title="审核中" subTitle="资料已提交，预计 1 个工作日内完成审核。" />
          <Result status="warning" title="即将到期" subTitle="你的会员将于 3 天后到期，请及时续费。" />
        </>
      ),
    },
    {
      title: "HTTP 错误页",
      description: "403 / 404 / 500 用于异常路由的整页占位，内置锁/搜索/服务器图标。",
      code: `<Result status="404" title="404" subTitle="抱歉，你访问的页面不存在。">
  <Button size="sm" variant="outline">返回首页</Button>
</Result>`,
      render: () => (
        <Result status="404" title="404" subTitle="抱歉，你访问的页面不存在。">
          <Button size="sm" variant="outline">
            返回首页
          </Button>
        </Result>
      ),
    },
    {
      title: "隐藏图标",
      description: "icon 传 null 不渲染图标区，只保留标题与说明。",
      code: `<Result icon={null} status="info" title="无图标结果" subTitle="仅展示文本，不渲染顶部状态图标。" />`,
      render: () => (
        <Result icon={null} status="info" title="无图标结果" subTitle="仅展示文本，不渲染顶部状态图标。" />
      ),
    },
  ],
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
