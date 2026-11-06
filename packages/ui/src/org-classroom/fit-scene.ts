/**
 * Fit a transformed scene into the width that is actually available.
 * `naturalWidth` / `naturalHeight` are the axis-aligned size AFTER rotate, at scale 1.
 * Returns null when there is nothing to measure yet (jsdom, first frame).
 */
export function fitScene(
  naturalWidth: number,
  naturalHeight: number,
  availableWidth: number,
): { scale: number; height: number } | null {
  if (!(naturalWidth > 0) || !(naturalHeight > 0) || !(availableWidth > 0)) return null;
  const scale = Math.min(1, availableWidth / naturalWidth);
  return { scale, height: Math.ceil(naturalHeight * scale) };
}

export type LabelBox = { id: string; x: number; y: number; w: number; h: number };

function overlaps(a: LabelBox, b: LabelBox, gap: number) {
  return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;
}

/**
 * Keep name plates off the furniture.
 * Labels may move up, never down onto a desk. `x`/`y` are each box's top-left.
 */
export function liftLabels(labels: readonly LabelBox[], obstacles: readonly LabelBox[], gap = 4): LabelBox[] {
  const next = separateLabels(labels, gap);
  for (let pass = 0; pass < 32; pass += 1) {
    let moved = false;
    for (const label of next) {
      for (const block of obstacles) {
        if (!overlaps(label, block, gap)) continue;
        const nextY = block.y - gap - label.h;
        if (nextY < label.y) {
          label.y = nextY;
          moved = true;
        }
      }
    }
    for (let i = 0; i < next.length; i += 1) {
      for (let j = i + 1; j < next.length; j += 1) {
        const a = next[i]!;
        const b = next[j]!;
        if (!overlaps(a, b, gap)) continue;
        const lower = a.y >= b.y ? a : b;
        const upper = lower === a ? b : a;
        const nextY = upper.y - gap - lower.h;
        if (nextY < lower.y) {
          lower.y = nextY;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return next;
}

/** Push screen-space name/status labels apart. `x`/`y` are the top-left of each box. */
export function separateLabels(boxes: readonly LabelBox[], gap = 2): LabelBox[] {
  const next = boxes.map((box) => ({ ...box }));
  for (let pass = 0; pass < 12; pass += 1) {
    let moved = false;
    for (let i = 0; i < next.length; i += 1) {
      for (let j = i + 1; j < next.length; j += 1) {
        const a = next[i]!;
        const b = next[j]!;
        const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (overlapX <= 0 || overlapY <= 0) continue;
        moved = true;
        if (overlapX < overlapY) {
          const push = overlapX / 2 + gap / 2;
          if (a.x <= b.x) {
            a.x -= push;
            b.x += push;
          } else {
            b.x -= push;
            a.x += push;
          }
        } else {
          const push = overlapY / 2 + gap / 2;
          if (a.y <= b.y) {
            a.y -= push;
            b.y += push;
          } else {
            b.y -= push;
            a.y += push;
          }
        }
      }
    }
    if (!moved) break;
  }
  return next;
}
