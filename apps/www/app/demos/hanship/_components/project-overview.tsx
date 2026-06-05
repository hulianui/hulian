"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, RotateCcw, RefreshCw, Globe, Rocket, GitBranch } from "lucide-react";
import {
  Breadcrumb,
  Button,
  Card,
  CardBody,
  CardHeader,
  Empty,
  Result,
  Segmented,
  Skeleton,
  Switch,
  Table,
  Tag,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Popconfirm,
  toast,
  GitCommit,
  DeployStatus,
  RelativeTime,
  type ColumnDef,
} from "@hulianui/ui";
import { projectById, deploysOf, domainsOf } from "../_data/store";
import type { Deploy } from "../_data/types";
import { agoDate, formatDuration } from "../_lib/format";
import { useMockData, usePending } from "../../lib/async";
import { ROOT } from "./nav-config";

function EnvTag({ env }: { env: Deploy["env"] }) {
  return env === "production" ? (
    <Tag tone="success" size="sm">
      生产
    </Tag>
  ) : (
    <Tag tone="warning" size="sm">
      预览
    </Tag>
  );
}

export function ProjectOverview({ id }: { id: string }) {
  const router = useRouter();
  const project = projectById(id);
  const { data, loading } = useMockData<Deploy[]>(project ? deploysOf(id) : []);
  const [deploys, setDeploys] = useState<Deploy[] | null>(null);
  const [autoDeploy, setAutoDeploy] = useState(project?.autoDeploy ?? true);
  const [envFilter, setEnvFilter] = useState("all");
  const [pending, run] = usePending();

  const list = deploys ?? data ?? [];
  const current = useMemo(() => list.find((d) => d.current) ?? null, [list]);
  const filtered = useMemo(
    () => (envFilter === "all" ? list : list.filter((d) => d.env === envFilter)),
    [list, envFilter],
  );

  if (!project) {
    return (
      <Result status="404" title="项目不存在" subTitle="该项目可能已被删除或迁移。">
        <Button onClick={() => router.push(ROOT)}>
          <ArrowLeft className="size-4" />
          返回项目列表
        </Button>
      </Result>
    );
  }

  const domains = domainsOf(id);

  const rollback = (d: Deploy) =>
    run(() => {
      setDeploys((prev) =>
        (prev ?? list).map((x) => ({ ...x, current: x.id === d.id })),
      );
      toast({ tone: "info", title: "已回滚生产环境", description: `${project.name} 已指向 ${d.sha.slice(0, 8)}（${d.message.slice(0, 20)}…）` });
    });

  const redeploy = (d: Deploy) =>
    run(() => {
      const clone: Deploy = {
        ...d,
        id: `d-${Date.now()}`,
        status: "building",
        agoMin: 0,
        durationSec: null,
        current: false,
      };
      setDeploys((prev) => [clone, ...(prev ?? list)]);
      toast({ tone: "info", title: "已触发重新部署", description: `正在基于 ${d.sha.slice(0, 8)} 重新构建…` });
    });

  const columns: ColumnDef<Deploy, unknown>[] = [
    {
      id: "env",
      header: "环境",
      cell: ({ row }) => <EnvTag env={row.original.env} />,
    },
    {
      id: "source",
      header: "Source",
      cell: ({ row }) => {
        const d = row.original;
        return <GitCommit layout="stacked" sha={d.sha} branch={d.branch} message={d.message} author={d.author} size="sm" />;
      },
    },
    {
      id: "url",
      header: "部署地址",
      cell: ({ row }) => (
        <a
          href={`https://${row.original.url}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-primary"
        >
          {row.original.url}
          <ExternalLink className="size-3 opacity-60" />
        </a>
      ),
    },
    {
      id: "status",
      header: "状态",
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <DeployStatus status={row.original.status} size="sm" />
          <RelativeTime value={agoDate(row.original.agoMin)} className="text-xs text-muted" />
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      meta: { sticky: "right" },
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => router.push(`${ROOT}/deployments/${d.id}`)}>
              查看
            </Button>
            {d.status === "ready" && !d.current && (
              <Popconfirm
                title="回滚到此部署？"
                description={`生产环境将立即指向 ${d.sha.slice(0, 8)}，用户访问的内容随之改变。`}
                okText="回滚"
                cancelText="取消"
                onConfirm={() => rollback(d)}
              >
                <Button size="sm" variant="ghost" tone="danger" disabled={pending}>
                  <RotateCcw className="size-4" />
                  回滚
                </Button>
              </Popconfirm>
            )}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => redeploy(d)} aria-label="重新部署">
                    <RefreshCw className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>基于此提交重新部署</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: "项目", href: ROOT }, { label: project.name }]} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius)] bg-surface-hover text-muted">
            <Rocket className="size-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
              <Tag size="sm" tone="neutral">
                {project.framework}
              </Tag>
            </div>
            <div className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted">
              <GitBranch className="size-3.5" />
              <span className="font-medium text-foreground">{project.productionBranch}</span>
              <span>·</span>
              <span>{project.repo}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.open(`https://${project.prodUrl}`, "_blank")}>
            <ExternalLink className="size-4" />
            访问站点
          </Button>
          {current && (
            <Button disabled={pending} onClick={() => redeploy(current)}>
              <RefreshCw className="size-4" />
              重新部署
            </Button>
          )}
        </div>
      </div>

      {/* 生产环境面板（复刻截图 Production 卡） */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">生产环境</span>
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <RefreshCw className="size-3.5" />
            {autoDeploy ? "已开启自动部署" : "自动部署已关闭"}
            <Switch checked={autoDeploy} onCheckedChange={setAutoDeploy} aria-label="自动部署" />
          </span>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Globe className="size-4" />
              域名:
            </span>
            <a href={`https://${project.prodUrl}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {project.prodUrl}
            </a>
            {domains
              .filter((dm) => dm.host !== project.prodUrl)
              .map((dm) => (
                <a key={dm.id} href={`https://${dm.host}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {dm.host}
                </a>
              ))}
          </div>

          {loading ? (
            <Skeleton className="h-16 w-full rounded-[var(--radius)]" />
          ) : current ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border-l-2 border-l-primary border-border bg-surface/60 p-3.5">
              <div className="min-w-0">
                <GitCommit layout="stacked" sha={current.sha} branch={current.branch} message={current.message} author={current.author} />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-0.5">
                  <DeployStatus status={current.status} />
                  <span className="text-xs text-muted">
                    <RelativeTime value={agoDate(current.agoMin)} /> · 构建 {formatDuration(current.durationSec)}
                  </span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => router.push(`${ROOT}/deployments/${current.id}`)}>
                  详情
                </Button>
              </div>
            </div>
          ) : (
            <Empty size="sm" title="生产环境暂无部署" description="推送到生产分支或手动触发一次部署。" />
          )}
        </CardBody>
      </Card>

      {/* 所有部署 */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-foreground">所有部署</span>
          <Segmented
            size="sm"
            value={envFilter}
            onValueChange={setEnvFilter}
            items={[
              { value: "all", label: "全部" },
              { value: "production", label: "生产" },
              { value: "preview", label: "预览" },
            ]}
            aria-label="按环境筛选"
          />
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-9 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Empty size="sm" title="没有符合筛选的部署" description="切换到「全部」查看所有环境的部署。" />
          ) : (
            <Table columns={columns} data={filtered} enableSorting={false} getRowId={(d) => d.id} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
