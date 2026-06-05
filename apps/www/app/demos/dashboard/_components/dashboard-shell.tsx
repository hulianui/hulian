"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Spinner, toast } from "@hulianui/ui";
import { sleep } from "../../lib/async";
import { buildSnapshot, type Snapshot, tickSnapshot } from "../_data/snapshot";
import { useTicker } from "../_lib/use-live";
import { AlertTicker } from "./alert-ticker";
import { ChartStack, BandwidthArea } from "./chart-stack";
import { GlobePanel } from "./globe-panel";
import { HeaderBar, type DataSource } from "./header-bar";
import { KpiRail } from "./kpi-rail";
import { NodeDrawer } from "./node-drawer";
import { RegionMeters } from "./region-meters";

const SEED = 20260605;

export function DashboardShell() {
  const [source, setSource] = useState<DataSource>("正常");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [running, setRunning] = useState(true);

  // 下钻
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSnap(null);
    await sleep(620); // 让 Skeleton 加载帧肉眼可见（≥300ms）
    if (source === "异常") {
      setError("数据源「异常」：调度中心心跳超时，实时指标拉取失败。请切回「正常」或稍后重试。");
      setLoading(false);
      return;
    }
    setSnap(buildSnapshot(SEED));
    setLoading(false);
  }, [source]);

  useEffect(() => {
    void load();
  }, [load]);

  // 实时刷新：base 就绪后每 3s 推进
  const live = useTicker(snap, tickSnapshot, { running, intervalMs: 3000 });
  const view = live ?? snap;

  const pickedNode = useMemo(
    () => (pickedId ? (view?.nodes.find((n) => n.id === pickedId) ?? null) : null),
    [pickedId, view],
  );

  const handlePick = (nodeId: string) => {
    setPickedId(nodeId);
    setDrawerOpen(true);
  };

  const handleSource = (s: DataSource) => {
    setSource(s);
    toast({ title: `已切换数据源：${s}`, tone: s === "异常" ? "danger" : "info" });
  };

  const handleRefresh = () => {
    void load();
    toast({ title: "正在刷新实时指标…", tone: "info" });
  };

  const handleToggleRunning = (next: boolean) => {
    setRunning(next);
    toast({ title: next ? "已恢复实时刷新" : "已停止实时刷新", tone: next ? "info" : "neutral" });
  };

  return (
    <div className="flex h-full w-full flex-col text-foreground">
      <HeaderBar
        source={source}
        onSourceChange={handleSource}
        running={running}
        onToggleRunning={handleToggleRunning}
        onRefresh={handleRefresh}
        refreshing={loading}
      />
      <AlertTicker events={view?.events ?? []} />

      {error ? (
        <div className="grid flex-1 place-items-center p-8">
          <Alert
            tone="danger"
            className="max-w-xl"
            title="实时数据源异常"
            action={
              <Button size="sm" variant="ghost" onClick={() => void load()}>
                {loading ? <Spinner size="sm" /> : "重试"}
              </Button>
            }
          >
            {error}
          </Alert>
        </div>
      ) : (
        <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[340px_1fr_400px]">
          <div className="min-h-0">
            <KpiRail snapshot={view} loading={loading} />
          </div>

          <div className="flex min-h-0 flex-col gap-3">
            <GlobePanel snapshot={view} loading={loading} onPick={handlePick} />
            <BandwidthArea snapshot={view} loading={loading} />
          </div>

          <div className="min-h-0">
            <ChartStack snapshot={view} loading={loading} />
          </div>
        </main>
      )}

      <div className="px-3 pb-3">
        <RegionMeters snapshot={view} loading={loading} />
      </div>

      <NodeDrawer node={pickedNode} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
