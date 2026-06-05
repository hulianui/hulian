"use client";

// 新手引导区块 —— 横向 Steps 步骤条 + 当前步卡片内容 + 进度条 + 上一步/下一步。
// 4 步：创建账号 → 连接仓库 → 配置环境 → 上线发布。每步卡片是占位表单/选项。
// 复制后改：STEPS 步骤定义、各步卡片内容、完成态文案。
// 用 useState 维护 current；点击 Steps 项也可跳转（onChange）。

import { useState } from "react";
import {
  Button,
  Field,
  Heading,
  Input,
  Progress,
  Result,
  Steps,
  Text,
  type StepsItem,
} from "@hulianui/ui";
import { ArrowLeft, ArrowRight, Check, Cloud, GitBranch, Settings2, UserPlus } from "lucide-react";

const STEPS: StepsItem[] = [
  { title: "创建账号", description: "基本信息" },
  { title: "连接仓库", description: "代码来源" },
  { title: "配置环境", description: "运行参数" },
  { title: "上线发布", description: "完成部署" },
];

const STEP_ICONS = [UserPlus, GitBranch, Settings2, Cloud];

export function OnboardingBlock() {
  const [current, setCurrent] = useState(0);

  const total = STEPS.length;
  const isLast = current === total - 1;
  // 进度按"已完成步数"计：到达最后一步即已配置完前 3 步
  const progress = Math.round((current / (total - 1)) * 100);

  const Icon = STEP_ICONS[current];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 text-center">
        <Heading level={1} size="2xl" weight="bold" className="text-foreground">
          欢迎来到瀚云
        </Heading>
        <Text tone="muted" size="sm" className="mt-1">
          只需 4 步，即可把你的第一个应用部署上线。
        </Text>
      </div>

      {/* 步骤条 */}
      <Steps items={STEPS} current={current} onChange={setCurrent} className="mb-8" />

      {/* 当前步卡片 */}
      <div className="rounded-[var(--radius)] border border-border bg-surface p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius)] bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <Heading level={2} size="lg" weight="semibold">
              {STEPS[current].title}
            </Heading>
            <Text tone="muted" size="sm">
              第 {current + 1} 步 / 共 {total} 步
            </Text>
          </div>
        </div>

        {/* 每步占位内容 */}
        {current === 0 && (
          <div className="flex flex-col gap-4">
            <Text tone="muted" size="sm">
              先告诉我们一些基本信息，方便为你创建工作区。
            </Text>
            <Field label="工作区名称">
              <Input placeholder="例如：瀚云电商团队" defaultValue="瀚云电商团队" />
            </Field>
            <Field label="团队邮箱" description="用于接收部署与告警通知">
              <Input type="email" placeholder="team@company.com" />
            </Field>
          </div>
        )}

        {current === 1 && (
          <div className="flex flex-col gap-4">
            <Text tone="muted" size="sm">
              选择代码来源，瀚云将自动拉取并构建你的项目。
            </Text>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {["GitHub", "GitLab", "上传压缩包"].map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={[
                    "rounded-[var(--radius)] border p-4 text-left text-sm font-medium transition-colors",
                    i === 0
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted hover:border-primary/40 hover:text-foreground",
                  ].join(" ")}
                >
                  <GitBranch className="mb-2 size-5 text-primary" />
                  {src}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === 2 && (
          <div className="flex flex-col gap-4">
            <Text tone="muted" size="sm">
              配置运行环境与构建命令，留空将使用智能默认值。
            </Text>
            <Field label="构建命令">
              <Input defaultValue="pnpm build" />
            </Field>
            <Field label="输出目录">
              <Input defaultValue="dist" />
            </Field>
            <Field label="环境变量" description="格式 KEY=VALUE，每行一条">
              <Input placeholder="NODE_ENV=production" />
            </Field>
          </div>
        )}

        {current === 3 && (
          <Result
            status="success"
            icon={<Check className="size-7" />}
            title="一切就绪，准备上线"
            subTitle="配置已完成。点击下方按钮，瀚云将开始构建并把你的应用部署到全球边缘节点。"
          />
        )}

        {/* 进度条 */}
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
            <span>引导进度</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} tone="primary" />
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          >
            <ArrowLeft className="size-4" />
            上一步
          </Button>
          {isLast ? (
            <Button>
              <Cloud className="size-4" />
              立即上线
            </Button>
          ) : (
            <Button onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}>
              下一步
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
