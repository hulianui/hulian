"use client";
import { copy } from "./project-overview.content";
import { DEMO_RELATIVE_TIME_LOCALE, demoLocationHref } from "../../_components/demo-locale";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  RotateCcw,
  RefreshCw,
  Globe,
  Rocket,
  GitBranch,
} from "lucide-react";
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

const frameworkLabel = (framework: string) =>
  framework === "静态站点" ? copy("staticSite") : framework;

function EnvTag({ env }: { env: Deploy["env"] }) {
  return env === "production" ? (
    <Tag tone="success" size="sm">
      {copy("produce")}
    </Tag>
  ) : (
    <Tag tone="warning" size="sm">
      {copy("preview")}
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
      <Result
        status="404"
        title={copy("projectDoesNotExist")}
        subTitle={copy("theItemMayHaveBeenDeletedOr")}
      >
        <Button onClick={() => router.push(ROOT)}>
          <ArrowLeft className="size-4" />
          {copy("returnToProjectList")}
        </Button>
      </Result>
    );
  }

  const domains = domainsOf(id);
  const localePath = demoLocationHref("/");
  const productionHref = `https://${project.prodUrl}${
    project.prodUrl === "hulianui.haloritual.com" && localePath !== "/" ? localePath : ""
  }`;

  const rollback = (d: Deploy) =>
    run(() => {
      setDeploys((prev) => (prev ?? list).map((x) => ({ ...x, current: x.id === d.id })));
      toast({
        tone: "success",
        title: copy("rolledBackToProductionEnvironment"),
        description: copy(
          "valueAlreadyPointsToValueValue",
          project.name,
          d.sha.slice(0, 8),
          d.message.slice(0, 20),
        ),
      });
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
      toast({
        tone: "info",
        title: copy("redeploymentTriggered"),
        description: copy("rebuildingBasedOnValue", d.sha.slice(0, 8)),
      });
    });

  const columns: ColumnDef<Deploy, unknown>[] = [
    {
      id: "env",
      header: copy("environment"),
      cell: ({ row }) => <EnvTag env={row.original.env} />,
    },
    {
      id: "source",
      header: "Source",
      cell: ({ row }) => {
        const d = row.original;
        return (
          <GitCommit
            layout="stacked"
            sha={d.sha}
            branch={d.branch}
            message={d.message}
            author={d.author}
            size="sm"
          />
        );
      },
    },
    {
      id: "url",
      header: copy("deploymentAddress"),
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
      header: copy("status"),
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <DeployStatus status={row.original.status} size="sm" />
          <RelativeTime
            value={agoDate(row.original.agoMin)}
            locale={DEMO_RELATIVE_TIME_LOCALE}
            className="text-xs text-muted"
          />
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
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`${ROOT}/deployments/${d.id}`)}
            >
              {copy("view")}
            </Button>
            {d.status === "ready" && !d.current && (
              <Popconfirm
                title={copy("rollBackToThisDeployment")}
                description={copy(
                  "theProductionEnvironmentWillImmediatelyPointTo",
                  d.sha.slice(0, 8),
                )}
                okText={copy("rollback")}
                cancelText={copy("cancel")}
                onConfirm={() => rollback(d)}
              >
                <Button size="sm" variant="ghost" tone="danger" disabled={pending}>
                  <RotateCcw className="size-4" />
                  {copy("rollback2")}
                </Button>
              </Popconfirm>
            )}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => redeploy(d)}
                    aria-label={copy("redeploy")}
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>{copy("redeployBasedOnThisCommit")}</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[{ label: copy("project"), href: demoLocationHref(ROOT) }, { label: project.name }]}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius)] bg-surface-hover text-muted">
            <Rocket className="size-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
              <Tag size="sm" tone="neutral">
                {frameworkLabel(project.framework)}
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
          <Button
            variant="outline"
            onClick={() => window.open(`https://${project.prodUrl}`, "_blank")}
          >
            <ExternalLink className="size-4" />
            {copy("visitSite")}
          </Button>
          {current && (
            <Button disabled={pending} onClick={() => redeploy(current)}>
              <RefreshCw className="size-4" />
              {copy("redeploy2")}
            </Button>
          )}
        </div>
      </div>

      {/* 生产环境面板（复刻截图 Production 卡） */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">{copy("productionEnvironment")}</span>
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <RefreshCw className="size-3.5" />
            {autoDeploy
              ? copy("automaticDeploymentIsTurnedOn")
              : copy("automaticDeploymentIsTurnedOff")}
            <Switch
              checked={autoDeploy}
              onCheckedChange={setAutoDeploy}
              aria-label={copy("automaticDeployment")}
            />
          </span>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Globe className="size-4" />
              {copy("domainName")}
            </span>
            <a
              href={productionHref}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {project.prodUrl}
            </a>
            {domains
              .filter((dm) => dm.host !== project.prodUrl)
              .map((dm) => (
                <a
                  key={dm.id}
                  href={`https://${dm.host}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {dm.host}
                </a>
              ))}
          </div>

          {loading ? (
            <Skeleton className="h-16 w-full rounded-[var(--radius)]" />
          ) : current ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border-l-2 border-l-primary border-border bg-surface/60 p-3.5">
              <div className="min-w-0">
                <GitCommit
                  layout="stacked"
                  sha={current.sha}
                  branch={current.branch}
                  message={current.message}
                  author={current.author}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-0.5">
                  <DeployStatus status={current.status} />
                  <span className="text-xs text-muted">
                    <RelativeTime
                      value={agoDate(current.agoMin)}
                      locale={DEMO_RELATIVE_TIME_LOCALE}
                    />
                    {copy("build")}
                    {formatDuration(current.durationSec)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`${ROOT}/deployments/${current.id}`)}
                >
                  {copy("details")}
                </Button>
              </div>
            </div>
          ) : (
            <Empty
              size="sm"
              title={copy("thereIsNoDeploymentInTheProduction")}
              description={copy("pushToProductionBranchOrManuallyTrigger")}
            />
          )}
        </CardBody>
      </Card>

      {/* 所有部署 */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-foreground">{copy("allDeployments")}</span>
          <Segmented
            size="sm"
            value={envFilter}
            onValueChange={setEnvFilter}
            items={[
              { value: "all", label: copy("all") },
              { value: "production", label: copy("produce2") },
              { value: "preview", label: copy("preview2") },
            ]}
            aria-label={copy("filterByEnvironment")}
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
            <Empty
              size="sm"
              title={copy("noDeploymentsMatchedTheFilter")}
              description={copy("switchToAllToViewDeploymentsFor")}
            />
          ) : (
            <Table columns={columns} data={filtered} enableSorting={false} getRowId={(d) => d.id} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
