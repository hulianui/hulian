// 直播实时引擎：纯 reducer（可单测）。随机性由 action 携带的 seed + mulberry32 派生 → 确定性可复现。
// 范式参照 customer-service：纯 reducer + 定时器 hook（见 use-live-sim.ts）。
import type { DanmakuItem } from "@hulian/ui";
import type { GiftEvent } from "@hulian/ui";
import type { LiveChatItem } from "@hulian/ui";
import {
  AI_ACTIONS,
  AI_REPLIES,
  AI_TIPS,
  DANMAKU_POOL,
  DEFAULT_REPLY,
  GIFTS,
  QUESTION_POOL,
  VIEWER_NAMES,
} from "../_data/content";
import type { AiSuggestion } from "../_data/types";
import { mulberry32 } from "./rng";

export interface LiveState {
  viewers: number;
  likes: number;
  comments: number;
  /** 成交额（元）。 */
  sales: number;
  danmaku: DanmakuItem[];
  chat: LiveChatItem[];
  gifts: GiftEvent[];
  suggestions: AiSuggestion[];
  /** 当前礼物连击分组（id + 计数）。 */
  combo: { id: string; count: number } | null;
  tick: number;
}

export type LiveAction =
  | { type: "TICK_DANMAKU"; seed: number }
  | { type: "TICK_GIFT"; seed: number }
  | { type: "TICK_STATS"; seed: number }
  | { type: "TICK_AI"; seed: number }
  | { type: "LIKE"; n?: number }
  | { type: "SEND_DANMAKU"; id: string; text: string }
  | { type: "SEND_GIFT"; id: string; gift: { name: string; icon: string; color?: string }; combo: number }
  | { type: "ASK_AI"; id: string; question: string }
  | { type: "ADOPT_SUGGESTION"; id: string };

const DM_CAP = 80;
const CHAT_CAP = 120;
const GIFT_CAP = 60;
const SUGGEST_CAP = 6;

export function createInitialState(): LiveState {
  return {
    viewers: 12480,
    likes: 86200,
    comments: 3120,
    sales: 48650,
    danmaku: [],
    chat: [{ id: "sys0", type: "system", text: "欢迎来到瀚选直播间，理性消费，文明发言~" }],
    gifts: [],
    suggestions: [],
    combo: null,
    tick: 0,
  };
}

const pick = <T,>(arr: T[], r: () => number): T => arr[Math.floor(r() * arr.length)];
const capTail = <T,>(arr: T[], cap: number): T[] => (arr.length > cap ? arr.slice(arr.length - cap) : arr);

/** 命中关键词的 AI 答复，未命中走默认。 */
export function replyFor(question: string): string {
  const hit = AI_REPLIES.find((r) => r.match.test(question));
  return hit ? hit.reply : DEFAULT_REPLY;
}

export function reducer(state: LiveState, action: LiveAction): LiveState {
  switch (action.type) {
    case "TICK_DANMAKU": {
      const r = mulberry32(action.seed);
      const name = pick(VIEWER_NAMES, r);
      const roll = r();
      // 偶尔来一条进场 / 关注，丰富公屏类型
      if (roll < 0.12) {
        const enter: LiveChatItem = { id: `e${action.seed}`, type: "enter", user: { name } };
        return { ...state, chat: capTail([...state.chat, enter], CHAT_CAP), tick: state.tick + 1 };
      }
      if (roll < 0.18) {
        const follow: LiveChatItem = { id: `f${action.seed}`, type: "follow", user: { name } };
        return { ...state, chat: capTail([...state.chat, follow], CHAT_CAP), tick: state.tick + 1 };
      }
      const text = pick(DANMAKU_POOL, r);
      const dm: DanmakuItem = {
        id: `d${action.seed}`,
        text,
        mode: roll < 0.22 ? "top" : "scroll",
        color: roll < 0.3 ? "var(--color-chart-1)" : "white",
      };
      const msg: LiveChatItem = {
        id: `m${action.seed}`,
        type: "message",
        user: { name, level: 1 + Math.floor(r() * 40) },
        text,
      };
      return {
        ...state,
        danmaku: capTail([...state.danmaku, dm], DM_CAP),
        chat: capTail([...state.chat, msg], CHAT_CAP),
        comments: state.comments + 1,
        tick: state.tick + 1,
      };
    }

    case "TICK_GIFT": {
      const r = mulberry32(action.seed);
      const name = pick(VIEWER_NAMES, r);
      // 60% 概率延续上一次连击，否则换新礼物分组
      const continueCombo = state.combo && r() < 0.6;
      const groupId = continueCombo ? state.combo!.id : `g${action.seed}`;
      const count = continueCombo ? state.combo!.count + 1 : 1;
      const gift = continueCombo
        ? GIFTS[Math.abs(hashId(groupId)) % GIFTS.length]
        : pick(GIFTS, r);
      const ev: GiftEvent = { id: groupId, user: { name }, gift, combo: count };
      const giftMsg: LiveChatItem = {
        id: `gm${action.seed}`,
        type: "gift",
        user: { name },
        gift: { name: gift.name, icon: gift.icon, combo: count },
      };
      return {
        ...state,
        gifts: capTail([...state.gifts, ev], GIFT_CAP),
        chat: capTail([...state.chat, giftMsg], CHAT_CAP),
        combo: { id: groupId, count },
        sales: state.sales + count * 6,
        tick: state.tick + 1,
      };
    }

    case "TICK_STATS": {
      const r = mulberry32(action.seed);
      const drift = Math.round((r() - 0.4) * 180); // 略偏上涨
      return {
        ...state,
        viewers: Math.max(800, state.viewers + drift),
        sales: state.sales + Math.round(r() * 320),
        tick: state.tick + 1,
      };
    }

    case "TICK_AI": {
      const r = mulberry32(action.seed);
      const roll = r();
      let s: AiSuggestion;
      if (roll < 0.4) {
        const q = pick(QUESTION_POOL, r);
        s = { id: `ai${action.seed}`, kind: "reply", context: q, text: replyFor(q) };
      } else if (roll < 0.7) {
        s = { id: `ai${action.seed}`, kind: "tip", text: pick(AI_TIPS, r) };
      } else {
        const a = pick(AI_ACTIONS, r);
        s = { id: `ai${action.seed}`, kind: "action", text: a.text, tool: a.tool };
      }
      return { ...state, suggestions: capTail([...state.suggestions, s], SUGGEST_CAP), tick: state.tick + 1 };
    }

    case "LIKE":
      return { ...state, likes: state.likes + (action.n ?? 1) };

    case "SEND_DANMAKU": {
      const dm: DanmakuItem = { id: action.id, text: action.text, mode: "scroll", color: "var(--color-chart-3)", bold: true };
      const msg: LiveChatItem = { id: `self-${action.id}`, type: "message", user: { name: "我", level: 18 }, text: action.text };
      return {
        ...state,
        danmaku: capTail([...state.danmaku, dm], DM_CAP),
        chat: capTail([...state.chat, msg], CHAT_CAP),
        comments: state.comments + 1,
      };
    }

    case "SEND_GIFT": {
      const ev: GiftEvent = { id: action.id, user: { name: "我" }, gift: action.gift, combo: action.combo };
      const giftMsg: LiveChatItem = {
        id: `selfg-${action.id}-${action.combo}`,
        type: "gift",
        user: { name: "我" },
        gift: { name: action.gift.name, icon: action.gift.icon, combo: action.combo },
      };
      return {
        ...state,
        gifts: capTail([...state.gifts, ev], GIFT_CAP),
        chat: capTail([...state.chat, giftMsg], CHAT_CAP),
        sales: state.sales + action.combo * 6,
      };
    }

    case "ASK_AI": {
      const s: AiSuggestion = { id: action.id, kind: "reply", context: action.question, text: replyFor(action.question) };
      return { ...state, suggestions: capTail([...state.suggestions, s], SUGGEST_CAP) };
    }

    case "ADOPT_SUGGESTION": {
      const s = state.suggestions.find((x) => x.id === action.id);
      if (!s) return state;
      const suggestions = state.suggestions.map((x) => (x.id === action.id ? { ...x, adopted: true } : x));
      // 答弹幕草稿被采用 → 作为主播回复进公屏
      if (s.kind === "reply") {
        const reply: LiveChatItem = {
          id: `host-${action.id}`,
          type: "message",
          user: { name: "主播", level: 99, badge: "👑" },
          text: s.text,
        };
        return { ...state, suggestions, chat: capTail([...state.chat, reply], CHAT_CAP) };
      }
      return { ...state, suggestions };
    }

    default:
      return state;
  }
}

/** 字符串 → 数字哈希（用于连击分组稳定取礼物）。 */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}
