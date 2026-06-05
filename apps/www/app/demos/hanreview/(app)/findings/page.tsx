"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  CodeBlock,
  CodeDiff,
  Drawer,
  DrawerClose,
  DrawerContent,
  ProTable,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Stat,
  Tag,
  toast,
  type ColumnDef,
} from "@hulian/ui";
import { FINDINGS } from "../../_data/findings";
import { REPOS } from "../../_data/repos";
import type { Finding } from "../../_data/types";

const PAGE_SIZE = 10;

type Severity = Finding["severity"];
type FindingType = Finding["type"];
type FindingStatus = Finding["status"];

const SEVERITY_META: Record<Severity, { label: string; tone: "danger" | "warning" | "brand" | "neutral" }> = {
  critical: { label: "严重", tone: "danger" },
  major: { label: "重要", tone: "warning" },
  minor: { label: "次要", tone: "brand" },
  info: { label: "提示", tone: "neutral" },
};

const TYPE_LABEL: Record<FindingType, string> = {
  bug: "缺陷",
  security: "安全",
  perf: "性能",
  style: "风格",
  complexity: "复杂度",
  test: "测试",
};

const STATUS_META: Record<FindingStatus, { label: string; tone: "neutral" | "success" | "warning" | "danger" }> = {
  open: { label: "待处理", tone: "danger" },
  fixed: { label: "已修", tone: "success" },
  ignored: { label: "已忽略", tone: "neutral" },
  wontfix: { label: "误报", tone: "warning" },
};

const SNIPPET_LANG: ReadonlyArray<[string, string]> = [
  [".tsx", "tsx"],
  [".ts", "ts"],
  [".py", "python"],
  [".json", "json"],
  [".yaml", "yaml"],
];

function langOf(file: string): string {
  return SNIPPET_LANG.find(([ext]) => file.endsWith(ext))?.[1] ?? "ts";
}

const SEVERITIES: Severity[] = ["critical", "major", "minor", "info"];
const TYPES: FindingType[] = ["bug", "security", "perf", "style", "complexity", "test"];
const STATUSES: FindingStatus[] = ["open", "fixed", "ignored", "wontfix"];

export default function FindingsPage() {
  const [severity, setSeverity] = useState("");
  const [type, setType] = useState("");
  const [repoId, setRepoId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Finding | null>(null);
  // 本地处理态覆盖：finding.id → 新 status，模拟服务端写回。
  const [overrides, setOverrides] = useState<Record<string, FindingStatus>>({});

  const all = useMemo<Finding[]>(
    () => FINDINGS.map((f) => (overrides[f.id] ? { ...f, status: overrides[f.id] } : f)),
    [overrides],
  );

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { critical: 0, major: 0, minor: 0, info: 0 };
    for (const f of all) c[f.severity] += 1;
    return c;
  }, [all]);

  const filtered = useMemo(
    () =>
      all.filter((f) => {
        if (severity && f.severity !== severity) return false;
        if (type && f.type !== type) return false;
        if (repoId && f.repoId !== repoId) return false;
        if (status && f.status !== status) return false;
        return true;
      }),
    [all, severity, type, repoId, status],
  );

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function applyStatus(f: Finding, next: FindingStatus) {
    setOverrides((prev) => ({ ...prev, [f.id]: next }));
    setActive((cur) => (cur && cur.id === f.id ? { ...cur, status: next } : cur));
    toast({
      tone: next === "fixed" ? "info" : "neutral",
      title: `已标记为「${STATUS_META[next].label}」`,
      description: f.rule,
    });
  }

  const columns: ColumnDef<Finding>[] = [
    {
      accessorKey: "severity",
      header: "级别",
      cell: ({ row }) => {
        const m = SEVERITY_META[row.original.severity];
        return (
          <Tag tone={m.tone} size="sm" dot>
            {m.label}
          </Tag>
        );
      },
    },
    {
      accessorKey: "type",
      header: "类型",
      cell: ({ row }) => (
        <Tag tone="neutral" size="sm">
          {TYPE_LABEL[row.original.type]}
        </Tag>
      ),
    },
    {
      accessorKey: "rule",
      header: "规则",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.rule}</span>,
    },
    {
      accessorKey: "file",
      header: "文件:行",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.file}:{row.original.line}
        </span>
      ),
    },
    {
      accessorKey: "reviewId",
      header: "所属审查",
      cell: ({ row }) => (
        <Link
          href={`/demos/hanreview/reviews/${row.original.reviewId}`}
          className="font-mono text-sm text-primary hover:underline"
        >
          {row.original.reviewId}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const m = STATUS_META[row.original.status];
        return (
          <Tag tone={m.tone} size="sm">
            {m.label}
          </Tag>
        );
      },
    },
    {
      accessorKey: "firstSeen",
      header: "首次出现",
      cell: ({ row }) => (
        <span className="tabular-nums text-xs text-muted-foreground">{row.original.firstSeen}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="link" size="sm" onClick={() => setActive(row.original)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* 顶部 severity 统计条 */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {SEVERITIES.map((s) => (
          <Card key={s} variant="outline">
            <CardBody className="p-4">
              <Stat label={SEVERITY_META[s].label} value={counts[s]} />
            </CardBody>
          </Card>
        ))}
      </div>

      <ProTable<Finding>
        title="问题中心"
        columns={columns}
        data={paged}
        getRowId={(r) => r.id}
        toolbarActions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-32">
              <Select
                value={severity}
                onValueChange={(v) => {
                  setSeverity((v as string) ?? "");
                  setPage(1);
                }}
              >
                <SelectTrigger size="sm" />
                <SelectContent>
                  <SelectItem value="">全部级别</SelectItem>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SEVERITY_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Select
                value={type}
                onValueChange={(v) => {
                  setType((v as string) ?? "");
                  setPage(1);
                }}
              >
                <SelectTrigger size="sm" />
                <SelectContent>
                  <SelectItem value="">全部类型</SelectItem>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select
                value={repoId}
                onValueChange={(v) => {
                  setRepoId((v as string) ?? "");
                  setPage(1);
                }}
              >
                <SelectTrigger size="sm" />
                <SelectContent>
                  <SelectItem value="">全部仓库</SelectItem>
                  {REPOS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus((v as string) ?? "");
                  setPage(1);
                }}
              >
                <SelectTrigger size="sm" />
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        }
        pagination={{ page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}
      />

      <Drawer open={active != null} onOpenChange={(o) => !o && setActive(null)}>
        <DrawerContent
          side="right"
          title={active ? active.rule : ""}
          footer={
            active ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => applyStatus(active, "fixed")}>
                  标记已修
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyStatus(active, "ignored")}>
                  忽略
                </Button>
                <Button variant="outline" tone="danger" size="sm" onClick={() => applyStatus(active, "wontfix")}>
                  标误报
                </Button>
                <DrawerClose
                  render={
                    <Button variant="ghost" size="sm">
                      关闭
                    </Button>
                  }
                />
              </div>
            ) : null
          }
        >
          {active ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone={SEVERITY_META[active.severity].tone} size="sm" dot>
                  {SEVERITY_META[active.severity].label}
                </Tag>
                <Tag tone="neutral" size="sm">
                  {TYPE_LABEL[active.type]}
                </Tag>
                <Tag tone={STATUS_META[active.status].tone} size="sm">
                  {STATUS_META[active.status].label}
                </Tag>
              </div>

              <section className="flex flex-col gap-1.5">
                <h4 className="text-sm font-medium text-foreground">问题描述</h4>
                <p className="text-sm text-muted-foreground">{active.ruleDesc}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {active.file}:{active.line} ·{" "}
                  <Link
                    href={`/demos/hanreview/reviews/${active.reviewId}`}
                    className="text-primary hover:underline"
                  >
                    {active.reviewId}
                  </Link>
                </p>
              </section>

              <section className="flex flex-col gap-1.5">
                <h4 className="text-sm font-medium text-foreground">问题代码</h4>
                <CodeBlock code={active.snippet} lang={langOf(active.file)} />
              </section>

              {active.suggestion ? (
                <section className="flex flex-col gap-1.5">
                  <h4 className="text-sm font-medium text-foreground">建议修复</h4>
                  <CodeDiff
                    oldText={active.suggestion.oldText ?? ""}
                    newText={active.suggestion.newText}
                    filename={active.file}
                  />
                </section>
              ) : null}
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
