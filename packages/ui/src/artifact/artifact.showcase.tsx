"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { File } from "../_icons";
import { Artifact } from "./artifact";

const LONG_BODY = (
  <div className="space-y-3 text-sm text-foreground">
    <p className="font-medium">致 云栖科技 · 应聘 总裁私人秘书</p>
    <p>
      五年行政与跨部门协调经验，曾独立支撑 CEO 办公室全年 200+ 场会议与差旅安排，
      擅长在信息密度极高的环境里维持秩序与优先级。
    </p>
    <p>
      在前公司期间搭建了高管日程冲突自动检测流程，将排期返工率降低 60%；
      主导年度董事会材料的编排与保密流转，零差错交付三年。
    </p>
    <p>
      我深知贵司正处于多产品线并行扩张期，总裁办公室需要的不只是执行，
      更是预判与兜底。我愿以两周试用证明上述判断。
    </p>
  </div>
);

const Demo = () => (
  <div className="w-full max-w-md">
    <Artifact
      title="简历草稿 · 林晚晴"
      icon={<File className="size-4" />}
      version="v2"
      actions={
        <Button size="sm" variant="ghost">
          导出
        </Button>
      }
    >
      {LONG_BODY}
    </Artifact>
  </div>
);

export const artifactShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "折叠态（限高 + 渐隐 + 展开按钮）", render: () => <Demo /> },
    {
      name: "默认展开",
      render: () => (
        <div className="w-full max-w-md">
          <Artifact title="简历草稿" version="v1" defaultExpanded>
            {LONG_BODY}
          </Artifact>
        </div>
      ),
    },
    {
      name: "不可折叠（collapsedHeight=0）",
      render: () => (
        <div className="w-full max-w-md">
          <Artifact title="简短产出" collapsedHeight={0}>
            <p className="text-sm">一段不需要折叠的简短内容。</p>
          </Artifact>
        </div>
      ),
    },
  ],
  renderWithProps: () => <Demo />,
  toCode: () => `<Artifact title="简历草稿" version="v2" actions={<Button>导出</Button>}>…</Artifact>`,
};
