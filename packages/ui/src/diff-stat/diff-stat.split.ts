/**
 * 按增删比例把 blocks 格分配为 [绿, 红, 空]。
 * 规则：有增至少 1 绿、有删至少 1 红；零改动全空；绿+红 ≤ blocks。
 */
export function splitBlocks(
  additions: number,
  deletions: number,
  blocks: number,
): { green: number; red: number; empty: number } {
  const total = additions + deletions;
  if (total === 0) return { green: 0, red: 0, empty: blocks };

  let green = Math.round((additions / total) * blocks);
  if (additions > 0 && green === 0) green = 1;
  if (green > blocks) green = blocks;

  let red = blocks - green;
  if (deletions === 0) red = 0;
  if (additions === 0) {
    green = 0;
    red = blocks;
  }
  if (deletions > 0 && red === 0 && green > 0) {
    red = 1;
    if (green + red > blocks) green = blocks - red;
  }

  const empty = Math.max(0, blocks - green - red);
  return { green, red, empty };
}
