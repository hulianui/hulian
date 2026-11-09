import type {
  SequenceMessage,
  SequenceMessageKind,
  SequenceParticipant,
} from "./sequence-diagram.types";

export type SequenceDirection = "right" | "left" | "self";

/** 一条消息落到网格里的位置。列号从 0 开始。 */
export interface SequenceRow {
  message: SequenceMessage;
  kind: SequenceMessageKind;
  /** 序号，只算能画出来的消息，从 1 开始。 */
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

/**
 * 把消息摊到参与者列上。纯函数：不碰 DOM，方便单测。
 * 引用了不存在参与者的消息被丢掉，序号跳过它们，保证画出来的序号连续。
 */
export function layoutSequence(
  participants: SequenceParticipant[],
  messages: SequenceMessage[],
): SequenceRow[] {
  const column = new Map<string, number>();
  participants.forEach((p, i) => {
    if (!column.has(p.id)) column.set(p.id, i);
  });
  const last = participants.length - 1;
  const rows: SequenceRow[] = [];
  for (const message of messages) {
    const fromIndex = column.get(message.from);
    const toIndex = column.get(message.to);
    if (fromIndex === undefined || toIndex === undefined) continue;
    const direction: SequenceDirection =
      fromIndex === toIndex ? "self" : toIndex > fromIndex ? "right" : "left";
    rows.push({
      message,
      kind: message.kind ?? "sync",
      number: rows.length + 1,
      fromIndex,
      toIndex,
      start: Math.min(fromIndex, toIndex),
      span: direction === "self" ? (fromIndex < last ? 2 : 1) : Math.abs(toIndex - fromIndex) + 1,
      direction,
    });
  }
  return rows;
}
