import type {
  SankeyLaidLink,
  SankeyLaidNode,
  SankeyLayout,
  SankeyLayoutOptions,
  SankeyLink,
  SankeyNode,
} from "./sankey.types";

// 桑基图几何 —— 纯函数（无 DOM / React），便于单测。
//   坐标约定：节点矩形 (x,y) 为左上角；link 用三次贝塞尔 ribbon 描边，width 即流量端口高度。
//   流量比例尺取「全图最大单节点 flow」，跨层一致 → 同 value 在任意层高度相等。

/** 保留 2 位小数，压平 path 串长度（避免亚像素抖动写满 d 属性）。 */
function r(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * 按 links 拓扑给每个节点分层（Kahn 风格松弛）：
 *   layer[target] = max(layer[target], layer[source] + 1)。
 * 显式 node.layer 作为下界种子；有环时步数封顶 = 节点数防死循环。
 * 返回 Map<id, layer>。
 */
export function assignLayers(
  nodes: SankeyNode[],
  links: SankeyLink[],
): Map<string, number> {
  const layer = new Map<string, number>();
  const ids = nodes.map((n) => n.id);
  const idSet = new Set(ids);
  for (const n of nodes) layer.set(n.id, n.layer ?? 0);

  // 只保留两端都在节点集合内、且非自环的边。
  const edges = links.filter(
    (l) => l.source !== l.target && idSet.has(l.source) && idSet.has(l.target),
  );

  for (let iter = 0; iter <= ids.length; iter++) {
    let changed = false;
    for (const e of edges) {
      const want = (layer.get(e.source) ?? 0) + 1;
      if (want > (layer.get(e.target) ?? 0)) {
        layer.set(e.target, want);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return layer;
}

/**
 * 计算桑基图布局。流程：
 *   1. 分层，layers = max(layer)+1。
 *   2. 每节点 flow = max(入流和, 出流和)；用全图最大 flow 作高度比例尺。
 *   3. 每层节点按 flow 比例垂直堆叠（nodePadding 间隔），整层在 height 内居中。
 *   4. 每节点维护出端 / 入端纵向游标，按 link value 切分端口纵坐标。
 *   5. link 用三次贝塞尔 `M sx,sy C mx,sy mx,ty tx,ty`，width = value * 高度比例尺。
 */
export function computeSankeyLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
  opts: SankeyLayoutOptions,
): SankeyLayout {
  const { width, height, nodeWidth, nodePadding } = opts;
  if (nodes.length === 0) return { nodes: [], links: [], layers: 0 };

  const idSet = new Set(nodes.map((n) => n.id));
  const validLinks = links.filter(
    (l) => l.source !== l.target && idSet.has(l.source) && idSet.has(l.target),
  );

  const layerMap = assignLayers(nodes, links);
  let maxLayer = 0;
  for (const n of nodes) maxLayer = Math.max(maxLayer, layerMap.get(n.id) ?? 0);
  const layers = maxLayer + 1;

  // 每节点入 / 出流量和 → flow。
  const inSum = new Map<string, number>();
  const outSum = new Map<string, number>();
  for (const l of validLinks) {
    outSum.set(l.source, (outSum.get(l.source) ?? 0) + l.value);
    inSum.set(l.target, (inSum.get(l.target) ?? 0) + l.value);
  }
  const flowOf = (id: string) =>
    Math.max(inSum.get(id) ?? 0, outSum.get(id) ?? 0);

  // 高度比例尺：全图最大单节点 flow 占满「单层可用高度」的一部分。
  // 单层可用高度 = height - 该层 padding 总和。这里取全局最满层估算（简化为每层独立 padding）。
  let maxFlow = 0;
  for (const n of nodes) maxFlow = Math.max(maxFlow, flowOf(n.id));

  // 按层分组（保 nodes 原序，稳定）。
  const byLayer = new Map<number, SankeyNode[]>();
  for (const n of nodes) {
    const L = layerMap.get(n.id) ?? 0;
    const arr = byLayer.get(L);
    if (arr) arr.push(n);
    else byLayer.set(L, [n]);
  }

  // 为高度比例尺选基准：让流量最大的那一层刚好（含 padding）填满 height。
  let scale = 1;
  if (maxFlow > 0) {
    let tightest = Infinity; // 各层「可用高度 / 流量和」的最小值 = 安全比例尺
    for (const [, arr] of byLayer) {
      const flowSum = arr.reduce((s, n) => s + flowOf(n.id), 0);
      if (flowSum <= 0) continue;
      const avail = Math.max(height - nodePadding * Math.max(arr.length - 1, 0), 1);
      tightest = Math.min(tightest, avail / flowSum);
    }
    scale = Number.isFinite(tightest) ? tightest : 1;
  }
  // 兜底：纯流量为 0 时给节点一个最小高度，避免不可见。
  const MIN_NODE_H = 8;

  // 节点 x：layer * (width - nodeWidth) / (layers-1)，单层时 x=0。
  const layerX = (L: number) =>
    layers > 1 ? (L * (width - nodeWidth)) / (layers - 1) : 0;

  const laidNodes: SankeyLaidNode[] = [];
  const nodeRectById = new Map<string, SankeyLaidNode>();
  const layerKeys = [...byLayer.keys()].sort((a, b) => a - b);
  for (const L of layerKeys) {
    const arr = byLayer.get(L)!;
    const heights = arr.map((n) => {
      const f = flowOf(n.id);
      return f > 0 ? Math.max(f * scale, MIN_NODE_H) : MIN_NODE_H;
    });
    const totalH =
      heights.reduce((s, h) => s + h, 0) +
      nodePadding * Math.max(arr.length - 1, 0);
    let y = (height - totalH) / 2; // 整层垂直居中
    if (y < 0) y = 0;
    const x = layerX(L);
    arr.forEach((n, i) => {
      const laid: SankeyLaidNode = {
        ...n,
        layer: L,
        x,
        y,
        height: heights[i],
      };
      laidNodes.push(laid);
      nodeRectById.set(n.id, laid);
      y += heights[i] + nodePadding;
    });
  }

  // 端口游标：源节点右沿出端、目标节点左沿入端，按 link 顺序切分。
  const outCursor = new Map<string, number>();
  const inCursor = new Map<string, number>();
  for (const n of laidNodes) {
    outCursor.set(n.id, n.y);
    inCursor.set(n.id, n.y);
  }

  const laidLinks: SankeyLaidLink[] = [];
  for (const l of validLinks) {
    const sn = nodeRectById.get(l.source)!;
    const tn = nodeRectById.get(l.target)!;
    const w = maxFlow > 0 ? Math.max(l.value * scale, 1) : 1;
    const so = outCursor.get(l.source)!;
    const to = inCursor.get(l.target)!;
    const sy = so + w / 2; // 源端口纵向中点
    const ty = to + w / 2; // 目标端口纵向中点
    outCursor.set(l.source, so + w);
    inCursor.set(l.target, to + w);

    const sx = sn.x + nodeWidth; // 源右沿
    const tx = tn.x; // 目标左沿
    const mx = (sx + tx) / 2;
    const path = `M ${r(sx)},${r(sy)} C ${r(mx)},${r(sy)} ${r(mx)},${r(ty)} ${r(tx)},${r(ty)}`;
    laidLinks.push({ ...l, path, width: w, sy, ty });
  }

  return { nodes: laidNodes, links: laidLinks, layers };
}
