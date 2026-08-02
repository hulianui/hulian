"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GitCommit } from "./git-commit";

function Avatar({ children }: { children: string }) {
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
      {children}
    </span>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-border py-2.5 last:border-0">{children}</div>;
}

export const gitCommitShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "分支 chip + 短哈希 + 提交信息，inline 单行排版。",
      code: `<GitCommit
  branch="master"
  sha="10577b9aaaa"
  message="fix(www): ai-chat 部署站无响应"
/>`,
      render: () => (
        <div className="w-[30rem] max-w-full">
          <GitCommit sha="10577b9aaaa" branch="master" message="fix(www): ai-chat 部署站无响应" />
        </div>
      ),
    },
    {
      title: "两行排版",
      description: 'layout="stacked" 信息在上、引用在下，表格/列表单元格刚需。',
      code: `<GitCommit
  layout="stacked"
  branch="master"
  sha="36e347faaa"
  message="feat(www): 全局路由进度条"
  author="瑚琏"
  avatar={<Avatar>瑚</Avatar>}
/>`,
      render: () => (
        <div className="w-[26rem] max-w-full">
          <GitCommit
            layout="stacked"
            sha="36e347faaa"
            branch="master"
            message="feat(www): 全局路由进度条"
            author="瑚琏"
            avatar={<Avatar>瑚</Avatar>}
          />
        </div>
      ),
    },
    {
      title: "可点击短哈希",
      description: "传 href 让短哈希可跳转到 commit 详情，shaLength 控制位数。",
      code: `<>
  <GitCommit branch="release" sha="cb2ae42ddd0099" href="#cb2ae42" message="chore(release): @hulianui/ui@0.1.2" />
  <GitCommit branch="hotfix" sha="f79cbb812345" shaLength={12} message="发丝边框 token" />
</>`,
      render: () => (
        <div className="flex flex-col gap-2.5">
          <GitCommit
            sha="cb2ae42ddd0099"
            branch="release"
            href="https://example.com/#cb2ae42"
            message="chore(release): @hulianui/ui@0.1.2"
          />
          <GitCommit sha="f79cbb812345" shaLength={12} branch="hotfix" message="发丝边框 token" />
        </div>
      ),
    },
    {
      title: "小尺寸 · 仅引用",
      description: 'size="sm" 紧凑化；省略 message 只渲分支 + 哈希引用。',
      code: `<>
  <GitCommit size="sm" branch="master" sha="10577b9000" author="瑚琏" avatar={<Avatar>瑚</Avatar>} />
  <GitCommit size="sm" branch="feat/x" sha="abcdef0123" />
</>`,
      render: () => (
        <div className="flex flex-col gap-2">
          <GitCommit
            size="sm"
            sha="10577b9000"
            branch="master"
            author="瑚琏"
            avatar={<Avatar>瑚</Avatar>}
          />
          <GitCommit size="sm" sha="abcdef0123" branch="feat/x" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "layout", type: "select", options: ["inline", "stacked"], defaultValue: "inline" },
    { prop: "size", type: "select", options: ["md", "sm"], defaultValue: "md" },
  ],
  states: [
    {
      name: "inline 单行",
      render: () => (
        <div className="w-[30rem] max-w-full">
          <Row>
            <GitCommit
              sha="10577b9aaaa"
              branch="master"
              message="fix(www,mocks): ai-chat 部署站无响应"
            />
          </Row>
          <Row>
            <GitCommit
              sha="33434b9bbbb"
              branch="feat/loading"
              message="feat(www): 组件页加 loading 骨架"
            />
          </Row>
        </div>
      ),
    },
    {
      name: "stacked 两行（表格/列表单元格）",
      render: () => (
        <div className="w-[26rem] max-w-full">
          <Row>
            <GitCommit
              layout="stacked"
              sha="36e347faaa"
              branch="master"
              message="feat(www): 全局路由进度条，修复 App Router 导航零反馈"
              author="瑚琏"
              avatar={<Avatar>瑚</Avatar>}
            />
          </Row>
          <Row>
            <GitCommit
              layout="stacked"
              sha="24fa7bbccc"
              branch="docs/readme"
              message="docs(readme): 加「发版（维护者）」章节"
              author="林屿"
              avatar={<Avatar>林</Avatar>}
            />
          </Row>
        </div>
      ),
    },
    {
      name: "可点击短哈希 + 自定义位数",
      render: () => (
        <div className="flex flex-col gap-2.5">
          <GitCommit
            sha="cb2ae42ddd0099"
            branch="release"
            href="https://example.com/#cb2ae42"
            message="chore(release): @hulianui/ui@0.1.2"
          />
          <GitCommit sha="f79cbb812345" shaLength={12} branch="hotfix" message="发丝边框 token" />
        </div>
      ),
    },
    {
      name: "小尺寸 · 仅引用（无 message）",
      render: () => (
        <div className="flex flex-col gap-2">
          <GitCommit
            size="sm"
            sha="10577b9000"
            branch="master"
            author="瑚琏"
            avatar={<Avatar>瑚</Avatar>}
          />
          <GitCommit size="sm" sha="abcdef0123" branch="feat/x" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-80 max-w-full">
      <GitCommit
        sha="10577b9aaaa"
        branch="master"
        message="fix(www): ai-chat 部署站无响应"
        author="瑚琏"
        avatar={<Avatar>瑚</Avatar>}
        layout={(p.layout as "inline" | "stacked") ?? "inline"}
        size={(p.size as "md" | "sm") ?? "md"}
      />
    </div>
  ),
  toCode: (p) =>
    `<GitCommit\n  branch="master"\n  sha={deploy.sha}\n  message={deploy.message}${
      p.layout === "stacked" ? '\n  layout="stacked"' : ""
    }${p.size === "sm" ? '\n  size="sm"' : ""}\n/>`,
};
