"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AgentPlan,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  CodeDiff,
  CodeReviewThread,
  DiffStat,
  List,
  ScoreRing,
  StreamingText,
  Tag,
  ThinkingBlock,
  ToolCall,
  toast,
  type AgentTask,
  type CodeDiffAnnotation,
  type ReviewSeverity,
  type TagTone,
} from "@hulianui/ui";
import type {
  ChangedFile,
  InlineAnnotation,
  Repo,
  Review,
  ReviewModel,
  ReviewStep,
  Severity,
} from "../_data/types";

interface ReviewDetailProps {
  review: Review;
  repos: Repo[];
  models: ReviewModel[];
}

// severity → 圆点颜色 + 中文 + Tag tone（与库 ReviewSeverity 同集合）。
const SEVERITY_META: Record<Severity, { label: string; dot: string; tone: TagTone }> = {
  critical: { label: "严重", dot: "bg-danger", tone: "danger" },
  major: { label: "重要", dot: "bg-warning", tone: "warning" },
  minor: { label: "次要", dot: "bg-brand", tone: "brand" },
  info: { label: "提示", dot: "bg-muted", tone: "neutral" },
};

const SEVERITY_ORDER: Severity[] = ["critical", "major", "minor", "info"];

function SeverityDot({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-block size-2.5 rounded-full ${SEVERITY_META[severity].dot}`}
      aria-label={SEVERITY_META[severity].label}
    />
  );
}

/** 把 ChangedFile.annotations 映射成 CodeDiff 的 annotations（行下方插 CodeReviewThread）。 */
function toCodeDiffAnnotations(file: ChangedFile): CodeDiffAnnotation[] {
  return file.annotations.map((a: InlineAnnotation, i) => ({
    side: "new" as const,
    line: a.line,
    gutter: <SeverityDot severity={a.severity} />,
    content: (
      <CodeReviewThread
        comments={[
          {
            id: `${file.path}-${a.line}-${i}`,
            author: { name: a.author, kind: a.authorKind },
            severity: a.severity as ReviewSeverity,
            body: a.body,
            suggestion: a.suggestion,
          },
        ]}
        onAdoptSuggestion={() =>
          toast({ tone: "success", title: "已采纳建议", description: `${file.path}:${a.line} 的修改建议已写入工作区。` })
        }
        onStatusChange={() => {}}
      />
    ),
  }));
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-sm font-semibold text-foreground">{children}</h3>;
}

export function ReviewDetail({ review, repos, models }: ReviewDetailProps) {
  const [selectedPath, setSelectedPath] = useState(review.files[0]?.path ?? "");

  const repoName = repos.find((r) => r.id === review.repoId)?.name ?? review.repoId;
  const modelName = models.find((m) => m.id === review.modelId)?.name ?? review.modelId;

  const selectedFile = useMemo(
    () => review.files.find((f) => f.path === selectedPath) ?? review.files[0],
    [review.files, selectedPath],
  );

  const diffAnnotations = useMemo(
    () => (selectedFile ? toCodeDiffAnnotations(selectedFile) : []),
    [selectedFile],
  );

  // 全文件问题按严重度分组计数。
  const severityCounts = useMemo(() => {
    const counts: Record<Severity, number> = { critical: 0, major: 0, minor: 0, info: 0 };
    for (const f of review.files) for (const a of f.annotations) counts[a.severity] += 1;
    return counts;
  }, [review.files]);

  const blocked = review.gate === "block";

  return (
    <div className="flex flex-col gap-4">
      {/* ── 顶部门禁 Banner ── */}
      <Banner
        tone={blocked ? "danger" : "success"}
        align="start"
        action={
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast({ tone: "info", title: "已重新提交审查", description: `${repoName} · ${review.branch}` })
              }
            >
              重新审查
            </Button>
            <Button
              variant="solid"
              size="sm"
              tone={blocked ? "danger" : "brand"}
              onClick={() =>
                toast({
                  tone: blocked ? "danger" : "neutral",
                  title: blocked ? "已强制合并（绕过门禁）" : "已合并",
                  description: blocked ? "本次合并跳过了门禁阻断，已记入审计日志。" : `${review.branch} 已合入。`,
                })
              }
            >
              {blocked ? "强制合并" : "合并"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">{blocked ? "门禁阻断" : "门禁通过"}</span>
          {blocked && review.gateReasons.length > 0 ? (
            <ul className="list-disc space-y-0.5 pl-4 text-[13px]">
              {review.gateReasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          ) : (
            <span className="text-[13px]">
              质量分 {review.score} · 覆盖率 {review.coverage}% · 严重问题 0，可安全合并。
            </span>
          )}
        </div>
      </Banner>

      {/* ── 标题行 ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{review.title}</h2>
        <Tag tone="neutral" size="sm">
          {repoName}
        </Tag>
        <span className="font-mono text-[13px] text-muted">{review.branch}</span>
        <span className="text-[13px] text-muted">
          {review.author.name} · {review.createdAt}
        </span>
      </div>

      {/* ── 三栏 ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        {/* 左栏：改动文件列表 */}
        <Card>
          <CardHeader>
            <span className="text-sm font-semibold">
              改动文件 <span className="text-muted">({review.files.length})</span>
            </span>
          </CardHeader>
          <CardBody className="p-0">
            <List split inset size="sm">
              {review.files.map((file) => {
                const active = file.path === selectedFile?.path;
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedPath(file.path)}
                    className={`flex w-full flex-col gap-1.5 border-l-2 px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "border-primary bg-surface-hover"
                        : "border-transparent hover:bg-surface-hover"
                    }`}
                  >
                    <span className="break-all font-mono text-[12.5px] leading-snug text-foreground">
                      {file.path}
                    </span>
                    <DiffStat additions={file.additions} deletions={file.deletions} status={file.status} size="sm" />
                  </button>
                );
              })}
            </List>
          </CardBody>
        </Card>

        {/* 中栏：选中文件 diff + 行内批注 */}
        <div className="min-w-0">
          {selectedFile ? (
            <CodeDiff
              filename={selectedFile.path}
              oldText={selectedFile.oldText}
              newText={selectedFile.newText}
              annotations={diffAnnotations}
            />
          ) : (
            <Card>
              <CardBody>
                <p className="text-sm text-muted">本次审查无文件改动。</p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* 右栏：AI 审查过程回放 + 结论 */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold">AI 审查过程</span>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              <ReviewSteps steps={review.steps} />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-col items-center gap-4">
              <ScoreRing value={review.score} max={100} size={120} label="质量分" />

              <div className="w-full">
                <SectionTitle>问题汇总</SectionTitle>
                <List split inset size="sm">
                  {SEVERITY_ORDER.map((sev) => (
                    <div key={sev} className="flex items-center justify-between py-1.5">
                      <span className="flex items-center gap-2 text-[13px]">
                        <SeverityDot severity={sev} />
                        {SEVERITY_META[sev].label}
                      </span>
                      <Tag tone={SEVERITY_META[sev].tone} size="sm" variant="soft">
                        {severityCounts[sev]}
                      </Tag>
                    </div>
                  ))}
                </List>
              </div>

              <div className="w-full space-y-1.5 border-t border-border pt-3 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted">主审模型</span>
                  <span className="font-medium">{modelName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">代码覆盖率</span>
                  <span className="font-medium">{review.coverage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">本次成本</span>
                  <span className="font-mono font-medium">¥{review.cost.toFixed(3)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** 右栏：遍历 steps 按 kind 渲染对应 AI 组件。 */
function ReviewSteps({ steps }: { steps: ReviewStep[] }) {
  const toolStatus: Record<string, "pending" | "running" | "success" | "error"> = {
    pending: "pending",
    running: "running",
    done: "success",
  };

  return (
    <>
      {steps.map((step, i) => {
        const key = `${step.kind}-${i}`;
        if (step.kind === "plan") {
          const tasks: AgentTask[] = [
            {
              title: step.title,
              status: step.status === "running" ? "running" : "done",
              detail: step.detail,
            },
          ];
          return <AgentPlan key={key} title="审查计划" tasks={tasks} bare strikeDone={false} />;
        }
        if (step.kind === "tool") {
          return (
            <ToolCall
              key={key}
              name={step.tool ?? step.title}
              status={toolStatus[step.status ?? "done"] ?? "success"}
              defaultOpen
              output={step.output ? <pre className="whitespace-pre-wrap text-[12px]">{step.output}</pre> : undefined}
            />
          );
        }
        if (step.kind === "thinking") {
          return (
            <ThinkingBlock
              key={key}
              title={step.title}
              thinking={step.status === "running"}
              defaultOpen={step.status === "running"}
            >
              <p className="text-[13px] leading-relaxed text-muted">{step.detail}</p>
            </ThinkingBlock>
          );
        }
        // summary
        return (
          <div key={key} className="rounded-[var(--radius)] border border-border bg-surface-hover px-3 py-2.5">
            <div className="mb-1 text-[13px] font-semibold">{step.title}</div>
            <StreamingText
              as="p"
              className="text-[13px] leading-relaxed text-muted"
              text={step.detail ?? ""}
              streaming={false}
            />
          </div>
        );
      })}
    </>
  );
}
