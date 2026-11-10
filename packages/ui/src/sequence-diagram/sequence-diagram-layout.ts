import type {
  SequenceIssue,
  SequenceItem,
  SequenceMessage,
  SequenceMessageKind,
  SequenceNote,
  SequenceParticipant,
} from "./sequence-diagram.types";

export type SequenceDirection = "right" | "left" | "self";

/** 一条消息落到网格里的位置。列号从 0 开始。 */
export interface SequenceMessageRow {
  type: "message";
  message: SequenceMessage;
  kind: SequenceMessageKind;
  /** 序号，只算能画出来的消息（注释不算），从 1 开始。 */
  number: number;
  fromIndex: number;
  toIndex: number;
  /** 占据的第一列。 */
  start: number;
  /**
   * 占据的列数。自调用的回环只画在自己这列的右半边，但文案会借用右边一列（若有），
   * 否则半列宽的文案几个字就要折行。
   */
  span: number;
  direction: SequenceDirection;
}

/** 一条注释落到网格里的位置。 */
export interface SequenceNoteRow {
  type: "note";
  note: SequenceNote;
  /** 关联的参与者列，从左到右；一个或两个。 */
  targets: number[];
  start: number;
  span: number;
}

export type SequenceRow = SequenceMessageRow | SequenceNoteRow;

export interface SequenceAnalysis {
  /** 去掉重复 id 之后真正成列的参与者。 */
  participants: SequenceParticipant[];
  rows: SequenceRow[];
  issues: SequenceIssue[];
}

function noteTargets(note: SequenceNote): string[] {
  const over = typeof note.over === "string" ? [note.over] : [...note.over];
  return over[0] === over[1] ? [over[0]] : over;
}

/**
 * 把参与者排成列、把消息与注释摊到行上，同时收集被丢弃的输入。纯函数：不碰 DOM。
 * - 参与者 id 重复：后出现的不成列
 * - 消息 / 注释 id 重复：后出现的不画
 * - 引用不存在的参与者：这条不画，序号跳过它，画出来的序号保持连续
 */
export function analyzeSequence(
  participants: readonly SequenceParticipant[],
  items: readonly SequenceItem[],
): SequenceAnalysis {
  const issues: SequenceIssue[] = [];
  const column = new Map<string, number>();
  const columns: SequenceParticipant[] = [];
  participants.forEach((p, index) => {
    if (column.has(p.id)) {
      issues.push({ code: "duplicate-participant", index, id: p.id });
      return;
    }
    column.set(p.id, columns.length);
    columns.push(p);
  });

  const last = columns.length - 1;
  const seen = new Set<string>();
  const rows: SequenceRow[] = [];
  let number = 0;
  items.forEach((item, index) => {
    if (seen.has(item.id)) {
      issues.push({ code: "duplicate-item", index, id: item.id });
      return;
    }
    seen.add(item.id);
    const refs = item.type === "note" ? noteTargets(item) : [item.from, item.to];
    const missing = refs.find((ref) => !column.has(ref));
    if (missing !== undefined) {
      issues.push({ code: "unknown-participant", index, id: item.id, ref: missing });
      return;
    }
    const cols = refs.map((ref) => column.get(ref)!);
    const start = Math.min(...cols);
    const end = Math.max(...cols);
    if (item.type === "note") {
      rows.push({
        type: "note",
        note: item,
        targets: [...new Set(cols)].sort((a, b) => a - b),
        start,
        span: end - start + 1,
      });
      return;
    }
    const [fromIndex, toIndex] = cols;
    const direction: SequenceDirection =
      fromIndex === toIndex ? "self" : toIndex > fromIndex ? "right" : "left";
    number += 1;
    rows.push({
      type: "message",
      message: item,
      kind: item.kind ?? "sync",
      number,
      fromIndex,
      toIndex,
      start,
      span: direction === "self" ? (fromIndex < last ? 2 : 1) : end - start + 1,
      direction,
    });
  });
  return { participants: columns, rows, issues };
}

/** 只要行。等价于 `analyzeSequence(...).rows`。 */
export function layoutSequence(
  participants: readonly SequenceParticipant[],
  items: readonly SequenceItem[],
): SequenceRow[] {
  return analyzeSequence(participants, items).rows;
}

/** 只要被丢弃的输入，用于在图外提示数据问题。空数组表示数据全部可画。 */
export function validateSequence(
  participants: readonly SequenceParticipant[],
  items: readonly SequenceItem[],
): SequenceIssue[] {
  return analyzeSequence(participants, items).issues;
}
