/**
 * Fit a transformed scene into the width that is actually available.
 * `naturalWidth` / `naturalHeight` are the axis-aligned size AFTER rotate, at scale 1.
 * Returns null when there is nothing to measure yet (jsdom, first frame).
 */
/** Shrink an already-scaled scene so its painted width, including labels, fits. */
export function containScale(contentWidth: number, availableWidth: number, currentScale: number) {
  if (!(contentWidth > 0) || !(availableWidth > 0) || !(currentScale > 0)) return currentScale;
  if (contentWidth <= availableWidth) return currentScale;
  return currentScale * (availableWidth / contentWidth);
}

/** Screen size of a seated figure when the floor itself is scaled down. */
export function figureScaleFor(sceneScale: number) {
  if (!(sceneScale > 0)) return 1;
  return Math.min(1.6, Math.max(1, 0.92 / sceneScale));
}

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
 * Keep each chip next to the seat it was anchored to.
 * Sideways nudges separate neighbors. A chip may rise only `maxLift` pixels,
 * and only to clear its own desk — never the whole field.
 */
export function parkLabels(
  labels: readonly LabelBox[],
  ownDesks: readonly LabelBox[],
  gap = 3,
  maxLift = 18,
): LabelBox[] {
  const originY = new Map(labels.map((box) => [box.id, box.y]));
  const originX = new Map(labels.map((box) => [box.id, box.x]));
  const next = labels.map((box) => ({ ...box }));
  const clampY = (id: string, y: number) => Math.max(originY.get(id)! - maxLift, y);
  const clampX = (id: string, x: number) => Math.min(originX.get(id)! + 72, Math.max(originX.get(id)! - 72, x));

  for (let pass = 0; pass < 24; pass += 1) {
    let moved = false;
    for (let i = 0; i < next.length; i += 1) {
      for (let j = i + 1; j < next.length; j += 1) {
        const a = next[i]!;
        const b = next[j]!;
        if (!overlaps(a, b, gap)) continue;
        const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        const push = overlapX / 2 + gap / 2;
        const ax = clampX(a.id, a.x <= b.x ? a.x - push : a.x + push);
        const bx = clampX(b.id, a.x <= b.x ? b.x + push : b.x - push);
        if (ax !== a.x || bx !== b.x) {
          a.x = ax;
          b.x = bx;
          moved = true;
        } else if (overlapY > 0) {
          const lower = a.y >= b.y ? a : b;
          const nextY = clampY(lower.id, lower.y - overlapY - gap);
          if (nextY < lower.y - 0.5) {
            lower.y = nextY;
            moved = true;
          }
        }
      }
    }
    for (const label of next) {
      const desk = ownDesks.find((item) => item.id === label.id);
      if (!desk || !overlaps(label, desk, gap)) continue;
      const nextY = clampY(label.id, desk.y - gap - label.h);
      if (nextY < label.y - 0.5) {
        label.y = nextY;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return next;
}

/** A chip may sit on its own head, not on somebody else's. */
export function avoidForeignHeads(labels: readonly LabelBox[], heads: readonly LabelBox[], gap = 2): LabelBox[] {
  const next = labels.map((box) => ({ ...box }));
  for (const label of next) {
    if (label.id.startsWith("zone-")) continue;
    for (const head of heads) {
      if (head.id === label.id || !overlaps(label, head, gap)) continue;
      const above = head.y - gap - label.h;
      const below = head.y + head.h + gap;
      label.y = Math.abs(label.y - above) <= Math.abs(label.y - below) ? above : below;
      if (overlaps(label, head, gap)) label.x = head.x + head.w + gap;
    }
  }
  return next;
}

/** Place chips inside the frame without letting neighbors cover each other. */
export function resolveLabelOverlaps(labels: readonly LabelBox[], frameWidth: number, gap = 4): LabelBox[] {
  const edge = 4;
  const originY = new Map(labels.map((box) => [box.id, box.y]));
  const next = labels.map((box) => ({ ...box })).sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: LabelBox[] = [];
  for (const label of next) {
    let guard = 0;
    while (placed.some((other) => overlaps(label, other, gap)) && guard < 16) {
      const other = placed.find((item) => overlaps(label, item, gap))!;
      const shifted = other.x + other.w + gap;
      if (shifted + label.w <= frameWidth - edge) {
        label.x = shifted;
      } else {
        label.x = edge;
        const ceiling = originY.get(label.id)! + label.h + gap;
        label.y = Math.min(ceiling, other.y + other.h + gap);
      }
      guard += 1;
    }
    label.x = Math.max(edge, Math.min(label.x, Math.max(edge, frameWidth - label.w - edge)));
    placed.push(label);
  }
  return placed;
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
