import type { QueueItem, QueueLaneDef, QueueLaneGroup } from "./queue-lane.types";

/**
 * 按 lane 把 items 分组成有序队列（纯函数，便于单测）。
 *  · 输出顺序 = lanes 给定顺序（保序）。
 *  · 每道道内顺序 = items 数组原始顺序（FIFO，队首在前）。
 *  · laneId 未命中任何 lane 的 item 直接丢弃（队列监视器只展示已知泳道，不臆造 misc 道）。
 *  · 空道返回空 items 数组（不会被省略）。
 */
export function groupByLane<T extends QueueItem = QueueItem>(
  items: T[],
  lanes: QueueLaneDef[],
): QueueLaneGroup<T>[] {
  const buckets = new Map<string, T[]>();
  for (const lane of lanes) buckets.set(lane.id, []);
  for (const item of items) {
    const bucket = buckets.get(item.laneId);
    if (bucket) bucket.push(item); // 未知 laneId → 无桶 → 丢弃
  }
  return lanes.map((lane) => ({ lane, items: buckets.get(lane.id)! }));
}
