// 瀚云全球调度指挥中心 · 数据层（全程序化、零外链、确定性）。
// mulberry32 确定性 PRNG：同一 seed 必出同一快照，SSR / 静态导出安全，不用 Date.now()/Math.random()。
import type { WorldMapDot, WorldMapNode } from "@hulian/ui";

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
  level: "严重" | "警告" | "提示" | "信息";
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
  qpsSeries: { hour: string; 请求: number; 命中: number }[];
  /** 区域带宽对比（Gbps）。 */
  regionBars: { region: string; 带宽: number }[];
  /** 流量占比（按区域）。 */
  trafficPie: { name: string; value: number }[];
  /** 各大区带宽趋势（堆叠面积，Gbps）。 */
  bandwidthArea: { t: string; 亚太: number; 北美: number; 欧洲: number }[];
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
  { id: "bj", city: "北京", region: "亚太", lat: 39.9, lng: 116.4 },
  { id: "sh", city: "上海", region: "亚太", lat: 31.2, lng: 121.5 },
  { id: "tk", city: "东京", region: "亚太", lat: 35.7, lng: 139.7 },
  { id: "sg", city: "新加坡", region: "亚太", lat: 1.35, lng: 103.8 },
  { id: "bom", city: "孟买", region: "亚太", lat: 19.1, lng: 72.9 },
  { id: "syd", city: "悉尼", region: "亚太", lat: -33.9, lng: 151.2 },
  { id: "fra", city: "法兰克福", region: "欧洲", lat: 50.1, lng: 8.7 },
  { id: "lon", city: "伦敦", region: "欧洲", lat: 51.5, lng: -0.1 },
  { id: "nyc", city: "纽约", region: "北美", lat: 40.7, lng: -74 },
  { id: "sfo", city: "旧金山", region: "北美", lat: 37.8, lng: -122.4 },
  { id: "gru", city: "圣保罗", region: "南美", lat: -23.5, lng: -46.6 },
  { id: "dxb", city: "迪拜", region: "中东", lat: 25.2, lng: 55.3 },
  { id: "cpt", city: "开普敦", region: "非洲", lat: -33.9, lng: 18.4 },
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
  { level: "严重", text: "东京节点出口丢包率突增至 4.2%，已触发自动切流" },
  { level: "警告", text: "法兰克福 ↔ 圣保罗 链路 RTT 抬升至 218ms" },
  { level: "提示", text: "新加坡机房扩容完成，新增 12 台边缘节点已上线" },
  { level: "信息", text: "全网证书轮换任务已完成，覆盖 13 个区域" },
  { level: "警告", text: "迪拜节点 CPU 负载达 86%，建议分流孟买" },
  { level: "提示", text: "北美大区缓存命中率回升至 96.4%" },
  { level: "信息", text: "调度策略 v2.7 已灰度至 30% 流量" },
  { level: "严重", text: "圣保罗节点心跳延迟超阈值，降级为只读" },
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
    const avg = rs.length ? Math.round(rs.reduce((a, n) => a + n.load, 0) / rs.length) : Math.round(pick(40, 80));
    return { region, load: avg };
  });

  const regionBars = REGIONS.map((region) => {
    const rs = nodes.filter((n) => n.region === region);
    return { region, 带宽: rs.reduce((a, n) => a + n.bandwidth, 0) || Math.round(pick(200, 600)) };
  });

  const trafficPie = regionBars.map((r) => ({ name: r.region, value: r.带宽 }));

  const qpsSeries = HOURS.map((hour, i) => {
    const base = 18 + Math.sin((i / 24) * Math.PI * 2 - 1.2) * 9 + pick(-1.5, 1.5);
    const 请求 = Math.max(4, Number(base.toFixed(1)));
    return { hour, 请求, 命中: Number((请求 * (0.9 + rnd() * 0.07)).toFixed(1)) };
  });

  const bandwidthArea = Array.from({ length: 12 }, (_, i) => ({
    t: `${i * 2}h`,
    亚太: Math.round(pick(800, 1500)),
    北美: Math.round(pick(400, 900)),
    欧洲: Math.round(pick(300, 700)),
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
    return { ...r, load: rs.length ? Math.round(rs.reduce((a, n) => a + n.load, 0) / rs.length) : r.load };
  });

  // QPS 折线整体滚动：丢首点、尾点续新值
  const last = prev.qpsSeries[prev.qpsSeries.length - 1];
  const 请求 = Math.max(4, Number((last.请求 + (rnd() - 0.5) * 3).toFixed(1)));
  const nextHour = `${String((parseInt(last.hour) + 1) % 24).padStart(2, "0")}:00`;
  const qpsSeries = [
    ...prev.qpsSeries.slice(1),
    { hour: nextHour, 请求, 命中: Number((请求 * (0.9 + rnd() * 0.07)).toFixed(1)) },
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
      hitRate: Number(Math.min(99, Math.max(90, prev.kpis.hitRate + (rnd() - 0.5) * 0.6)).toFixed(1)),
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
