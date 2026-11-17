// CI 分片的单一判据：`CI_SHARD=2/3` 表示「共 3 片里的第 2 片」。
//
// 为什么按下标轮转（i % total）而不是切连续段：清单通常按字母序排列，相邻条目耗时相近
// （同一族组件、同一类页面），切连续段容易让某一片集中拿到一族重页面；轮转则把每一族
// 均匀撒到各片上。实测 showcase 各路由耗时差异不大，轮转足够均衡，不值得维护耗时表。
//
// 不设 CI_SHARD = 不分片（返回全集）。本地照常跑全量，CI 由 matrix 注入。

/**
 * @param {string | undefined} spec  形如 "1/2"；undefined / 空串 = 不分片
 * @returns {{ index: number; total: number }}  index 从 1 起算
 */
export function parseShard(spec) {
  if (spec == null || spec === "") return { index: 1, total: 1 };
  const match = /^(\d+)\/(\d+)$/.exec(spec.trim());
  if (!match) throw new Error(`CI_SHARD 格式应为 "<第几片>/<总片数>"，实际是 "${spec}"`);
  const index = Number(match[1]);
  const total = Number(match[2]);
  if (total < 1 || index < 1 || index > total) {
    throw new Error(`CI_SHARD 越界："${spec}"（第几片须在 1..总片数 之间）`);
  }
  return { index, total };
}

/** 取本片负责的条目。所有片的结果拼起来恰好是原清单，不重不漏。 */
export function pickShard(items, spec = process.env.CI_SHARD) {
  const { index, total } = parseShard(spec);
  return items.filter((_, i) => i % total === index - 1);
}

/** 只该跑一次的附加检查（如交互用例）挂在第 1 片上。 */
export function isFirstShard(spec = process.env.CI_SHARD) {
  return parseShard(spec).index === 1;
}

/** 日志里标明本片身份，红了能直接看出是哪一片。 */
export function shardLabel(spec = process.env.CI_SHARD) {
  const { index, total } = parseShard(spec);
  return total === 1 ? "" : ` [shard ${index}/${total}]`;
}
