import { copy } from "./snapshot.content";
// 瀚云全球调度指挥中心 · 数据层（全程序化、零外链、确定性）。
// mulberry32 确定性 PRNG：同一 seed 必出同一快照，SSR / 静态导出安全，不用 Date.now()/Math.random()。
import type { WorldMapDot, WorldMapNode } from "@hulianui/ui";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Region = "亚太" | "北美" | "欧洲" | "中东" | "南美" | "非洲";
export type NodeStatus = "正常" | "繁忙" | "告警";
export type EventLevel = "严重" | "警告" | "提示" | "信息";

export const REGION_LABELS: Record<Region, string> = {
  亚太: copy("asiaPacific"),
  北美: copy("northAmerica"),
  欧洲: copy("europe"),
  中东: copy("middleEast"),
  南美: copy("southAmerica"),
  非洲: copy("africa"),
};
export const NODE_STATUS_LABELS: Record<NodeStatus, string> = {
  正常: copy("normal"),
  繁忙: copy("busy"),
  告警: copy("warning"),
};
export const EVENT_LEVEL_LABELS: Record<EventLevel, string> = {
  严重: copy("critical"),
  警告: copy("caution"),
  提示: copy("notice"),
  信息: copy("information"),
};

export interface PopNode {
  id: string;
  city: string;
  region: Region;
  lat: number;
  lng: number;
  /** 负载 %（驱动节点大小 + 状态 + 区域 Meter）。 */
  load: number;
  /** 带宽 Gbps。 */
  bandwidth: number;
  /** 每秒请求。 */
  qps: number;
  /** 平均延迟 ms。 */
  latency: number;
  /** 在线率 %。 */
  uptime: number;
  status: NodeStatus;
}

export interface DashEvent {
  id: string;
  level: EventLevel;
  text: string;
}

export interface Snapshot {
  nodes: PopNode[];
  dots: WorldMapDot[];
  kpis: {
    onlineNodes: number;
    totalBandwidth: number; // Gbps
    totalQps: number;
    avgLatency: number;
    hitRate: number; // %
    linkCount: number;
  };
  /** 24h QPS 折线：请求 / 命中（万次/秒）。 */
  qpsSeries: { hour: string; requests: number; hits: number }[];
  /** 区域带宽对比（Gbps）。 */
  regionBars: { region: string; bandwidth: number }[];
  /** 流量占比（按区域）。 */
  trafficPie: { name: string; value: number }[];
  /** 各大区带宽趋势（堆叠面积，Gbps）。 */
  bandwidthArea: { t: string; asiaPacific: number; northAmerica: number; europe: number }[];
  /** 区域负载（Meter，%）。 */
  regionLoad: { region: Region; load: number }[];
  events: DashEvent[];
}

interface GeoCity {
  id: string;
  city: string;
  region: Region;
  lat: number;
  lng: number;
}

// 13 个真实城市经纬度（含非洲开普敦补满 6 大区）。
export const CITIES: GeoCity[] = [
  { id: "bj", city: copy("beijing"), region: "亚太", lat: 39.9, lng: 116.4 },
  { id: "sh", city: copy("shanghai"), region: "亚太", lat: 31.2, lng: 121.5 },
  { id: "tk", city: copy("tokyo"), region: "亚太", lat: 35.7, lng: 139.7 },
  { id: "sg", city: copy("singapore"), region: "亚太", lat: 1.35, lng: 103.8 },
  { id: "bom", city: copy("mumbai"), region: "亚太", lat: 19.1, lng: 72.9 },
  { id: "syd", city: copy("sydney"), region: "亚太", lat: -33.9, lng: 151.2 },
  { id: "fra", city: copy("frankfurt"), region: "欧洲", lat: 50.1, lng: 8.7 },
  { id: "lon", city: copy("london"), region: "欧洲", lat: 51.5, lng: -0.1 },
  { id: "nyc", city: copy("newYork"), region: "北美", lat: 40.7, lng: -74 },
  { id: "sfo", city: copy("sanFrancisco"), region: "北美", lat: 37.8, lng: -122.4 },
  { id: "gru", city: copy("sOPaulo"), region: "南美", lat: -23.5, lng: -46.6 },
  { id: "dxb", city: copy("dubai"), region: "中东", lat: 25.2, lng: 55.3 },
  { id: "cpt", city: copy("capeTown"), region: "非洲", lat: -33.9, lng: 18.4 },
];

// 跨境调度链路（飞线）：city id 对 + chart token 配色。
const LINKS: [string, string, string][] = [
  ["sh", "fra", "var(--color-chart-1)"],
  ["bj", "nyc", "var(--color-chart-2)"],
  ["sg", "syd", "var(--color-chart-3)"],
  ["fra", "gru", "var(--color-chart-4)"],
  ["sfo", "tk", "var(--color-chart-1)"],
  ["dxb", "bom", "var(--color-chart-2)"],
  ["lon", "nyc", "var(--color-chart-3)"],
  ["cpt", "fra", "var(--color-chart-4)"],
];

const REGIONS: Region[] = ["亚太", "北美", "欧洲", "中东", "南美", "非洲"];

const EVENT_POOL: Omit<DashEvent, "id">[] = [
  { level: "严重", text: copy("thePacketLossRateAtTheTokyoNodeExitHas") },
  { level: "警告", text: copy("frankfurtSOPauloLinkRTTRaisedTo218ms") },
  { level: "提示", text: copy("singaporeComputerRoomExpansionCompletedNewEdgeNodesAreOnline") },
  { level: "信息", text: copy("theWholeNetworkCertificateRotationTaskHasBeenCompletedCovering") },
  { level: "警告", text: copy("dubaiNodeCPULoadIsItIsRecommendedToDivert") },
  { level: "提示", text: copy("cacheHitRateInNorthAmericaRisesBackTo") },
  { level: "信息", text: copy("schedulingPolicyVGrayscaleToTraffic") },
  { level: "严重", text: copy("sOPauloNodeHeartRateDelayOverThresholdDowngraded") },
];

function statusOf(load: number): NodeStatus {
  if (load >= 85) return "告警";
  if (load >= 70) return "繁忙";
  return "正常";
}

/** 节点色：按状态语义着色（告警红 / 繁忙琥珀 / 正常翠绿）。 */
export function nodeColor(status: NodeStatus): string {
  if (status === "告警") return "var(--color-danger)";
  if (status === "繁忙") return "var(--color-chart-3)";
  return "var(--color-chart-2)";
}

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

/** 由 seed 构建一份完整快照。 */
export function buildSnapshot(seed: number): Snapshot {
  const rnd = mulberry32(seed);
  const pick = (min: number, max: number) => min + rnd() * (max - min);

  const nodes: PopNode[] = CITIES.map((c, i) => {
    const load = Math.round(pick(38, 94));
    return {
      ...c,
      load,
      bandwidth: Math.round(pick(120, 980)),
      qps: Math.round(pick(8, 64) * 1000),
      latency: Math.round(pick(12, 160)),
      uptime: Number((99.0 + rnd() * 0.99).toFixed(2)),
      status: statusOf(load),
      // 让首节点偏高负载，飞线更有戏
      ...(i === 1 ? { load: 88, status: "告警" as NodeStatus } : {}),
    };
  });

  const dots: WorldMapDot[] = LINKS.map(([a, b, color]) => {
    const s = CITIES.find((c) => c.id === a)!;
    const e = CITIES.find((c) => c.id === b)!;
    return { start: { lat: s.lat, lng: s.lng }, end: { lat: e.lat, lng: e.lng }, color };
  });

  const regionLoad = REGIONS.map((region) => {
    const rs = nodes.filter((n) => n.region === region);
    const avg = rs.length
      ? Math.round(rs.reduce((a, n) => a + n.load, 0) / rs.length)
      : Math.round(pick(40, 80));
    return { region, load: avg };
  });

  const regionBars = REGIONS.map((region) => {
    const rs = nodes.filter((n) => n.region === region);
    return {
      region: REGION_LABELS[region],
      bandwidth: rs.reduce((a, n) => a + n.bandwidth, 0) || Math.round(pick(200, 600)),
    };
  });

  const trafficPie = regionBars.map((r) => ({ name: r.region, value: r.bandwidth }));

  const qpsSeries = HOURS.map((hour, i) => {
    const base = 18 + Math.sin((i / 24) * Math.PI * 2 - 1.2) * 9 + pick(-1.5, 1.5);
    const requests = Math.max(4, Number(base.toFixed(1)));
    return { hour, requests, hits: Number((requests * (0.9 + rnd() * 0.07)).toFixed(1)) };
  });

  const bandwidthArea = Array.from({ length: 12 }, (_, i) => ({
    t: `${i * 2}h`,
    asiaPacific: Math.round(pick(800, 1500)),
    northAmerica: Math.round(pick(400, 900)),
    europe: Math.round(pick(300, 700)),
  }));

  const events: DashEvent[] = EVENT_POOL.map((e, i) => ({ ...e, id: `e${seed}-${i}` }));

  const onlineNodes = 1200 + Math.round(pick(40, 160));
  const totalBandwidth = nodes.reduce((a, n) => a + n.bandwidth, 0);
  const totalQps = nodes.reduce((a, n) => a + n.qps, 0);
  const avgLatency = Math.round(nodes.reduce((a, n) => a + n.latency, 0) / nodes.length);

  return {
    nodes,
    dots,
    kpis: {
      onlineNodes,
      totalBandwidth,
      totalQps,
      avgLatency,
      hitRate: Number((94 + rnd() * 4).toFixed(1)),
      linkCount: LINKS.length,
    },
    qpsSeries,
    regionBars,
    trafficPie,
    bandwidthArea,
    regionLoad,
    events,
  };
}

/** 实时抖动：基于 tick 的确定性微扰（客户端定时调用，模拟实时刷新）。 */
export function tickSnapshot(prev: Snapshot, tick: number): Snapshot {
  const rnd = mulberry32(tick * 2654435761);
  const jig = (v: number, amp: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Math.round(v + (rnd() - 0.5) * amp)));

  const nodes = prev.nodes.map((n) => {
    const load = jig(n.load, 8, 30, 99);
    return {
      ...n,
      load,
      bandwidth: jig(n.bandwidth, 60, 80, 1100),
      qps: jig(n.qps, 4000, 4000, 70000),
      latency: jig(n.latency, 14, 8, 200),
      status: statusOf(load),
    };
  });

  const regionLoad = prev.regionLoad.map((r) => {
    const rs = nodes.filter((n) => n.region === r.region);
    return {
      ...r,
      load: rs.length ? Math.round(rs.reduce((a, n) => a + n.load, 0) / rs.length) : r.load,
    };
  });

  // QPS 折线整体滚动：丢首点、尾点续新值
  const last = prev.qpsSeries[prev.qpsSeries.length - 1];
  const requests = Math.max(4, Number((last.requests + (rnd() - 0.5) * 3).toFixed(1)));
  const nextHour = `${String((parseInt(last.hour) + 1) % 24).padStart(2, "0")}:00`;
  const qpsSeries = [
    ...prev.qpsSeries.slice(1),
    { hour: nextHour, requests, hits: Number((requests * (0.9 + rnd() * 0.07)).toFixed(1)) },
  ];

  // 偶发新事件（约 1/3 概率），保持队列不超过 8 条
  let events = prev.events;
  if (rnd() < 0.34) {
    const e = EVENT_POOL[Math.floor(rnd() * EVENT_POOL.length)];
    events = [{ ...e, id: `e-live-${tick}` }, ...prev.events].slice(0, 8);
  }

  const totalBandwidth = nodes.reduce((a, n) => a + n.bandwidth, 0);
  const totalQps = nodes.reduce((a, n) => a + n.qps, 0);
  const avgLatency = Math.round(nodes.reduce((a, n) => a + n.latency, 0) / nodes.length);

  return {
    ...prev,
    nodes,
    regionLoad,
    qpsSeries,
    events,
    kpis: {
      ...prev.kpis,
      totalBandwidth,
      totalQps,
      avgLatency,
      onlineNodes: jig(prev.kpis.onlineNodes, 6, 1180, 1400),
      hitRate: Number(
        Math.min(99, Math.max(90, prev.kpis.hitRate + (rnd() - 0.5) * 0.6)).toFixed(1),
      ),
    },
  };
}

/** 节点 → WorldMap 独立节点（value=负载驱动大小，色按状态）。 */
export function toMapNodes(nodes: PopNode[]): WorldMapNode[] {
  return nodes.map((n) => ({
    id: n.id,
    lat: n.lat,
    lng: n.lng,
    label: n.city,
    value: n.load,
    color: nodeColor(n.status),
  }));
}
